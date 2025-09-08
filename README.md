# Currency Clash Arena

**A gamified decentralized betting platform built on Stellar blockchain, focused on cryptocurrency volatility prediction.**

## 🎯 Overview

Currency Clash Arena is a real-time betting application where users predict cryptocurrency price movements over 5-minute intervals. Players bet testnet tokens to forecast whether currencies will rise, fall, or remain stable, with outcomes validated by the Stelllar Reflector oracle system.

### Key Features

- **Fast-paced rounds**: 5-minute betting windows with instant settlement
- **Three prediction types**: Rise (>+0.05%), Fall (<-0.05%), or Stable (-0.05% to +0.05%)
- **Multiple currency pairs**: ARS/CHF, BRL/EUR, MXN/XAU
- **Oracle-powered**: Real-time price data from Stellar Reflector
- **Proportional rewards**: Winners share the losing pool proportionally
- **Autonomous operation**: Fully decentralized with automatic settlement

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
2. **Select Currency Pair**: Choose from ARS/CHF, BRL/EUR, or MXN/XAU
3. **Make Prediction**: Bet tokens on Rise, Fall, or Stable price movement
4. **Wait 5 Minutes**: Battle automatically resolves after the time window
5. **Claim Winnings**: Winners receive proportional rewards from the losing pool

### Battle Mechanics

```
🎯 Example Battle Flow:

User A bets 100 tokens: "ARS will RISE"
User B bets 200 tokens: "ARS will FALL" 
User C bets 50 tokens: "ARS will be STABLE"

Total Pool: 350 tokens
After 5 minutes: ARS rises by +0.08%

Winner: User A (Rise prediction)
Fee (5%): 17.5 tokens  
Distributable: 332.5 tokens
User A receives: 332.5 tokens (100% of winning pool)
```

### Auto-Settlement Process

1. **Battle Creation**: First bet automatically creates a new battle
2. **Price Recording**: Oracle captures starting price
3. **Bet Aggregation**: Multiple users can join the same battle
4. **Automatic Resolution**: After 5 minutes, contract fetches end price
5. **Winner Calculation**: Determines winning prediction based on price change
6. **Reward Distribution**: Winners split the losing pool proportionally
7. **New Battle**: Next bet automatically starts a fresh battle

## 📊 Contract Interface

### Core Functions

```rust
// Join or create a currency battle
start_battle(user: Address, pair: CurrencyPair, chosen_currency: u32, amount: i128)

// Settle completed battle and claim winnings  
settle_battle(user: Address, pair: CurrencyPair)

// Get active battle information
get_battle(pair: CurrencyPair) -> Battle

// Get current currency prices
get_pair_prices(pair: CurrencyPair) -> (i128, i128)

// Get historical price data
fetch_last_five_prices(ticker: Symbol) -> Vec<PriceData>
```

### Data Structures

```rust
enum CurrencyPair { ArsChf, BrlEur, MxnXau }

struct Battle {
    participants: Vec<Participant>,
    start_time: u64,
    start_prices: (i128, i128), 
    is_settled: bool,
    winning_currency: Option<u32>
}

struct Participant {
    user: Address,
    chosen_currency: u32,  // 0 or 1
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
const { result } = await client.start_battle({
  user: publicKey,
  pair: CurrencyPair.ArsChf, 
  chosen_currency: 0,
  amount: BigInt(100)
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

## 🔗 Resources

- **Stellar Documentation**: [developers.stellar.org](https://developers.stellar.org)
- **Reflector Oracle**: [reflector.network](https://reflector.network)
- **Soroban Contracts**: [soroban.stellar.org](https://soroban.stellar.org)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built for educational and testing purposes on Stellar testnet. Not for production use with real funds.*
