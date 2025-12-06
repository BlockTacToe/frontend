# **BlOcX**TacToe 🎮 – Frontend

A fully decentralized, peer-to-peer Tic Tac Toe game built on Ethereum with multi-token betting functionality. Players can create games, join existing games, and compete for rewards in ETH or ERC20 tokens (USDC, USDT, etc.) in a trustless, onchain environment.

## ✨ Features

✅ **Implemented:**
- ✅ Game lobby with all available games
- ✅ Interactive 3x3, 5x5, and 7x7 game boards with beautiful UI
- ✅ Real-time game state reads (contract view calls)
- ✅ Wallet connection using Reown (WalletConnect/MetaMask)
- ✅ Transaction signing for create/join/play
- ✅ Multi-token support (ETH, USDC, USDT, and custom ERC20 tokens)
- ✅ Dynamic token decimal handling for accurate amount display
- ✅ Token balance display in create game form
- ✅ Challenge system for direct player challenges
- ✅ Rating system and leaderboard integration
- ✅ Responsive design for mobile and desktop
- ✅ Beautiful modern UI with gradients and animations

## 🧰 Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Ethers.js v6 (contract interaction)
- Reown AppKit (WalletConnect/MetaMask)
- Wagmi & Viem
- React Toastify (notifications)

## 🏗️ Architecture

- **Framework:** Next.js 16 with React 19
- **Styling:** Tailwind CSS 4 with custom gradients
- **Wallet Integration:** Reown AppKit (supports MetaMask, WalletConnect, and social logins)
- **Contract Interaction:** Ethers.js v6 via Wagmi adapter
- **Key Components:**
  - `GameBoard` - Interactive 3x3 grid with hover effects
  - `GamesList` - Display all available games
  - `PlayGame` - Individual game interaction page
  - `CreateGame` - Create new game with bet amount

## 🎮 How to Play

1. **Connect Wallet:** Connect your Ethereum wallet using Reown AppKit
2. **Select Token:** Choose ETH or any supported ERC20 token for betting
3. **Create Game:** Set a bet amount (in your selected token) and create a new game
4. **Join Game:** Find an open game and join it with the required bet amount
5. **Play:** Take turns making moves on the board (3x3, 5x5, or 7x7)
6. **Win:** Get the required number in a row to win both players' bets!

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Ethereum wallet for testing (MetaMask recommended)
- Sepolia testnet ETH for transactions

### Installation

