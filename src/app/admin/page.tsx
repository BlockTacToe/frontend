"use client";

import { useState } from "react";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import { useAccount } from "wagmi";
import { formatEther, parseEther, Address } from "viem";
import { Shield, Settings, Coins, Clock, Users, Pause, Play } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const {
    isAdmin,
    isOwner,
    moveTimeout,
    platformFeePercent,
    platformFeeRecipient,
    paused,
    owner,
    supportedTokens,
    addAdmin,
    removeAdmin,
    setMoveTimeout,
    setPlatformFee,
    setPlatformFeeRecipient,
    setSupportedToken,
    pause,
    unpause,
    isPending,
    isConfirming,
  } = useBlOcXTacToe();

  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [removeAdminAddress, setRemoveAdminAddress] = useState("");
  const [newTimeout, setNewTimeout] = useState("");
  const [newFeePercent, setNewFeePercent] = useState("");
  const [newFeeRecipient, setNewFeeRecipient] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSupported, setTokenSupported] = useState(true);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
          <p className="text-gray-400">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  const handleAddAdmin = async () => {
    if (!newAdminAddress) {
      toast.error("Please enter an address");
      return;
    }
    try {
      await addAdmin(newAdminAddress as Address);
      setNewAdminAddress("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removeAdminAddress) {
      toast.error("Please enter an address");
      return;
    }
    try {
      await removeAdmin(removeAdminAddress as Address);
      setRemoveAdminAddress("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetTimeout = async () => {
    if (!newTimeout) {
      toast.error("Please enter a timeout value");
      return;
    }
    try {
      // Convert hours to seconds
      const hours = parseFloat(newTimeout);
      const seconds = BigInt(Math.floor(hours * 3600));
      await setMoveTimeout(seconds);
      setNewTimeout("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetFee = async () => {
    if (!newFeePercent) {
      toast.error("Please enter a fee percentage");
      return;
    }
    try {
      // Convert percentage to basis points (e.g., 1% = 100 basis points)
      const percent = parseFloat(newFeePercent);
      const basisPoints = BigInt(Math.floor(percent * 100));
      await setPlatformFee(basisPoints);
      setNewFeePercent("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetFeeRecipient = async () => {
    if (!newFeeRecipient) {
      toast.error("Please enter an address");
      return;
    }
    try {
      await setPlatformFeeRecipient(newFeeRecipient as Address);
      setNewFeeRecipient("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetToken = async () => {
    if (!tokenAddress) {
      toast.error("Please enter a token address");
      return;
    }
    try {
      await setSupportedToken(tokenAddress as Address, tokenSupported);
      setTokenAddress("");
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimeout = (seconds: bigint | undefined) => {
    if (!seconds) return "N/A";
    const hours = Number(seconds) / 3600;
    return `${hours} hours`;
  };

  const formatFeePercent = (basisPoints: bigint | undefined) => {
    if (!basisPoints) return "0%";
    const percent = Number(basisPoints) / 100;
    return `${percent}%`;
  };

  return (
    <div className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-400">
            {isOwner ? "Contract Owner" : "Admin"} • {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Contract Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Contract Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className={`text-lg font-medium ${paused ? "text-red-400" : "text-green-400"}`}>
                {paused ? "Paused" : "Active"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Owner</p>
              <p className="text-white text-sm font-mono">
                {typeof owner === "string" ? `${owner.slice(0, 10)}...${owner.slice(-8)}` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Move Timeout</p>
              <p className="text-white">{formatTimeout(typeof moveTimeout === "bigint" ? moveTimeout : undefined)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Platform Fee</p>
              <p className="text-white">{formatFeePercent(typeof platformFeePercent === "bigint" ? platformFeePercent : undefined)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-400 text-sm">Fee Recipient</p>
              <p className="text-white text-sm font-mono">
                {typeof platformFeeRecipient === "string" ? `${platformFeeRecipient.slice(0, 10)}...${platformFeeRecipient.slice(-8)}` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Pause/Unpause */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            Contract Control
          </h2>
          <button
            onClick={paused ? unpause : pause}
            disabled={isPending || isConfirming}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              paused
                ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending || isConfirming ? "Processing..." : paused ? "Unpause Contract" : "Pause Contract"}
          </button>
        </div>

        {/* Admin Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Management
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Add Admin Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAdminAddress}
                  onChange={(e) => setNewAdminAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={isPending || isConfirming}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Remove Admin Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={removeAdminAddress}
                  onChange={(e) => setRemoveAdminAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleRemoveAdmin}
                  disabled={isPending || isConfirming}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Contract Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Move Timeout (hours)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newTimeout}
                  onChange={(e) => setNewTimeout(e.target.value)}
                  placeholder="24"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetTimeout}
                  disabled={isPending || isConfirming}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Platform Fee (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={newFeePercent}
                  onChange={(e) => setNewFeePercent(e.target.value)}
                  placeholder="1.0"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetFee}
                  disabled={isPending || isConfirming}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Fee Recipient Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeeRecipient}
                  onChange={(e) => setNewFeeRecipient(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetFeeRecipient}
                  disabled={isPending || isConfirming}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token Management
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Supported Tokens</p>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                {Array.isArray(supportedTokens) && supportedTokens.length > 0 ? (
                  <div className="space-y-2">
                    {supportedTokens.map((token: Address, index: number) => (
                      <div key={index} className="text-sm font-mono text-white">
                        {token === "0x0000000000000000000000000000000000000000" ? "ETH (Native)" : token}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No tokens configured</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Token Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x... (or 0x0 for ETH)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <select
                  value={tokenSupported ? "true" : "false"}
                  onChange={(e) => setTokenSupported(e.target.value === "true")}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="true">Enable</option>
                  <option value="false">Disable</option>
                </select>
                <button
                  onClick={handleSetToken}
                  disabled={isPending || isConfirming}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50"
                >
                  {tokenSupported ? "Enable" : "Disable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

