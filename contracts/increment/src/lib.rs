#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Env, String, Vec, Symbol, Address, contracterror, token};

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
    NoGuesses = 4,
    TimeNotPassed = 5,
    WrongAnswer = 6,
}

// Data Structure for representing a guess
#[contracttype]
#[derive(Clone)]
pub struct Guess {
    pub user: Address,
    pub will_rise: bool,
    pub amount: i128,
    pub time: u64,
}

#[contractimpl]
impl Contract {
    pub fn make_guess(env: Env, user: Address, will_rise: bool, amount: i128) -> Result<bool, Error> {
        user.require_auth();

        if amount <= 0 {
            return Err(Error::LowBalance);
        }
        

        // 1. Fetch Price
        // Oracles on-chain are Smart Contracts, therefore we interface them via a contract address.
        // Each Dataset has it's own smart contract address, in our case, for testnet it's the following address 
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        
        // Create a Client to interface with
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        
        // The game is EuroGuesser, so we will use the EUR ticker
        // There's support for EUR, GBP, CAD, BRL
        let ticker = ReflectorAsset::Other(Symbol::new(&env, &("EUR")));

        // Fetch the latest price known to the oracle
        // The data is refreshed every 5 minutes
        let recent = reflector_client.lastprice(&ticker);
        
        // Verify if there are errors
        // Errors can happen, and we must be dilligent
        if recent.is_none() {
            return Err(Error::NoPrice);
        }
        
        // We have a price, it's safe to unwrap
        let price = recent.unwrap().price;

        // 2. Check Users Balance
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let native_client = token::Client::new(&env, &native_asset_address);
        let balance = native_client.balance(&user);

        if amount > balance { 
            return Err(Error::LowBalance);
        }

        // 3. Create the guess
        let guess = Guess {
            user: user.clone(),
            will_rise,
            amount,
            time: env.ledger().timestamp(),
        };

        // 4. Store user's guesses in a Vec
        let mut user_guesses: Vec<Guess> = env.storage().instance().get(&user).unwrap_or(vec![&env]);
        user_guesses.push_back(guess);
        env.storage().instance().set(&user, &user_guesses);

        // 5. Transfer tokens
        native_client.transfer(&user, &env.current_contract_address(), &amount);

        Ok(true)
    }

    pub fn verify_guess(env: Env, user: Address) -> Result<bool, Error> {
        user.require_auth();

        // 1. Get entry
        let mut user_guesses = env.storage().instance().get(&user).unwrap_or(vec![&env]);
        if user_guesses.len() == 0 {
            return Err(Error::NoGuesses);
        }

        // Fetch the first guess from the queue for a particular user
        let guess_data: Guess = user_guesses.get(0).ok_or(Error::NoGuesses)?;

        // Remove from storage since we do not want to repeat a payment
        user_guesses.remove(0);
        if user_guesses.is_empty() {
            // If it's totally empty, store nothing and worry about nothing
            env.storage().instance().remove(&user);
        } else {
            // Leave the remaining entries for processing
            env.storage().instance().set(&user, &user_guesses);
        }

        // 2. Verify if 5 minutes passed
        // Since Reflector refreshes it's data every 5 minutes we ought to wait 5 minutes as well
        if env.ledger().timestamp() < guess_data.time + 300 {
            return Err(Error::TimeNotPassed);
        }

        // 3. Check if price updated previously
        let oracle_address = Address::from_str(&env, "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W");
        
        // Create a Client to interface with
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        
        // The game is EuroGuesser, so we will use the EUR ticker
        // There's support for EUR, GBP, CAD, BRL
        let ticker = ReflectorAsset::Other(Symbol::new(&env, &("EUR")));

        // Fetch the price 5 minutes after the time stored, prevents an attack where one could wait for the price to actually increase when voting
        // Fetch the data from exactly the timestamp. Since we know the time, we do not have to story an entry and pay fees
        let new_price = reflector_client.price(&ticker, &(&guess_data.time + 300));
        let price_before = reflector_client.price(&ticker, &guess_data.time);
        
        // Verify if there are errors
        // Errors can happen, and we must be dilligent
        if new_price.is_none() || price_before.is_none() {
            return Err(Error::NoPrice);
        }

        // We have a price, it's safe to unwrap
        let price_orig = price_before.unwrap().price;
        let price_new = new_price.unwrap().price;

        // 4. Verify Guess
        // The Guess is not correct so no winning
        if price_orig > price_new && guess_data.will_rise != true {
            return Ok(false);
        }

        // 5. Transfer Winnings
        let native_asset_address = Address::from_str(&env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
        let native_client = token::Client::new(&env, &native_asset_address);
        let balance = native_client.balance(&env.current_contract_address());

        // Execute only if no liquidity
        if guess_data.amount * 2 > balance {
            return Err(Error::Broke);
        }


        native_client.transfer(&env.current_contract_address(), &user, &(guess_data.amount * 2));

        Ok(true)

    }

    // Get all guesses for a specific user
    pub fn get_user_guesses(env: Env, user: Address) -> Vec<Guess> {
        env.storage().instance().get(&user).unwrap_or(vec![&env])
    }

    // Get total number of guesses for a user
    pub fn get_user_guess_count(env: Env, user: Address) -> u32 {
        let user_guesses: Vec<Guess> = env.storage().instance().get(&user).unwrap_or(vec![&env]);
        user_guesses.len()
    }

    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}