```bash
# Navigate to frontend directory
cd BlOcXTacToe-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Reown AppKit Project ID (Get from https://cloud.reown.com)
NEXT_PUBLIC_PROJECT_ID=a9fbadc760baa309220363ec867b732e

# Smart Contract Address (Replace with your deployed contract)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## 🔗 Contract Integration

The frontend integrates with the BlOcXTacToe smart contract and supports the following features:

**Read Functions:**
- `getGame(uint256 gameId)` - Returns game data (players, bet amount, token address, status, etc.)
- `getGameBoard(uint256 gameId)` - Returns the current board state
- `getAllGames()` - Returns array of all game IDs
- `getTokenName(address token)` - Returns the name of an ERC20 token
- `supportedTokens(uint256 index)` - Returns supported token addresses
- `supportedTokensCount()` - Returns the number of supported tokens

**Write Functions:**
- `createGame(uint256 betAmount, address tokenAddress, uint8 boardSize)` - Create a new game with optional ERC20 token
- `joinGame(uint256 gameId)` - Join an existing game
- `makeMove(uint256 gameId, uint8 position)` - Make a move on the board
- `forfeitGame(uint256 gameId)` - Forfeit a game due to timeout
- `claimReward(uint256 gameId)` - Claim rewards from finished games
- `createChallenge(address challenged, uint256 betAmount, address tokenAddress, uint8 boardSize)` - Challenge a specific player
- `acceptChallenge(uint256 challengeId, uint8 moveIndex)` - Accept a challenge

**Token Handling:**
- Dynamic decimal detection for ERC20 tokens (automatically reads token decimals)
- Proper amount formatting using `formatUnits` with correct decimals
- Token balance display for selected tokens in create game form
- Support for native ETH (18 decimals) and any ERC20 token (6, 8, 18, etc.)

**Events:**
- `GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount, address tokenAddress)`
- `GameJoined(uint256 indexed gameId, address indexed player2)`
- `MoveMade(uint256 indexed gameId, address indexed player, uint8 position)`
- `GameFinished(uint256 indexed gameId, address indexed winner)`
- `ChallengeCreated(uint256 indexed challengeId, address indexed challenger, address indexed challenged)`
- `ChallengeAccepted(uint256 indexed challengeId, uint256 indexed gameId)`

The contract ABI is defined in `src/abi/blocxtactoeabi.json`. Update it to match your contract's actual ABI.

## 📁 Project Structure

```
blocxtactoe-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page
│   │   ├── games/page.tsx              # Games list page
│   │   ├── create/page.tsx             # Create game page
│   │   ├── play/[gameId]/page.tsx      # Play game page
│   │   ├── layout.tsx                  # Root layout with providers
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── common/
│   │   │   ├── TokenDisplay.tsx        # Token display components (BetAmountDisplay, TokenNameDisplay)
│   │   │   ├── CreateGameContent.tsx   # Create game form with token selection
│   │   │   ├── ChallengesContent.tsx   # Challenge system UI
│   │   │   └── PlayerSearch.tsx        # Player search for challenges
│   │   ├── games/
│   │   │   ├── GameBoard.tsx           # Interactive game board (3x3, 5x5, 7x7)
│   │   │   ├── GamesList.tsx           # Games list component
│   │   │   ├── GameModal.tsx           # Game details modal
│   │   │   ├── JoinGameModal.tsx       # Join game confirmation
│   │   │   ├── ForfeitModal.tsx        # Forfeit confirmation
│   │   │   └── CountdownTimer.tsx      # Move timeout countdown
│   │   └── Providers.tsx               # React providers wrapper
│   ├── hooks/
│   │   ├── useBlOcXTacToe.ts          # Main contract interaction hook
│   │   ├── useGameData.ts             # Game data fetching hooks
│   │   └── useTokenBalance.ts         # Token balance fetching hook
│   ├── abi/
│   │   └── blocxtactoeabi.json        # Contract ABI
│   ├── config/
│   │   └── constants.ts               # Contract addresses and config
│   └── lib/
│       └── utils.ts                   # Utility functions
├── public/                            # Static assets
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
└── next.config.ts                     # Next.js config
```

## 💡 Key Features & Components

### Token Handling
- **BetAmountDisplay Component**: Automatically detects token decimals and formats amounts correctly
  - Supports native ETH (18 decimals)
  - Supports ERC20 tokens with any decimal places (6, 8, 18, etc.)
  - Fetches and displays token names from the contract
  - Used throughout the app for consistent bet amount display

- **Token Balance Display**: Shows user's balance for the selected token in the create game form
  - Updates dynamically when token selection changes
  - Helps users verify they have sufficient funds

- **Dynamic Decimal Detection**: 
  - Reads token decimals from the ERC20 contract on-chain
  - Uses `parseUnits` and `formatUnits` with correct decimals
  - Ensures accurate amount conversion for transaction submission

### Game Features
- **Multi-Board Support**: 3x3, 5x5, and 7x7 board sizes
- **Challenge System**: Direct player-to-player challenges
- **Token Selection**: Choose between ETH and supported ERC20 tokens
- **Real-time Updates**: Polling-based game state updates
- **Timeout Handling**: Visual countdown and forfeit functionality

## 🧪 Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint
```

## 🔄 Recent Improvements

### Token Decimal Handling (Latest)
- **Fixed**: Bet amounts now display correctly for all ERC20 tokens
  - Previously, all tokens were formatted as if they had 18 decimals (ETH)
  - Now dynamically fetches token decimals and uses `formatUnits` with correct decimals
  - Fixes display issues for USDC (6 decimals), USDT (6 decimals), and other tokens
- **Improved**: Token balance display moved to bet amount input section
- **Enhanced**: Consistent token amount display across game list, modals, and game pages

### Multi-Token Support
- **Added**: Support for creating games with ERC20 tokens (not just ETH)
- **Added**: Token selector in create game form
- **Added**: Dynamic token name fetching from contract
- **Added**: Token balance display with proper decimal formatting

### UI/UX Enhancements
- **Improved**: Bet amount display now shows correct token name and formatted amount
- **Improved**: Token balance displayed in green below bet amount input
- **Improved**: Bet amount rule text integrated into label for better readability

