#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Env, String, Vec, Symbol, Address, contracterror, token, symbol_short};

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
    Broke = 3,
    NoBattle = 4,
    TimeNotPassed = 5,
    InvalidPair = 6,
    BattleAlreadyExists = 7,
    TooClose = 8,
}

// Enum for currency pairs
#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum CurrencyPair {
    ArsChf,  // ARS vs CHF
    BrlEur,  // BRL vs EUR  
    MxnXau,  // MXN vs XAU (Gold)
}

// Data Structure for representing a battle bet
#[contracttype]
#[derive(Clone)]
pub struct Battle {
    pub user: Address,
    pub pair: CurrencyPair,
    pub chosen_currency: u32, // 0 for first currency, 1 for second currency
    pub amount: i128,
    pub start_time: u64,
    pub start_price_1: i128,
    pub start_price_2: i128,
}

#[contractimpl]
impl Contract {
    // Get currency ticker symbols for a pair
    fn get_currency_symbols(pair: CurrencyPair) -> (Symbol, Symbol) {
        match pair {
            CurrencyPair::ArsChf => (symbol_short!("ARS"), symbol_short!("CHF")),
            CurrencyPair::BrlEur => (symbol_short!("BRL"), symbol_short!("EUR")),
            CurrencyPair::MxnXau => (symbol_short!("MXN"), symbol_short!("XAU")),
        }
    }

    // Fetch current price for a currency
    fn fetch_price(env: &Env, ticker: Symbol) -> Result<i128, Error> {
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        
        let asset = ReflectorAsset::Other(ticker);
        let recent = reflector_client.lastprice(&asset);
        
        if recent.is_none() {
            return Err(Error::NoPrice);
        }
        
        Ok(recent.unwrap().price)
    }

    // Start a currency battle
    pub fn start_battle(env: Env, user: Address, pair: CurrencyPair, chosen_currency: u32, amount: i128) -> Result<bool, Error> {
        user.require_auth();

        if amount <= 0 {
            return Err(Error::LowBalance);
        }

        if chosen_currency > 1 {
            return Err(Error::InvalidPair);
        }

        // Check if user already has an active battle for this pair
        let battle_key = (user.clone(), pair);
        if env.storage().instance().has(&battle_key) {
            return Err(Error::BattleAlreadyExists);
        }

        // Check user balance
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let native_client = token::Client::new(&env, &native_asset_address);
        let balance = native_client.balance(&user);

        if amount > balance { 
            return Err(Error::LowBalance);
        }

        // Get currency symbols for the pair
        let (symbol1, symbol2) = Self::get_currency_symbols(pair);

        // Fetch current prices for both currencies
        let price1 = Self::fetch_price(&env, symbol1)?;
        let price2 = Self::fetch_price(&env, symbol2)?;

        // Create the battle
        let battle = Battle {
            user: user.clone(),
            pair,
            chosen_currency,
            amount,
            start_time: env.ledger().timestamp(),
            start_price_1: price1,
            start_price_2: price2,
        };

        // Store the battle
        env.storage().instance().set(&battle_key, &battle);

        // Transfer tokens to contract
        native_client.transfer(&user, &env.current_contract_address(), &amount);

        Ok(true)
    }

    // Settle a battle after 5 minutes
    pub fn settle_battle(env: Env, user: Address, pair: CurrencyPair) -> Result<bool, Error> {
        user.require_auth();

        // Get the battle
        let battle_key = (user.clone(), pair);
        let battle: Battle = env.storage().instance().get(&battle_key).ok_or(Error::NoBattle)?;

        // Verify if 5 minutes passed
        if env.ledger().timestamp() < battle.start_time + 300 {
            return Err(Error::TimeNotPassed);
        }

        // Get currency symbols for the pair
        let (symbol1, symbol2) = Self::get_currency_symbols(pair);

        // Fetch historical prices at battle start time and end time
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        let reflector_client = ReflectorClient::new(&env, &oracle_address);

        let asset1 = ReflectorAsset::Other(symbol1);
        let asset2 = ReflectorAsset::Other(symbol2);

        // Fetch end prices at exactly battle.start_time + 300
        let end_time = battle.start_time + 300;
        let end_price1 = reflector_client.price(&asset1, &end_time);
        let end_price2 = reflector_client.price(&asset2, &end_time);

        if end_price1.is_none() || end_price2.is_none() {
            return Err(Error::NoPrice);
        }

        let final_price1 = end_price1.unwrap().price;
        let final_price2 = end_price2.unwrap().price;

        // Calculate percentage changes
        // % change = (new - old) / old * 10000 (using 10000 for precision since we can't use floats)
        let change1 = ((final_price1 - battle.start_price_1) * 10000) / battle.start_price_1;
        let change2 = ((final_price2 - battle.start_price_2) * 10000) / battle.start_price_2;

        // Determine winner (higher percentage change wins)
        let user_won = if battle.chosen_currency == 0 {
            change1 > change2
        } else {
            change2 > change1
        };

        // Check for tie (difference less than 0.05% = 5 basis points)
        let is_tie = if change1 > change2 { 
            change1 - change2 < 5 
        } else { 
            change2 - change1 < 5 
        };

        // Remove the battle from storage
        env.storage().instance().remove(&battle_key);

        // Handle settlement
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let native_client = token::Client::new(&env, &native_asset_address);
        let contract_balance = native_client.balance(&env.current_contract_address());

        if is_tie {
            // Return original bet amount
            if battle.amount > contract_balance {
                return Err(Error::Broke);
            }
            native_client.transfer(&env.current_contract_address(), &user, &battle.amount);
            return Ok(false);
        }

        if user_won {
            // Winner gets 1.8x their stake
            let winnings = (battle.amount * 18) / 10;
            if winnings > contract_balance {
                return Err(Error::Broke);
            }
            native_client.transfer(&env.current_contract_address(), &user, &winnings);
            Ok(true)
        } else {
            // User loses their bet (already transferred to contract)
            Ok(false)
        }
    }

    // Get active battle for a user and currency pair
    pub fn get_user_battle(env: Env, user: Address, pair: CurrencyPair) -> Option<Battle> {
        let battle_key = (user, pair);
        env.storage().instance().get(&battle_key)
    }

    // Get current prices for a currency pair
    pub fn get_pair_prices(env: Env, pair: CurrencyPair) -> Result<(i128, i128), Error> {
        let (symbol1, symbol2) = Self::get_currency_symbols(pair);
        let price1 = Self::fetch_price(&env, symbol1)?;
        let price2 = Self::fetch_price(&env, symbol2)?;
        Ok((price1, price2))
    }

    // Check if battle time has elapsed (5 minutes)
    pub fn is_battle_ready(env: Env, user: Address, pair: CurrencyPair) -> bool {
        let battle_key = (user, pair);
        if let Some(battle) = env.storage().instance().get::<(Address, CurrencyPair), Battle>(&battle_key) {
            env.ledger().timestamp() >= battle.start_time + 300
        } else {
            false
        }
    }

    // Get available currency pairs
    pub fn get_available_pairs(_env: Env) -> Vec<CurrencyPair> {
        vec![
            &_env,
            CurrencyPair::ArsChf,
            CurrencyPair::BrlEur,
            CurrencyPair::MxnXau,
        ]
    }

    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}
