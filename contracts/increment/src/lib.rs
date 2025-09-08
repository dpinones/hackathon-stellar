#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Vec, Address, contracterror, token, symbol_short};

// Import the Reflector code
mod reflector;
use crate::reflector::{ReflectorClient, Asset as ReflectorAsset};

#[contract]
pub struct Contract;

// Types of Error we use
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NoPrice = 1,
    LowBalance = 2,
    InsufficientFunds = 3,
    NoActiveRound = 4,
    RoundNotSettled = 5,
    RoundAlreadySettled = 6,
    BettingClosed = 7,
    InvalidPrediction = 8,
    NoWinnings = 9,
    OracleTimeout = 10,
}

// Prediction types for ARS price movement
#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Prediction {
    Up,     // ARS goes up > +0.05%
    Down,   // ARS goes down < -0.05%
    Stable, // ARS stays between -0.05% and +0.05%
}

// Data Structure for representing a bet
#[contracttype]
#[derive(Clone)]
pub struct Bet {
    pub user: Address,
    pub prediction: Prediction,
    pub amount: i128,
}

// Data Structure for representing a lottery round
#[contracttype]
#[derive(Clone)]
pub struct Round {
    pub round_number: u32,
    pub start_time: u64,
    pub start_price: i128,
    pub end_price: Option<i128>,
    pub bets: Vec<Bet>,
    pub is_settled: bool,
    pub winning_prediction: Option<Prediction>,
    pub total_pool: i128,
    pub up_pool: i128,
    pub down_pool: i128,
    pub stable_pool: i128,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    CurrentRound,
    Round(u32),
    UserWinnings(Address),
    LastSettleTime,
    RoundCounter,
}

#[contractimpl]
impl Contract {
    // =============================================================================
    // MAIN FUNCTIONS (Public API for users)
    // =============================================================================

    // Place a bet on the current round - creates new round if none exists or current is closed
    pub fn place_bet(env: Env, user: Address, prediction: Prediction, amount: i128) -> Result<u32, Error> {
        user.require_auth();

        if amount <= 0 {
            return Err(Error::InsufficientFunds);
        }

        // Check if we need to create a new round
        let current_time = env.ledger().timestamp();
        let current_round_number = env.storage().instance()
            .get::<DataKey, u32>(&DataKey::CurrentRound);
            
        let round_number = match current_round_number {
            Some(round_num) => {
                let existing_round = env.storage().instance()
                    .get::<DataKey, Round>(&DataKey::Round(round_num));
                    
                match existing_round {
                    Some(round) => {
                        // Check if round is still accepting bets and not settled
                        if !round.is_settled && current_time < round.start_time + 300 {
                            round_num // Use existing round
                        } else {
                            // Create new round
                            Self::start_new_round(env.clone())?
                        }
                    }
                    None => Self::start_new_round(env.clone())?
                }
            }
            None => Self::start_new_round(env.clone())? // First round ever
        };
            
        let mut round = env.storage().instance()
            .get::<DataKey, Round>(&DataKey::Round(round_number))
            .ok_or(Error::NoActiveRound)?;

        // Double-check round is accepting bets (should be guaranteed by logic above)
        if current_time >= round.start_time + 300 || round.is_settled {
            return Err(Error::BettingClosed);
        }

        // Check user balance
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let native_client = token::Client::new(&env, &native_asset_address);
        let balance = native_client.balance(&user);

        if amount > balance { 
            return Err(Error::LowBalance);
        }

        // Create the bet
        let bet = Bet {
            user: user.clone(),
            prediction: prediction.clone(),
            amount,
        };

        // Add bet to round
        round.bets.push_back(bet);
        round.total_pool += amount;
        
        // Update pool amounts by prediction
        match prediction {
            Prediction::Up => round.up_pool += amount,
            Prediction::Down => round.down_pool += amount,
            Prediction::Stable => round.stable_pool += amount,
        }

        // Store updated round
        env.storage().instance().set(&DataKey::Round(round_number), &round);

        // Transfer tokens to contract
        native_client.transfer(&user, &env.current_contract_address(), &amount);

        Ok(round_number)
    }

