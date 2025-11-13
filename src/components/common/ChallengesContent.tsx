"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import { usePlayerChallenges, useChallengeData, usePlayerData } from "@/hooks/useGameData";
import { Loader2, Sword, CheckCircle, XCircle, UserPlus, Coins, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { waitForTransactionReceipt } from "viem/actions";
import { usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import { formatEther, Address } from "viem";
import { PlayerSearch } from "./PlayerSearch";

export function ChallengesContent() {
  const { address, isConnected } = useAccount();
  const { createChallenge, acceptChallenge, isPending, isConfirming } = useBlOcXTacToe();
  const { challengeIds, isLoading: challengesLoading } = usePlayerChallenges(address);
  const publicClient = usePublicClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [challengedAddress, setChallengedAddress] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Address>("0x0000000000000000000000000000000000000000" as Address);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  
  const { player: playerData } = usePlayerData(address);
  const { supportedTokens } = useBlOcXTacToe();

  const handlePlayerSelect = (address: Address, username: string) => {
    setChallengedAddress(address);
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengedAddress || !betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const hash = await createChallenge(challengedAddress as Address, betAmount, selectedToken);
      if (hash && publicClient) {
        toast.info("Waiting for transaction confirmation...");
        await waitForTransactionReceipt(publicClient, { hash: hash as `0x${string}` });
        toast.success("Challenge created successfully!");
        setShowCreateModal(false);
        setChallengedAddress("");
        setBetAmount("");
        setSelectedToken("0x0000000000000000000000000000000000000000" as Address);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create challenge");
    }
  };

  const handleAcceptChallenge = async (challengeId: bigint) => {
    if (selectedMove === null) {
      toast.error("Please select your first move");
      return;
    }

    try {
      const hash = await acceptChallenge(challengeId, selectedMove);
      if (hash && publicClient) {
        toast.info("Waiting for transaction confirmation...");
        const receipt = await waitForTransactionReceipt(publicClient, { hash: hash as `0x${string}` });
        
        // Decode ChallengeAccepted event to get gameId
        const blocxtactoeAbi = await import("@/abi/blocxtactoeabi.json");
        const { decodeEventLog } = await import("viem");
        
        let gameId: bigint | null = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: blocxtactoeAbi.default,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "ChallengeAccepted" && decoded.args && "gameId" in decoded.args) {
              gameId = decoded.args.gameId as bigint;
              break;
            }
          } catch {
            // Not the event we're looking for
          }
        }

        if (gameId !== null) {
          toast.success("Challenge accepted! Starting game...");
          router.push(`/play/${gameId.toString()}`);
        } else {
          toast.success("Challenge accepted!");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to accept challenge");
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Connect your wallet to view challenges</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Challenges</h1>
            <p className="text-gray-400">Challenge other players or accept incoming challenges</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg font-medium transition-all border border-orange-500/30"
          >
            <UserPlus className="w-4 h-4" />
            Create Challenge
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "incoming"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "outgoing"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Outgoing
          </button>
        </div>

        {/* Challenges List */}
        {challengesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {challengeIds && Array.isArray(challengeIds) && challengeIds.length > 0 ? (
              challengeIds.map((challengeId) => (
                <ChallengeCard
                  key={challengeId.toString()}
                  challengeId={challengeId}
                  currentAddress={address}
                  onAccept={handleAcceptChallenge}
                  isPending={isPending || isConfirming}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                <Sword className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No challenges found</p>
              </div>
            )}
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateModal && (
        <CreateChallengeModal
          challengedAddress={challengedAddress}
          setChallengedAddress={setChallengedAddress}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          showTokenSelector={showTokenSelector}
          setShowTokenSelector={setShowTokenSelector}
          supportedTokens={supportedTokens}
          onPlayerSelect={handlePlayerSelect}
          onClose={() => {
            setShowCreateModal(false);
            setChallengedAddress("");
            setBetAmount("");
            setSelectedToken("0x0000000000000000000000000000000000000000" as Address);
          }}
          onSubmit={handleCreateChallenge}
          isPending={isPending || isConfirming}
        />
        )}
      </div>
    </div>
  );
}

function ChallengeCard({
  challengeId,
  currentAddress,
  onAccept,
  isPending,
}: {
  challengeId: bigint;
  currentAddress: string | undefined;
  onAccept: (challengeId: bigint) => void;
  isPending: boolean;
}) {
  const { challenge, isLoading } = useChallengeData(challengeId);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  if (!challenge) return null;

  // Handle challenge as tuple or object
  const challengeData = Array.isArray(challenge) ? {
    challenger: challenge[0] as Address,
    challengerUsername: challenge[1] as string,
    challenged: challenge[2] as Address,
    challengedUsername: challenge[3] as string,
    betAmount: challenge[4] as bigint,
    tokenAddress: challenge[5] as Address,
    timestamp: challenge[6] as bigint,
    accepted: challenge[7] as boolean,
    gameId: challenge[8] as bigint,
  } : challenge as {
    challenger: Address;
    challengerUsername: string;
    challenged: Address;
    challengedUsername: string;
    betAmount: bigint;
    tokenAddress: Address;
    timestamp: bigint;
    accepted: boolean;
    gameId: bigint;
  };

  const isChallenger = challengeData.challenger?.toLowerCase() === currentAddress?.toLowerCase();
  const isChallenged = challengeData.challenged?.toLowerCase() === currentAddress?.toLowerCase();
  const canAccept = isChallenged && !challengeData.accepted;

  return (
    <>
      <div className="bg-white/5 rounded-lg border border-white/10 p-6 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Sword className={`w-5 h-5 ${isChallenger ? "text-orange-500" : "text-blue-500"}`} />
              <span className="text-white font-semibold">
                {isChallenger ? "You challenged" : "Challenged by"} {isChallenger ? challengeData.challengedUsername : challengeData.challengerUsername}
              </span>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Bet Amount: <span className="text-white">{formatEther(challengeData.betAmount || BigInt(0))} ETH</span></p>
              <p>Status: <span className={challengeData.accepted ? "text-green-400" : "text-yellow-400"}>
                {challengeData.accepted ? "Accepted" : "Pending"}
              </span></p>
              {challengeData.accepted && challengeData.gameId && (
                <p>Game ID: <span className="text-white">#{challengeData.gameId.toString()}</span></p>
              )}
            </div>
          </div>
          {canAccept && (
            <button
              onClick={() => setShowAcceptModal(true)}
              disabled={isPending}
              className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium transition-all border border-green-500/30 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
          )}
        </div>
      </div>

      {showAcceptModal && (
        <AcceptChallengeModal
          challengeId={challengeId}
          betAmount={challenge.betAmount || BigInt(0)}
          onClose={() => {
            setShowAcceptModal(false);
            setSelectedMove(null);
          }}
          onAccept={(moveIndex) => {
            onAccept(challengeId);
            setShowAcceptModal(false);
          }}
          selectedMove={selectedMove}
          setSelectedMove={setSelectedMove}
          isPending={isPending}
        />
      )}
    </>
  );
}

function CreateChallengeModal({
  challengedAddress,
  setChallengedAddress,
  betAmount,
  setBetAmount,
  selectedToken,
  setSelectedToken,
  showTokenSelector,
  setShowTokenSelector,
  supportedTokens,
  onPlayerSelect,
  onClose,
  onSubmit,
  isPending,
}: {
  challengedAddress: string;
  setChallengedAddress: (addr: string) => void;
  betAmount: string;
  setBetAmount: (amount: string) => void;
  selectedToken: Address;
  setSelectedToken: (token: Address) => void;
  showTokenSelector: boolean;
  setShowTokenSelector: (show: boolean) => void;
  supportedTokens: Address[] | undefined;
  onPlayerSelect: (address: Address, username: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Challenge</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Player by Username
            </label>
            <PlayerSearch onPlayerSelect={onPlayerSelect} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or Enter Address Directly
            </label>
            <input
              type="text"
              value={challengedAddress}
              onChange={(e) => setChallengedAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Token
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTokenSelector(!showTokenSelector)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  {selectedToken === "0x0000000000000000000000000000000000000000" ? "ETH (Native)" : `${selectedToken.slice(0, 6)}...${selectedToken.slice(-4)}`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showTokenSelector ? "rotate-180" : ""}`} />
              </button>
              {showTokenSelector && supportedTokens && Array.isArray(supportedTokens) && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedToken("0x0000000000000000000000000000000000000000" as Address);
                      setShowTokenSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${
                      selectedToken === "0x0000000000000000000000000000000000000000" ? "bg-orange-500/20 text-orange-400" : "text-white"
                    }`}
                  >
                    ETH (Native)
                  </button>
                  {supportedTokens.map((token: Address) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => {
                        setSelectedToken(token);
                        setShowTokenSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${
                        selectedToken === token ? "bg-orange-500/20 text-orange-400" : "text-white"
                      }`}
                    >
                      {token.slice(0, 6)}...{token.slice(-4)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.01"
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !challengedAddress || !betAmount}
              className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-all border border-orange-500/30 disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AcceptChallengeModal({
  challengeId,
  betAmount,
  onClose,
  onAccept,
  selectedMove,
  setSelectedMove,
  isPending,
}: {
  challengeId: bigint;
  betAmount: bigint;
  onClose: () => void;
  onAccept: (moveIndex: number) => void;
  selectedMove: number | null;
  setSelectedMove: (move: number | null) => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Accept Challenge</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Bet Amount: <span className="text-white font-semibold">{formatEther(betAmount)} ETH</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Your First Move (O)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedMove(index)}
                  disabled={isPending}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg border-2 transition-all
                    ${selectedMove === index
                      ? "bg-white/20 border-white text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="text-xl font-bold text-orange-500">O</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => selectedMove !== null && onAccept(selectedMove)}
              disabled={isPending || selectedMove === null}
              className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-all border border-green-500/30 disabled:opacity-50"
            >
              {isPending ? "Accepting..." : "Accept Challenge"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

