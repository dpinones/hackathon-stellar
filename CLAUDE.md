# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start development server with auto-generated contract clients and Vite hot reload
- `npm start` - Start Vite development server only
- `npm run build` - Build TypeScript and create production build
- `npm run preview` - Preview production build

### Contract Development

- `stellar scaffold watch --build-clients` - Watch contracts and auto-generate TypeScript clients
- `stellar container start` - Start local Stellar node, RPC, API, and friendbot for testing
- `stellar contract build` - Build contracts (or `make` in contracts/increment/)
- `cargo test` - Run contract tests (in contracts/increment/)

### Code Quality

- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run install:contracts` - Install and build contract packages

### Contract Deployment

- `stellar registry publish` - Publish contract to registry
- `stellar registry deploy --deployed-name NAME --published-name NAME -- --param1 value1` - Deploy with constructor params
- `stellar registry install CONTRACT_NAME` - Install deployed contract locally

## Architecture

### Project Structure

This is a Scaffold Stellar project - a full-stack Stellar dApp with both smart contracts and frontend:

- **contracts/** - Rust smart contracts using Soroban SDK
- **packages/** - Auto-generated TypeScript clients from contracts
- **src/** - React frontend application
  - **components/** - Reusable UI components (ConnectAccount, WalletButton, etc.)
  - **contracts/** - Contract interaction helpers and utilities
  - **debug/** - Complete contract debugging interface with form generation
  - **hooks/** - React hooks for wallet, notifications, balances
  - **pages/** - Main application pages (Home, Debugger)
  - **providers/** - Context providers for wallet and notifications

### Key Technologies

- **Frontend:** Vite + React 19 + TypeScript + Stellar Design System
- **Smart Contracts:** Rust + Soroban SDK
- **Wallet Integration:** @creit.tech/stellar-wallets-kit
- **State Management:** @tanstack/react-query for server state, React Context for app state
- **Routing:** React Router v6

### Contract Integration

The project uses auto-generated TypeScript clients that provide type-safe contract interaction. The `stellar scaffold watch --build-clients` command monitors contract changes and regenerates clients automatically. Contract utilities in `src/contracts/` handle common operations like contract calls and transaction submission.

### Development Workflow

1. Contracts are built and generate WASM files in `target/wasm32v1-none/release/`
2. TypeScript clients are auto-generated in `packages/` from contract metadata
3. Frontend imports these clients for type-safe contract interaction
4. The debugger page provides a complete UI for testing contract methods

### Environment Configuration

- `environments.toml` - Stellar network configurations
- `.env` - Local environment variables (copy from `.env.example`)
- Contract IDs are stored in `contract-ids/` directory

### Testing

- Contract tests: Run `cargo test` in contract directories
- Frontend: Uses React Query for async state management with built-in error handling