## 🤝 Contributing

- Fork → feature branch → PR
- Include screenshots for UI changes
- Ensure type‑safety and pass linting

## 📄 License

MIT



## 🐛 Known Issues & Roadmap

### 🔥 High Priority Issues

#### Frontend Issues

- [] **Issue #4:** Core Frontend Implementation ✅
  - [] Set up Next.js project with TypeScript and Tailwind CSS
  - [] Create wallet connection using MetaMask/WalletConnect (Reown)
  - [] Implement contract interaction using ethers.js
  - [] Create `GameBoard` component with 3x3 grid
  - [] Build `GamesList` component for displaying all games
  - [] Create `PlayGame` component for individual game interaction
  - [] Implement `CreateGame` page with bet amount input
  - [] Add navigation and routing structure
  - [] Create responsive design for mobile and desktop

- [] **Issue #5:** Contract Integration & State Management ✅
  - [] Set up contract ABI and address configuration
  - [] Implement contract read functions (getGame, getAllGames)
  - [] Create transaction handling for write functions
  - [] Add loading states for all blockchain operations
  - [] Implement error handling and user feedback
  - [] Create custom hooks for contract interactions
  - [] Add transaction confirmation and receipt handling
  - [] Implement real-time updates using event listeners (polling every 5 seconds)

- [] **Issue #6:** Timeout & Forfeit UI Implementation ✅
  - [] Add countdown timer component for move deadlines
  - [] Create forfeit button with confirmation modal
  - [] Implement timeout state display in game cards
  - [] Add visual indicators for games approaching timeout
  - [] Create notification system for timeout warnings
  - [] Implement automatic refresh for timeout updates
  - [] Add forfeit transaction handling and feedback

- [ ] **Issue #7:** Winner Celebration & Social Sharing System
  - [ ] Create animated winner celebration modal
  - [ ] Add confetti/particle effects for wins
  - [ ] Implement winner announcement with player names
  - [ ] Create social sharing cards with game results
  - [ ] Add "Challenge Friends" functionality
  - [ ] Implement share to Twitter/X with game stats
  - [ ] Create share to Discord/Telegram integration
  - [ ] Add "Play Again" quick challenge feature
  - [ ] Implement winner streak tracking
  - [ ] Create shareable winner certificates/NFTs

### 🔶 Medium Priority Issues

#### Frontend Issues

- [ ] **Issue #10:** Enhanced User Experience
  - [ ] Add smooth animations and transitions
  - [ ] Implement drag-and-drop for game pieces
  - [ ] Create sound effects for moves and wins
  - [ ] Add haptic feedback for mobile users
  - [ ] Implement dark/light theme toggle
  - [ ] Create customizable game board themes
  - [ ] Add keyboard shortcuts for game controls
  - [ ] Implement offline mode with local storage

- [ ] **Issue #11:** Real-time Features & Performance
  - [ ] Implement WebSocket connection for real-time updates
  - [ ] Add push notifications for game events
  - [ ] Create optimistic UI updates for better UX
  - [ ] Implement virtual scrolling for large game lists
  - [ ] Add caching layer for contract data
  - [ ] Create service worker for offline functionality
  - [ ] Implement lazy loading for components
  - [ ] Add performance monitoring and analytics

### 🔵 Low Priority Issues

#### Frontend Issues

- [ ] **Issue #14:** Advanced UI/UX Features
  - [ ] Create 3D game board visualization
  - [ ] Implement VR/AR support for immersive gameplay
  - [ ] Add social features (friends, chat, leaderboards)
  - [ ] Create game replay viewer with analysis
  - [ ] Implement streaming integration for tournaments
  - [ ] Add accessibility features (screen reader support)
  - [ ] Create multi-language support
  - [ ] Implement advanced analytics dashboard

- [ ] **Issue #15:** Mobile & Cross-Platform
  - [ ] Create native mobile app (React Native)
  - [ ] Implement PWA with offline capabilities
  - [ ] Add mobile-specific gestures and controls
  - [ ] Create desktop app using Electron
  - [ ] Implement cross-platform synchronization
  - [ ] Add mobile push notifications
  - [ ] Create platform-specific optimizations
  - [ ] Implement device-specific UI adaptations