    // Claim winnings for a user - auto-settles current round if ready
    pub fn claim_winnings(env: Env, user: Address) -> Result<i128, Error> {
        user.require_auth();

        // Auto-settle current round if it's ready
        if let Some(current_round_number) = env.storage().instance()
            .get::<DataKey, u32>(&DataKey::CurrentRound) {
            
            if let Some(round) = env.storage().instance()
                .get::<DataKey, Round>(&DataKey::Round(current_round_number)) {
                
                // Check if round is ready to settle (not settled and past 5 minutes)
                let current_time = env.ledger().timestamp();
                if !round.is_settled && current_time >= round.start_time + 300 {
                    // Auto-settle the round
                    let _ = Self::internal_settle_round(env.clone(), current_round_number);
                }
            }
        }

        let winnings = env.storage().instance()
            .get::<DataKey, i128>(&DataKey::UserWinnings(user.clone()))
            .unwrap_or(0);

        // Clear user's winnings
        env.storage().instance().set(&DataKey::UserWinnings(user.clone()), &0i128);

        // Transfer winnings to user
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let native_client = token::Client::new(&env, &native_asset_address);
        native_client.transfer(&env.current_contract_address(), &user, &winnings);

        Ok(winnings)
    }


    // =============================================================================
    // VIEW FUNCTIONS (Read-only queries)
    // =============================================================================

    // Get current round information
    pub fn get_current_round(env: Env) -> Result<Round, Error> {
        let current_round_number = env.storage().instance()
            .get::<DataKey, u32>(&DataKey::CurrentRound)
            .ok_or(Error::NoActiveRound)?;
            
        env.storage().instance().get::<DataKey, Round>(&DataKey::Round(current_round_number))
            .ok_or(Error::NoActiveRound)
    }

    // Get specific round information
    pub fn get_round(env: Env, round_number: u32) -> Option<Round> {
        env.storage().instance().get::<DataKey, Round>(&DataKey::Round(round_number))
    }

    // Get current active round number (0 if none)
    pub fn get_current_round_number(env: Env) -> u32 {
        env.storage().instance()
            .get::<DataKey, u32>(&DataKey::CurrentRound)
            .unwrap_or(0)
    }

    // Get total number of rounds created
    pub fn get_total_rounds(env: Env) -> u32 {
        env.storage().instance()
            .get::<DataKey, u32>(&DataKey::RoundCounter)
            .unwrap_or(0)
    }

    // Get list of completed round numbers
    pub fn get_completed_rounds(env: Env, limit: u32) -> Vec<u32> {
        let mut completed_rounds = Vec::new(&env);
        let total_rounds = Self::get_total_rounds(env.clone());
        
        let start_round = if total_rounds > limit { total_rounds - limit + 1 } else { 1 };
        
        for round_num in start_round..=total_rounds {
            if let Some(round) = env.storage().instance().get::<DataKey, Round>(&DataKey::Round(round_num)) {
                if round.is_settled {
                    completed_rounds.push_back(round_num);
                }
            }
        }
        
        completed_rounds
    }

    // Get user's claimable winnings
    pub fn get_user_winnings(env: Env, user: Address) -> i128 {
        env.storage().instance()
            .get::<DataKey, i128>(&DataKey::UserWinnings(user))
            .unwrap_or(0)
    }

    // Get round betting statistics
    pub fn get_round_stats(env: Env, round_number: u32) -> Option<(i128, i128, i128, i128)> {
        let round = env.storage().instance().get::<DataKey, Round>(&DataKey::Round(round_number))?;
        Some((round.total_pool, round.up_pool, round.down_pool, round.stable_pool))
    }

    // Get current ARS price
    pub fn get_current_ars_price(env: Env) -> Result<i128, Error> {
        Self::fetch_ars_price(&env)
    }

    // Last five ARS prices for historical view
    pub fn fetch_last_five_ars_prices(env: Env) -> Result<Vec<i128>, Error> {
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        
        let ars_asset = ReflectorAsset::Other(symbol_short!("ARS"));
        let recents = reflector_client.prices(&ars_asset, &5);
        
        if recents.is_none() {
            return Err(Error::NoPrice);
        }

        let recent_prices = recents.unwrap();
        let mut prices = Vec::new(&env);
        
        for price_data in recent_prices.iter() {
            prices.push_back(price_data.price);
        }
        
        Ok(prices)
    }

    // Check if current round is accepting bets
    pub fn is_betting_open(env: Env) -> bool {
        if let Ok(round) = Self::get_current_round(env.clone()) {
            let current_time = env.ledger().timestamp();
            !round.is_settled && current_time < round.start_time + 300
        } else {
            false
        }
    }

    // Check if current round is ready to settle
    pub fn is_round_ready_to_settle(env: Env) -> bool {
        if let Ok(round) = Self::get_current_round(env.clone()) {
            let current_time = env.ledger().timestamp();
            !round.is_settled && current_time >= round.start_time + 300
        } else {
            false
        }
    }

    // =============================================================================
    // INTERNAL FUNCTIONS (Private helpers)
    // =============================================================================

