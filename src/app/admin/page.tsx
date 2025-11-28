"use client";

import { useState } from "react";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, parseEther, Address } from "viem";
import { Shield, Settings, Coins, Clock, Users, Pause, Play } from "lucide-react";
import { toast } from "react-hot-toast";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";
import { CONTRACT_ADDRESS } from "@/config/constants";

// Extract ABI array from Hardhat artifact
const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

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
  const [tokenName, setTokenName] = useState("");
  const [tokenSupported, setTokenSupported] = useState(true);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Admin Panel</h1>
          <p className="text-sm sm:text-base text-gray-400">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-sm sm:text-base text-gray-400">You do not have admin privileges.</p>
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
    if (tokenSupported && !tokenName.trim()) {
      toast.error("Please enter a token name when enabling a token");
      return;
    }
    try {
      await setSupportedToken(tokenAddress as Address, tokenSupported, tokenName.trim());
      setTokenAddress("");
      setTokenName("");
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
    <div 
      className="min-h-screen px-2 sm:px-4 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-12 md:pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `url('/Blocxtactoe-bg-img.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Blur overlay with dark gradient */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.85) 100%)',
        }}
      ></div>
      
      {/* Content with proper z-index */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            {isOwner ? "Contract Owner" : "Admin"} • {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Contract Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Contract Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Status</p>
              <p className={`text-sm sm:text-lg font-medium ${paused ? "text-red-400" : "text-green-400"}`}>
                {paused ? "Paused" : "Active"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Owner</p>
              <p className="text-white text-xs sm:text-sm font-mono">
                {typeof owner === "string" ? `${owner.slice(0, 10)}...${owner.slice(-8)}` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Move Timeout</p>
              <p className="text-white text-sm sm:text-base">{formatTimeout(typeof moveTimeout === "bigint" ? moveTimeout : undefined)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Platform Fee</p>
              <p className="text-white text-sm sm:text-base">{formatFeePercent(typeof platformFeePercent === "bigint" ? platformFeePercent : undefined)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-400 text-xs sm:text-sm">Fee Recipient</p>
              <p className="text-white text-xs sm:text-sm font-mono">
                {typeof platformFeeRecipient === "string" ? `${platformFeeRecipient.slice(0, 10)}...${platformFeeRecipient.slice(-8)}` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Pause/Unpause */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            {paused ? <Play className="w-4 h-4 sm:w-5 sm:h-5" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
            Contract Control
          </h2>
          <button
            onClick={paused ? unpause : pause}
            disabled={isPending || isConfirming}
            className={`px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-all ${
              paused
                ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending || isConfirming ? "Processing..." : paused ? "Unpause Contract" : "Pause Contract"}
          </button>
        </div>

        {/* Admin Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Admin Management
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Add Admin Address</label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={newAdminAddress}
                  onChange={(e) => setNewAdminAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={isPending || isConfirming}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Remove Admin Address</label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={removeAdminAddress}
                  onChange={(e) => setRemoveAdminAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleRemoveAdmin}
                  disabled={isPending || isConfirming}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Contract Settings
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Move Timeout (hours)</label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="number"
                  value={newTimeout}
                  onChange={(e) => setNewTimeout(e.target.value)}
                  placeholder="24"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetTimeout}
                  disabled={isPending || isConfirming}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Set
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Platform Fee (%)</label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={newFeePercent}
                  onChange={(e) => setNewFeePercent(e.target.value)}
                  placeholder="1.0"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetFee}
                  disabled={isPending || isConfirming}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Set
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Fee Recipient Address</label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={newFeeRecipient}
                  onChange={(e) => setNewFeeRecipient(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetFeeRecipient}
                  disabled={isPending || isConfirming}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            Token Management
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Supported Tokens</p>
              <div className="bg-white/5 rounded-lg p-2 sm:p-4 border border-white/10">
                {Array.isArray(supportedTokens) && supportedTokens.length > 0 ? (
                  <div className="space-y-1.5 sm:space-y-2">
                    {supportedTokens.map((token: Address, index: number) => (
                      <TokenDisplay key={index} tokenAddress={token} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs sm:text-sm">No tokens configured</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Token Address</label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x... (or 0x0 for ETH)"
                className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>
            {tokenSupported && (
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Token Name/Symbol</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g., USDC, DAI, WETH"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
              </div>
            )}
            <div>
              <div className="flex gap-1.5 sm:gap-2">
                <select
                  value={tokenSupported ? "true" : "false"}
                  onChange={(e) => {
                    setTokenSupported(e.target.value === "true");
                    if (e.target.value === "false") setTokenName("");
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white"
                >
                  <option value="true">Enable</option>
                  <option value="false">Disable</option>
                </select>
                <button
                  onClick={handleSetToken}
                  disabled={isPending || isConfirming}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium whitespace-nowrap"
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

function TokenDisplay({ tokenAddress }: { tokenAddress: Address }) {
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: [tokenAddress],
  });

  const displayName = tokenName && typeof tokenName === "string" && tokenName.length > 0 
    ? tokenName 
    : tokenAddress === "0x0000000000000000000000000000000000000000" 
    ? "ETH (Native)" 
    : tokenAddress;

  const hasName = tokenName && typeof tokenName === "string" && tokenName.length > 0;
  const isNotEth = tokenAddress !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="text-xs sm:text-sm text-white">
      <span className="font-semibold">{displayName}</span>
      {hasName && isNotEth ? (
        <span className="text-gray-400 font-mono ml-2 text-[10px] sm:text-xs">({tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)})</span>
      ) : null}
    </div>
  );
}

