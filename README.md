# Currency Clash Arena - ARS Lottery

**A gamified decentralized betting platform built on Stellar blockchain, focused exclusively on Argentine Peso (ARS) volatility prediction.**

## 🎯 Overview

Currency Clash Arena implements an ARS-focused lottery system where users predict Argentine Peso price movements against USD over 5-minute intervals. Players bet testnet tokens to forecast whether ARS will rise, fall, or remain stable, with outcomes validated by the Stellar Reflector oracle system.

This creates an addictive and simple experience designed for hackathon environments, featuring rapid rounds and automatic resolution while eliminating the concept of "tickets" - users bet tokens directly for the desired amounts.

### Key Features

- **ARS-only focus**: Exclusively tracks Argentine Peso volatility (the most volatile currency)
- **Three prediction types**: Rise (>+0.05%), Fall (<-0.05%), or Stable (-0.05% to +0.05%)
- **5-minute rounds**: Fast betting windows with automatic settlement
- **Oracle-powered**: Real-time ARS/USD price data from Stellar Reflector
- **Proportional rewards**: Winners share the losing pools proportionally
- **Fully autonomous**: Users only bet and claim - everything else is invisible

## 🏗️ Architecture

### Smart Contract (Rust/Soroban)
- **Location**: `contracts/increment/src/lib.rs`
- **Network**: Stellar Testnet
- **Contract ID**: `CC2AJHUB5VJTCPDGOEHV4YDCHHVYY3AN2L5ZM3OI37W5ED72BV3RS7VP`
- **Native Token**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Oracle**: `CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W`

### Frontend (React + TypeScript)
- **Framework**: Vite + React + TypeScript  
- **Stellar SDK**: @stellar/stellar-sdk v14.0.0-rc.3
- **Wallet Integration**: @creit.tech/stellar-wallets-kit
- **UI Components**: @stellar/design-system
- **Main Component**: `src/components/CurrencyBattle.tsx`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust and Cargo
- Stellar CLI
- Freighter or Albedo wallet (testnet mode)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd increment

# Install dependencies
npm install
npm run install:contracts

# Build contracts
cd contracts/increment
make build
```

### Development

```bash
# Start development server with contract watching
npm run dev

# In separate terminal - watch and rebuild contracts
stellar scaffold watch --build-clients

# Run tests
cd contracts/increment
make test
```

### Build & Deploy

```bash
# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 🎮 How It Works

### User Flow

1. **Connect Wallet**: Users connect their Stellar testnet wallet
2. **View Current Round**: See round number and countdown timer (e.g., "3:10 minutes remaining")
3. **Make Prediction**: Bet tokens on whether ARS will Rise, Fall, or stay Stable
4. **Wait 5 Minutes**: Round automatically resolves after the time window
5. **Claim Winnings**: Winners receive proportional rewards from the losing pools

### Betting Mechanics

```
🎯 Example Round Flow:

User A bets 100 tokens: "ARS will RISE"
User B bets 200 tokens: "ARS will FALL" 
User C bets 50 tokens: "ARS will be STABLE"

Total Pool: 350 tokens
Starting ARS price: $0.001025
After 5 minutes: ARS price: $0.001076 (+4.97% change)

Result: ARS RISES (>+0.05%)
Winner: User A (Rise prediction)
Fee (5%): 17.5 tokens  
Distributable: 332.5 tokens
User A receives: 332.5 tokens (100% of winning pool)
```

### Auto-Settlement Process

1. **Round Creation**: First bet automatically creates a new round
2. **Price Recording**: Oracle captures starting ARS price in USD
3. **Bet Aggregation**: Multiple users can join the same round (5-minute window)
4. **Automatic Resolution**: After 5 minutes, contract fetches final ARS price
5. **Winner Calculation**: Determines winning prediction based on % price change
6. **Reward Distribution**: Winners split the losing pools proportionally (minus 5% fee)
7. **New Round**: Next bet automatically starts a fresh round

## 📊 Contract Interface

### Core Functions

```rust
// Place bet on ARS price movement (creates new round if none active)
place_bet(user: Address, prediction: Prediction, amount: i128) -> u32

// Claim winnings from settled rounds
claim_winnings(user: Address) -> i128

// Get current round information
get_current_round() -> Option<Round>

// Get ARS price from oracle
get_ars_price() -> i128
```

### Data Structures

```rust
enum Prediction { Up, Down, Stable }

struct Round {
    round_number: u32,
    start_time: u64,
    start_price: i128,      // ARS price in USD (from oracle)
    bets: Vec<Bet>,
    up_pool: i128,          // Total tokens bet on "Up"
    down_pool: i128,        // Total tokens bet on "Down" 
    stable_pool: i128,      // Total tokens bet on "Stable"
    is_settled: bool,
    winning_prediction: Option<Prediction>
}

struct Bet {
    user: Address,
    prediction: Prediction, // Up, Down, or Stable
    amount: i128
}
```

## 🛠️ Development Tools

### Contract Testing
```bash
cd contracts/increment
make build    # Build contract
make test     # Run unit tests
```

### Debug Interface
Access the comprehensive debugging interface at `/debug` route:
- Contract method testing
- Transaction simulation  
- XDR viewers
- State inspection

### Frontend Integration
```typescript
// Contract interaction pattern
const client = new IncrementContract({ publicKey });
const { result } = await client.place_bet({
  user: publicKey,
  prediction: Prediction.Up, 
  amount: BigInt(100)
}, { simulate: true });

// Claim winnings
const winnings = await client.claim_winnings({
  user: publicKey
}, { simulate: true });
```

## 📂 Project Structure

```
├── contracts/increment/     # Rust smart contract
├── src/components/         # React components  
├── src/debug/             # Debug interface
├── src/contracts/         # TypeScript contract clients
├── contract-ids/          # Deployment configurations
├── packages/increment/    # Generated contract bindings
└── CLAUDE.md             # AI assistant instructions
```