# Requirements Document

## Introduction
The Head-to-Head Currency Battles feature implements a gamified betting system within the Currency Clash Arena application, focusing on three predefined currency pairs: ARS (Argentine Peso) vs. CHF (Swiss Franc), BRL (Brazilian Real) vs. EUR (Euro), and MXN (Mexican Peso) vs. XAU (Gold). Users engage in short-duration bets on which currency in a pair will exhibit greater percentage appreciation (or lesser depreciation) against the USD over a 5-minute interval. This leverages Stellar blockchain for decentralized token betting and the Reflector oracle for real-time currency rate validation, ensuring transparent and automated settlement.

The purpose is to create an addictive, entertaining experience that combines financial data with gaming elements, such as personified currencies, animations, and leaderboards. It targets users interested in crypto betting and forex volatility, providing educational value on currency markets while minimizing risks through testnet tokens in a hackathon MVP. Edge cases include network delays, oracle failures, and extreme volatility (e.g., ARS drops >5%), with UX focused on mobile-friendly interfaces and real-time notifications.

Technical constraints include reliance on Stellar's Soroban for smart contracts, 5-minute oracle updates limiting battle frequency, and no real-money integration to comply with regulations. Success is measured by user engagement (e.g., >50% repeat battles) and accurate bet settlements (>99% uptime).

## Requirements

### Requirement 1: Currency Pair Selection
**User Story:** As a player, I want to select from predefined head-to-head pairs, so that I can quickly start a battle with balanced volatility options.

#### Acceptance Criteria
1. WHEN the user navigates to the battle arena screen, THEN the system SHALL display the three available pairs: ARS vs. CHF, BRL vs. EUR, and MXN vs. XAU, with visual representations (e.g., icons and lore descriptions).
2. IF a pair is selected, THEN the system SHALL load current USD rates from the oracle and display initial values (e.g., ARS=0.000734 USD, CHF=1.241 USD).
3. WHILE no pair is selected, THE system SHALL prevent bet placement and show a prompt to choose a pair.
4. IF oracle data is unavailable (e.g., network error), THEN the system SHALL disable selection and display an error message with retry option.

### Requirement 2: Betting Mechanism
**User Story:** As a player, I want to place bets on battle outcomes using tokens, so that I can participate in the risk-reward dynamic.

#### Acceptance Criteria
1. WHEN a pair is selected and wallet is connected, THEN the system SHALL allow input of bet amount (e.g., 1-100 testnet tokens) and choice of winner (e.g., ARS or CHF).
2. IF bet amount exceeds wallet balance, THEN the system SHALL reject the bet and notify the user.
3. WHILE the 5-minute countdown is active, THE system SHALL lock the bet and deduct tokens via smart contract.
4. IF user attempts multiple bets in one round, THEN the system SHALL limit to one per pair per cycle.
5. WHEN bet is placed, THEN the system SHALL calculate and display dynamic odds based on historical volatility (e.g., higher for volatile ARS).

### Requirement 3: Oracle Integration for Rate Updates
**User Story:** As a player, I want reliable real-time currency data, so that battles are fair and based on actual market movements.

#### Acceptance Criteria
1. WHEN the 5-minute interval starts, THEN the system SHALL fetch initial rates via Reflector oracle for the selected pair (e.g., BRL=0.183 USD, EUR=1.165 USD).
2. IF oracle fetch fails (e.g., timeout >10s), THEN the system SHALL cancel active battles and refund bets.
3. WHILE the interval is ongoing, THE system SHALL poll the oracle every 5 minutes to capture end rates.
4. WHEN end rates are fetched, THEN the system SHALL compute percentage changes (e.g., %change = (new - old)/old * 100) for each currency vs. USD.

### Requirement 4: Battle Resolution and Settlement
**User Story:** As a player, I want automatic outcome determination, so that I receive rewards without disputes.

#### Acceptance Criteria
1. WHEN the 5-minute interval ends, THEN the system SHALL compare % changes and declare the winner (higher positive % or lesser negative % wins).
2. IF changes result in a tie (difference <0.05%), THEN the system SHALL return bets or split pool evenly.
3. WHILE settlement is processing, THE system SHALL execute smart contract to transfer rewards (e.g., winner gets 1.8x stake minus fees).
4. IF extreme volatility occurs (e.g., >10% change in ARS), THEN the system SHALL flag for review but proceed with settlement.
5. WHEN resolution completes, THEN the system SHALL update leaderboard with win/loss stats.

### Requirement 5: Gamification and UI Elements
**User Story:** As a player, I want engaging visuals and feedback, so that battles feel fun and immersive.

#### Acceptance Criteria
1. WHEN a battle starts, THEN the system SHALL display animations (e.g., progress bars representing % changes, "fight" effects).
2. IF a currency "wins," THEN the system SHALL show victory animations and sound cues (e.g., confetti for XAU).
3. WHILE countdown is active, THE system SHALL update timer in real-time with hype notifications (e.g., "30s left!").
4. IF user shares results, THEN the system SHALL generate shareable links (e.g., "#CurrencyClash: ARS defeated CHF!").