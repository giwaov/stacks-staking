"use client";

import { useState } from "react";
import { openContractCall, showConnect } from "@stacks/connect";
import { STACKS_MAINNET } from "@stacks/network";
import { AnchorMode, PostConditionMode, uintCV } from "@stacks/transactions";

const CONTRACT_ADDRESS = "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY";
const CONTRACT_NAME = "staking";

export default function Staking() {
  const [address, setAddress] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const connectWallet = () => {
    showConnect({
      appDetails: { name: "Stacks Staking", icon: "/logo.png" },
      onFinish: () => {
        const userData = JSON.parse(localStorage.getItem("blockstack-session") || "{}");
        setAddress(userData?.userData?.profile?.stxAddress?.mainnet || null);
      },
      userSession: undefined,
    });
  };

  const stake = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await openContractCall({
        network: STACKS_MAINNET,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "stake",
        functionArgs: [uintCV(Math.floor(Number(amount) * 1000000))],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const unstake = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await openContractCall({
        network: STACKS_MAINNET,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "unstake",
        functionArgs: [uintCV(Math.floor(Number(amount) * 1000000))],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network: STACKS_MAINNET,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "claim-rewards",
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-800 to-teal-900 text-white p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">💎 STX Staking</h1>
        <p className="text-center text-gray-300 mb-8">Stake STX and earn rewards</p>

        {!address ? (
          <button onClick={connectWallet} className="w-full bg-teal-500 hover:bg-teal-600 py-3 rounded-lg font-semibold">
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Connected</p>
              <p className="font-mono">{address.slice(0, 10)}...{address.slice(-6)}</p>
            </div>

            <div className="bg-white/10 p-6 rounded-lg text-center">
              <p className="text-gray-400 text-sm">APY</p>
              <p className="text-4xl font-bold text-green-400">5%</p>
            </div>

            <div className="bg-white/10 p-6 rounded-lg space-y-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (STX)"
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3"
              />
              <div className="grid grid-cols-2 gap-4">
                <button onClick={stake} disabled={loading} className="bg-green-600 hover:bg-green-700 py-3 rounded-lg disabled:opacity-50">
                  {loading ? "..." : "Stake"}
                </button>
                <button onClick={unstake} disabled={loading} className="bg-red-600 hover:bg-red-700 py-3 rounded-lg disabled:opacity-50">
                  {loading ? "..." : "Unstake"}
                </button>
              </div>
              <button onClick={claimRewards} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded-lg disabled:opacity-50">
                {loading ? "Claiming..." : "Claim Rewards"}
              </button>
            </div>

            {txId && (
              <div className="bg-green-500/20 border border-green-500 p-4 rounded-lg">
                <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" className="text-green-300 underline break-all">
                  View Transaction
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
