# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Currency Clash Arena is a gamified decentralized betting application built on Stellar blockchain, focused on currency volatility prediction. Users bet testnet tokens to predict if ARS (Argentine Peso) will rise, fall, or remain stable over 5-minute intervals, validated by the Reflector oracle.

## Architecture

### Smart Contract (Rust/Soroban)
- **Location**: `contracts/increment/src/lib.rs`
- **Oracle Integration**: Uses Reflector oracle at `CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W` for price data
- **Contract ID**: `CBOR3RRXFRXAYJH5B4JQC6BZTVJDRVXO2XHU4NCMQMG66M6GQUT4AJHM`
- **Native Token**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

**Key Features**:
- Currency battle system with 5-minute rounds
- Three currency pairs: ARS/CHF, BRL/EUR, MXN/XAU
- Oracle price fetching and battle settlement
- Token escrow and proportional winnings distribution

### Frontend (React + TypeScript)
- **Framework**: Vite + React + TypeScript
- **Stellar Integration**: @stellar/stellar-sdk v14.0.0-rc.3, @creit.tech/stellar-wallets-kit
- **Main Component**: `src/components/CurrencyBattle.tsx` - core betting interface
- **Design System**: @stellar/design-system for UI components
- **Routing**: React Router for /debug page with contract debugger

## Development Commands

### Build & Development
```bash
# Start development with contract watching
npm run dev

# Build project  
npm run build

# Install contract dependencies
npm run install:contracts

# Lint code
npm run lint

# Format code
npm run format
```

### Contract Development
```bash
# Watch contracts and rebuild clients
stellar scaffold watch --build-clients

# From contracts/increment directory:
make build        # Build contract
make test         # Run tests
```

## Contract Interface

### Core Functions
- `start_battle(user, pair, chosen_currency, amount)` - Join or create currency battle
- `settle_battle(user, pair)` - Settle completed battle (5min+ after start)
- `get_battle(pair)` - Get active battle information
- `get_pair_prices(pair)` - Get current currency prices
- `fetch_last_five_prices(ticker)` - Get price history

### Data Structures
- `CurrencyPair`: ArsChf, BrlEur, MxnXau enum
- `Battle`: Contains participants, start time, prices, settlement status
- `Participant`: User address, chosen currency (0/1), bet amount

## Frontend Integration

### Wallet Connection
- Uses `useWallet` hook for Stellar wallet integration
- Handles Freighter/Albedo wallet connections
- Network: Standalone testnet (passphrase: "Standalone Network ; February 2017")

### Contract Interaction Pattern
1. Create Client instance with user's public key
2. Call contract method with `simulate: true`
3. Use `useRpcPrepareTx` to prepare transaction
4. Sign with wallet and submit via `useSubmitRpcTx`

### State Management
- Battle state loaded on component mount and wallet changes
- Real-time countdown timer for active battles
- Price data fetching for current and historical prices

## Key Directories

- `src/components/` - React components including main CurrencyBattle
- `src/debug/` - Comprehensive contract debugging interface with hooks/utils
- `contracts/increment/` - Rust smart contract source
- `src/contracts/` - TypeScript contract client and utilities
- `contract-ids/` - Contract deployment IDs

## Testing & Deployment

The project includes extensive debugging infrastructure in `src/debug/` with form generators for all contract methods, transaction validation, and XDR viewers. Use the `/debug` route for contract interaction testing.

## Oracle Integration

The contract integrates with Reflector oracle for real-time price data:
- Base currency pricing in USD
- 5-minute price resolution
- Historical price queries for battle settlement
- Cross-price calculations for currency pairs