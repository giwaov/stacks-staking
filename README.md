# Stacks Staking

[![Stacks](https://img.shields.io/badge/Stacks-Mainnet-5546FF)](https://stacks.co)
[![Clarity](https://img.shields.io/badge/Clarity-Smart%20Contract-orange)](https://clarity-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A STX staking protocol with compound rewards on Stacks blockchain.

## Features

- 💎 Stake STX and earn rewards
- 📈 5% APY reward rate
- 🔄 Flexible stake/unstake anytime
- 💰 Claim rewards to wallet
- 🔁 **Auto-compound** - Reinvest rewards automatically
- 🚨 **Emergency withdraw** - Exit quickly if needed

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Blockchain**: Stacks Mainnet
- **Smart Contract**: Clarity
- **Libraries**: @stacks/connect, @stacks/transactions, @stacks/network

## Contract Functions

### Write Functions
- `stake (amount)` - Stake STX tokens
- `unstake (amount)` - Withdraw staked tokens
- `claim-rewards` - Claim accumulated rewards to wallet
- `compound-rewards` - Reinvest rewards back into stake
- `emergency-withdraw` - Withdraw all (forfeits pending rewards)

### Read Functions
- `get-stake (staker)` - Get user stake info
- `calculate-rewards (staker)` - Calculate pending rewards
- `get-estimated-apy` - Get current APY in basis points
- `get-stake-duration (staker)` - Get blocks since stake started
- `is-staking (staker)` - Check if user has active stake

## Getting Started

```bash
npm install
npm run dev
```

## Contract Address

Deployed on Stacks Mainnet: `SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.staking`

## License

MIT