    // Initialize a new lottery round (internal use only)
    fn start_new_round(env: Env) -> Result<u32, Error> {
        let current_time: u64 = env.ledger().timestamp();
        
        // Get and increment round counter
        let round_counter = env.storage().instance()
            .get::<DataKey, u32>(&DataKey::RoundCounter)
            .unwrap_or(0);
        
        let new_round_number = round_counter + 1;
        env.storage().instance().set(&DataKey::RoundCounter, &new_round_number);
        
        // Fetch initial ARS price
        let initial_price = Self::fetch_ars_price(&env)?;
        
        let new_round = Round {
            round_number: new_round_number,
            start_time: current_time,
            start_price: initial_price,
            end_price: None,
            bets: Vec::new(&env),
            is_settled: false,
            winning_prediction: None,
            total_pool: 0,
            up_pool: 0,
            down_pool: 0,
            stable_pool: 0,
        };
        
        // Store the new round
        env.storage().instance().set(&DataKey::Round(new_round_number), &new_round);
        env.storage().instance().set(&DataKey::CurrentRound, &new_round_number);
        
        Ok(new_round_number)
    }

    // Internal settle function used by both public settle and claim_winnings
    fn internal_settle_round(env: Env, round_number: u32) -> Result<bool, Error> {

        let mut round = env.storage().instance()
            .get::<DataKey, Round>(&DataKey::Round(round_number))
            .ok_or(Error::NoActiveRound)?;

        // Check if already settled
        if round.is_settled {
            return Err(Error::RoundAlreadySettled);
        }

        // Verify if 5 minutes passed
        let current_time = env.ledger().timestamp();
        if current_time < round.start_time + 300 {
            return Err(Error::BettingClosed); // Still in betting phase
        }

        // Fetch end price at exactly start_time + 300
        let end_time = round.start_time + 300;
        let end_price = Self::fetch_ars_price_at_time(&env, end_time)?;
        
        round.end_price = Some(end_price);

        // Calculate percentage change
        // % change = (new - old) / old * 10000 (using 10000 for precision)
        let change = ((end_price - round.start_price) * 10000) / round.start_price;

        // Determine winning prediction
        // >+0.05% = 5 basis points, <-0.05% = -5 basis points
        let winning_prediction = if change > 5 {
            Prediction::Up
        } else if change < -5 {
            Prediction::Down
        } else {
            Prediction::Stable
        };

        round.winning_prediction = Some(winning_prediction.clone());
        round.is_settled = true;

        // Distribute winnings
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let _native_client = token::Client::new(&env, &native_asset_address);

        // Get winning pool size
        let winning_pool = match winning_prediction {
            Prediction::Up => round.up_pool,
            Prediction::Down => round.down_pool,
            Prediction::Stable => round.stable_pool,
        };

        if winning_pool > 0 {
            // Calculate 5% fee for next round
            let fee = round.total_pool / 20; // 5%
            let distributable_pool = round.total_pool - fee;
            
            // Distribute proportional winnings to winners
            for bet in round.bets.iter() {
                if bet.prediction == winning_prediction {
                    let user_winnings = (bet.amount * distributable_pool) / winning_pool;
                    
                    // Add to user's claimable winnings
                    let current_winnings = env.storage().instance()
                        .get::<DataKey, i128>(&DataKey::UserWinnings(bet.user.clone()))
                        .unwrap_or(0);
                    
                    env.storage().instance().set(
                        &DataKey::UserWinnings(bet.user.clone()),
                        &(current_winnings + user_winnings)
                    );
                }
            }
            
            // Keep fee in contract for next round
        } else {
            // No winners, carry over entire pool to next round
        }

        // Store updated round
        env.storage().instance().set(&DataKey::Round(round_number), &round);
        env.storage().instance().set(&DataKey::LastSettleTime, &current_time);

        Ok(true)
    }

    // Fetch current ARS price from oracle
    fn fetch_ars_price(env: &Env) -> Result<i128, Error> {
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        
        let ars_asset = ReflectorAsset::Other(symbol_short!("ARS"));
        let recent = reflector_client.lastprice(&ars_asset);
        
        if recent.is_none() {
            return Err(Error::NoPrice);
        }
        
        Ok(recent.unwrap().price)
    }

    // Fetch ARS price at specific timestamp
    fn fetch_ars_price_at_time(env: &Env, timestamp: u64) -> Result<i128, Error> {
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        
        let ars_asset = ReflectorAsset::Other(symbol_short!("ARS"));
        let price_data = reflector_client.price(&ars_asset, &timestamp);
        
        if price_data.is_none() {
            return Err(Error::NoPrice);
        }
        Ok(price_data.unwrap().price)
    }
}
