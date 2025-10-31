# BlockTacToe 🎮 – Frontend

A fully decentralized, peer-to-peer Tic Tac Toe game built on Ethereum with ETH betting functionality. Players can create games, join existing games, and compete for ETH rewards in a trustless, onchain environment.

## ✨ Features

- Game lobby with all available games
- Interactive 3x3 game board
- Real‑time game state reads (contract view calls/events)
- Wallet connection (MetaMask / WalletConnect)
- Transaction signing for create/join/play/forfeit
- Timeout countdown timers and UI indicators
- Winner celebration animations and social sharing/challenges

## 🧰 Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Ethers.js (contract interaction)
- Wallets: MetaMask, WalletConnect

## 🏗️ Architecture

- **Framework:** Next.js 15 with React 19
- **Styling:** Tailwind CSS
- **Wallet Integration:** MetaMask, WalletConnect
- **Key Features:**
  - Game lobby with all available games
  - Interactive game board
  - Real-time game state updates
  - Wallet connection and transaction signing
  - Timeout countdown timers
  - Winner celebration animations
  - Social sharing and challenge system

## 🎮 How to Play

1. **Connect Wallet:** Connect your Ethereum wallet (MetaMask, etc.)
2. **Create Game:** Set a bet amount and make your first move (X)
3. **Join Game:** Find an open game and join with your O move
4. **Play:** Take turns making moves on the 3x3 board
5. **Win:** Get three in a row to win both players' ETH!
6. **Share:** Share your wins to your social media network on X, Farcaster, Reddit and others!

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Ethereum wallet for testing

### Environment Setup

```bash
# From repo root
cd frontend
npm install
npm run dev
```

Create a `.env.local` with (example):
```
NEXT_PUBLIC_NETWORK="sepolia"
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>"
NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourContractAddress"
```

## 🔗 Contract Integration

Place the contract ABI JSON at `frontend/lib/abi/TicTacToe.json` and configure:

```ts
// frontend/lib/contract.ts (example)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export { default as CONTRACT_ABI } from "@/lib/abi/TicTacToe.json";
```

Core calls to support:
- **Read:** `getLatestGameId()`, `getGame(gameId)`, `getTimeRemaining(gameId)`
- **Write:** `createGame(betAmount, moveIndex)`, `joinGame(gameId, moveIndex)`, `play(gameId, moveIndex)`, `forfeitGame(gameId)`

## 📁 Project Structure

```
frontend/
├── components/
│   ├── GameBoard.tsx
│   ├── GamesList.tsx
│   └── PlayGame.tsx
├── hooks/
│   └── useWallet.ts
├── lib/
│   ├── abi/TicTacToe.json
│   ├── contract.ts
│   └── format.ts
└── src/app/
    ├── page.tsx            # Home (lobby)
    ├── create/page.tsx     # Create game
    └── game/[gameId]/page.tsx
```

## 🧪 Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint
```

## 🤝 Contributing

- Fork → feature branch → PR
- Include screenshots for UI changes
- Ensure type‑safety and pass linting

## 📄 License

MIT

## 🐛 Known Issues & Roadmap

### 🔥 High Priority Issues

#### Frontend Issues

- [ ] **Issue #4:** Core Frontend Implementation
  - [ ] Set up Next.js project with TypeScript and Tailwind CSS
  - [ ] Create wallet connection using MetaMask/WalletConnect (Reown)
  - [ ] Implement contract interaction using ethers.js or web3.js
  - [ ] Create `GameBoard` component with 3x3 grid
  - [ ] Build `GamesList` component for displaying all games
  - [ ] Create `PlayGame` component for individual game interaction
  - [ ] Implement `CreateGame` page with bet amount input
  - [ ] Add navigation and routing structure
  - [ ] Create responsive design for mobile and desktop

- [ ] **Issue #5:** Contract Integration & State Management
  - [ ] Set up contract ABI and address configuration
  - [ ] Implement contract read functions (getGame, getAllGames)
  - [ ] Create transaction handling for write functions
  - [ ] Add loading states for all blockchain operations
  - [ ] Implement error handling and user feedback
  - [ ] Create custom hooks for contract interactions
  - [ ] Add transaction confirmation and receipt handling
  - [ ] Implement real-time updates using event listeners

- [ ] **Issue #6:** Timeout & Forfeit UI Implementation
  - [ ] Add countdown timer component for move deadlines
  - [ ] Create forfeit button with confirmation modal
  - [ ] Implement timeout state display in game cards
  - [ ] Add visual indicators for games approaching timeout
  - [ ] Create notification system for timeout warnings
  - [ ] Implement automatic refresh for timeout updates
  - [ ] Add forfeit transaction handling and feedback

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
