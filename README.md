# ZKMent

A web wallet that supports ZK compressed assets on Solana.

## Introduction

ZKMent is a secure and user-friendly web wallet designed to manage ZK (Zero-Knowledge) compressed assets on the Solana blockchain. It leverages advanced cryptographic techniques to ensure privacy and efficiency, providing users with a seamless experience for handling their compressed digital assets.

## Tech Stack

ZKMent is built using a modern and robust set of technologies to ensure scalability, security, and a smooth user experience.

### Frontend

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Vite**: A build tool for modern web development.

### Blockchain

- **Solana**: High-performance blockchain supporting builders around the world.
- **Helius**: RPC provider.
- **Light Protocol**: Zero-Knowledge Compression.

## Environment Variables

ZKMent requires certain environment variables to be set for proper configuration. Create a `.env` file in the root directory based on the provided `.env.example` files.

| Variable                         | Description                                     | Example                                                          |
| -------------------------------- | ------------------------------------------------| ---------------------------------------------------------------- |
| `VITE_DEVNET_RPC`                | RPC URL for Solana Devnet                       | `https://devnet.helius-rpc.com?api-key=<YOUR_API_KEY>`           |
| `VITE_MAINNET_RPC`               | RPC URL for Solana Mainnet                      | `https://mainnet.helius-rpc.com?api-key=<YOUR_API_KEY>`          |

## Installation

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**