# 🎮 Simulation Mode

## Overview

Simulation Mode allows you to test the entire BlockTacToe application **without deploying a smart contract**. This is perfect for:
- Testing the UI and UX
- Demonstrating the game flow
- Development and debugging
- Testing with multiple wallets

## How It Works

When `NEXT_PUBLIC_CONTRACT_ADDRESS` is not set (or set to `0x0000000000000000000000000000000000000000`), the app automatically switches to **Simulation Mode**.

### Features

✅ **Automatic Activation** - No configuration needed  
✅ **Full Game Functionality** - Create, join, make moves, detect winners  
✅ **Data Persistence** - Games saved to localStorage (survives page refresh)  
✅ **Visual Indicator** - Shows "Simulation Mode" badge on create page  
✅ **Multiple Wallets** - Test with different wallet addresses  

## Game Data Storage

Games are stored in browser localStorage:
- **Key:** `blocktactoe_simulation_games`
- **Game ID Counter:** `blocktactoe_next_game_id`
- **Format:** JSON with BigInt values serialized as strings

## Testing Flow

### 1. Create a Game
1. Connect your wallet
2. Go to `/create` page
3. Enter bet amount (e.g., 0.01 ETH)
4. Click "Create Game"
5. ✅ Game created! Redirected to play page

### 2. View All Games
1. Go to `/games` page
2. See all created games
3. Games persist across page refreshes

### 3. Join a Game (Different Wallet)
1. Switch to a different wallet address (or use incognito)
2. Go to `/games` page
3. Click "Join Game" on a waiting game
4. ✅ Game joined! Both players can now play

### 4. Play the Game
1. Take turns making moves
2. Winner is detected automatically
3. Winner celebration shows up
4. Game status updates in real-time

## Switching to Real Contract Mode

When you're ready to use a real smart contract:

1. **Deploy your contract** to Sepolia (or your preferred network)

2. **Set the contract address** in `.env.local`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

4. ✅ The app automatically switches from simulation to real contract mode!

## Simulation vs Real Contract

| Feature | Simulation Mode | Real Contract Mode |
|---------|----------------|-------------------|
| Data Storage | localStorage | Blockchain |
| Transactions | Instant (1 second delay) | Real blockchain transactions |
| Gas Fees | None | Requires ETH for gas |
| Persistence | Browser only | Permanent on-chain |
| Network | Not required | Sepolia testnet |

## Notes

- Simulation mode is **only for development/testing**
- Games created in simulation mode **won't be available** when you switch to real contract mode
- To clear simulation data, clear your browser's localStorage
- Each browser/device has its own simulation game storage

## Clearing Simulation Data

To reset all simulation games:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find "Local Storage" → Your domain
4. Delete:
   - `blocktactoe_simulation_games`
   - `blocktactoe_next_game_id`

Or run in console:
```javascript
localStorage.removeItem('blocktactoe_simulation_games');
localStorage.removeItem('blocktactoe_next_game_id');
location.reload();
```

