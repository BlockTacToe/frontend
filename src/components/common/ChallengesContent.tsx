"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import {
  usePlayerChallenges,
  useChallengeData,
  usePlayerData,
} from "@/hooks/useGameData";
import {
  Loader2,
  Sword,
  CheckCircle,
  XCircle,
  UserPlus,
  Coins,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { waitForTransactionReceipt } from "viem/actions";
import { usePublicClient, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { formatEther, Address } from "viem";
import { PlayerSearch } from "./PlayerSearch";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";
import { CONTRACT_ADDRESS } from "@/config/constants";

// Extract ABI array from Hardhat artifact
const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

export function ChallengesContent() {
  const { address, isConnected } = useAccount();
  const { createChallenge, acceptChallenge, isPending, isConfirming } =
    useBlOcXTacToe();
  const { challengeIds, isLoading: challengesLoading } =
    usePlayerChallenges(address);
  const publicClient = usePublicClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    "incoming"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [challengedAddress, setChallengedAddress] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Address>(
    "0x0000000000000000000000000000000000000000" as Address
  );
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [boardSize, setBoardSize] = useState<number>(3);

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
      const hash = await createChallenge(
        challengedAddress as Address,
        betAmount,
        selectedToken,
        boardSize
      );
      if (typeof hash === "string" && publicClient) {
        // Waiting for confirmation - toast removed per user request
        await waitForTransactionReceipt(publicClient, {
          hash: hash as `0x${string}`,
        });
        toast.success("Challenge created successfully!");
        setShowCreateModal(false);
        setChallengedAddress("");
        setBetAmount("");
        setSelectedToken(
          "0x0000000000000000000000000000000000000000" as Address
        );
        setBoardSize(3);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create challenge");
    }
  };

  const handleAcceptChallenge = async (
    challengeId: bigint,
    moveIndex: number
  ) => {
    if (moveIndex === null || moveIndex === undefined) {
      toast.error("Please select your first move");
      return;
    }

    try {
      const hash = await acceptChallenge(challengeId, moveIndex);
      if (typeof hash === "string" && publicClient) {
        // Waiting for confirmation - toast removed per user request
        const receipt = await waitForTransactionReceipt(publicClient, {
          hash: hash as `0x${string}`,
        });

        // Decode ChallengeAccepted event to get gameId
        const blocxtactoeAbiArtifact = await import(
          "@/abi/blocxtactoeabi.json"
        );
        const blocxtactoeAbi = (
          blocxtactoeAbiArtifact as unknown as { abi: unknown[] }
        ).abi;
        const { decodeEventLog } = await import("viem");

        let gameId: bigint | null = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: blocxtactoeAbi,
              data: log.data,
              topics: log.topics,
            });
            if (
              decoded.eventName === "ChallengeAccepted" &&
              decoded.args &&
              "gameId" in decoded.args
            ) {
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
      <div className="text-center py-8 sm:py-12 px-4">
        <p className="text-gray-400 text-sm sm:text-base">
          Connect your wallet to view challenges
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
              Challenges
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              Challenge other players or accept incoming challenges
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all border border-orange-500/30 text-xs sm:text-sm w-full sm:w-auto"
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Create Challenge</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              activeTab === "incoming"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
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
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {challengeIds &&
            Array.isArray(challengeIds) &&
            challengeIds.length > 0 ? (
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
              <div className="text-center py-8 sm:py-12 bg-white/5 rounded-lg border border-white/10">
                <Sword className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                <p className="text-gray-400 text-sm sm:text-base">
                  No challenges found
                </p>
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
            supportedTokens={supportedTokens as Address[] | undefined}
            boardSize={boardSize}
            setBoardSize={setBoardSize}
            onPlayerSelect={handlePlayerSelect}
            onClose={() => {
              setShowCreateModal(false);
              setChallengedAddress("");
              setBetAmount("");
              setSelectedToken(
                "0x0000000000000000000000000000000000000000" as Address
              );
              setBoardSize(3);
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
  onAccept: (challengeId: bigint, moveIndex: number) => void;
  isPending: boolean;
}) {
  const { challenge, isLoading } = useChallengeData(challengeId);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
      </div>
    );
  }

  if (!challenge) return null;

  // Handle challenge as tuple or object
  const challengeData = Array.isArray(challenge)
    ? {
        challenger: challenge[0] as Address,
        challengerUsername: challenge[1] as string,
        challenged: challenge[2] as Address,
        challengedUsername: challenge[3] as string,
        betAmount: challenge[4] as bigint,
        tokenAddress: challenge[5] as Address,
        timestamp: challenge[6] as bigint,
        accepted: challenge[7] as boolean,
        gameId: challenge[8] as bigint,
      }
    : (challenge as {
        challenger: Address;
        challengerUsername: string;
        challenged: Address;
        challengedUsername: string;
        betAmount: bigint;
        tokenAddress: Address;
        timestamp: bigint;
        accepted: boolean;
        gameId: bigint;
      });

  const isChallenger =
    challengeData.challenger?.toLowerCase() === currentAddress?.toLowerCase();
  const isChallenged =
    challengeData.challenged?.toLowerCase() === currentAddress?.toLowerCase();
  const canAccept = isChallenged && !challengeData.accepted;

  return (
    <>
      <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4 md:p-6 hover:border-white/20 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <Sword
                className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                  isChallenger ? "text-orange-500" : "text-blue-500"
                }`}
              />
              <span className="text-white font-semibold text-sm sm:text-base truncate">
                {isChallenger ? "You challenged" : "Challenged by"}{" "}
                {isChallenger
                  ? challengeData.challengedUsername
                  : challengeData.challengerUsername}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400 space-y-0.5 sm:space-y-1">
              <p>
                Bet:{" "}
                <span className="text-white">
                  {formatEther(challengeData.betAmount || BigInt(0))} ETH
                </span>
              </p>
              <p>
                Status:{" "}
                <span
                  className={
                    challengeData.accepted
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                >
                  {challengeData.accepted ? "Accepted" : "Pending"}
                </span>
              </p>
              {challengeData.accepted && challengeData.gameId && (
                <p className="hidden sm:block">
                  Game ID:{" "}
                  <span className="text-white">
                    #{challengeData.gameId.toString()}
                  </span>
                </p>
              )}
            </div>
          </div>
          {canAccept && (
            <button
              onClick={() => setShowAcceptModal(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 sm:gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all border border-green-500/30 disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              Accept
            </button>
          )}
        </div>
      </div>

      {showAcceptModal && (
        <AcceptChallengeModal
          challengeId={challengeId}
          betAmount={challengeData.betAmount}
          onClose={() => {
            setShowAcceptModal(false);
            setSelectedMove(null);
          }}
          onAccept={(moveIndex) => {
            onAccept(challengeId, moveIndex);
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
  boardSize,
  setBoardSize,
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
  boardSize: number;
  setBoardSize: (size: number) => void;
  onPlayerSelect: (address: Address, username: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Create Challenge
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Search Player by Username
            </label>
            <PlayerSearch onPlayerSelect={onPlayerSelect} />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Or Enter Address Directly
            </label>
            <input
              type="text"
              value={challengedAddress}
              onChange={(e) => setChallengedAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Payment Token
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTokenSelector(!showTokenSelector)}
                className="w-full flex items-center justify-between px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  {selectedToken ===
                  "0x0000000000000000000000000000000000000000" ? (
                    "ETH (Native)"
                  ) : (
                    <TokenLabel tokenAddress={selectedToken} />
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showTokenSelector ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showTokenSelector &&
                supportedTokens &&
                Array.isArray(supportedTokens) && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedToken(
                          "0x0000000000000000000000000000000000000000" as Address
                        );
                        setShowTokenSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${
                        selectedToken ===
                        "0x0000000000000000000000000000000000000000"
                          ? "bg-orange-500/20 text-orange-400"
                          : "text-white"
                      }`}
                    >
                      ETH (Native)
                    </button>
                    {supportedTokens
                      .filter(
                        (t) =>
                          t !== "0x0000000000000000000000000000000000000000"
                      )
                      .map((token: Address) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => {
                            setSelectedToken(token);
                            setShowTokenSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${
                            selectedToken === token
                              ? "bg-orange-500/20 text-orange-400"
                              : "text-white"
                          }`}
                        >
                          <TokenLabel tokenAddress={token} />
                        </button>
                      ))}
                  </div>
                )}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Select the token to use for betting. ETH is the default.
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Bet Amount
            </label>
            <div className="relative">
              <Coins className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <input
                type="number"
                step="0.000000000000000001"
                min="0.000000000000000001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.01"
                className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Board Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBoardSize(3)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border text-xs sm:text-sm ${
                  boardSize === 3
                    ? "bg-orange-500/30 border-orange-500/50 text-orange-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                3 × 3
              </button>
              <button
                type="button"
                onClick={() => setBoardSize(5)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border text-xs sm:text-sm ${
                  boardSize === 5
                    ? "bg-orange-500/30 border-orange-500/50 text-orange-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                5 × 5
              </button>
              <button
                type="button"
                onClick={() => setBoardSize(7)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border text-xs sm:text-sm ${
                  boardSize === 7
                    ? "bg-orange-500/30 border-orange-500/50 text-orange-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                7 × 7
              </button>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !challengedAddress || !betAmount}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-all border border-orange-500/30 disabled:opacity-50 text-xs sm:text-sm"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Accept Challenge
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <p className="text-gray-300 text-sm sm:text-base">
            Bet Amount:{" "}
            <span className="text-white font-semibold">
              {formatEther(betAmount)} ETH
            </span>
          </p>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Select Your First Move (O)
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedMove(index)}
                  disabled={isPending}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg border-2 transition-all
                    ${
                      selectedMove === index
                        ? "bg-white/20 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="text-lg sm:text-xl font-bold text-orange-500">
                    O
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => selectedMove !== null && onAccept(selectedMove)}
              disabled={isPending || selectedMove === null}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-all border border-green-500/30 disabled:opacity-50 text-xs sm:text-sm"
            >
              {isPending ? "Accepting..." : "Accept Challenge"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenLabel({ tokenAddress }: { tokenAddress: Address }) {
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: [tokenAddress],
    query: { enabled: !!tokenAddress },
  });

  const displayName =
    tokenAddress === "0x0000000000000000000000000000000000000000"
      ? "ETH (Native)"
      : tokenName && typeof tokenName === "string" && tokenName.length > 0
      ? tokenName
      : `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  return <>{displayName}</>;
}
