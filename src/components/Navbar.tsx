"use client";

import Link from "next/link";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useDisconnect } from "@reown/appkit/react";
import { useWalletInfo } from "@reown/appkit/react";
import { useAccount, useDisconnect as useWagmiDisconnect } from "wagmi";
import { ChevronDown, LogOut, Menu, Wallet, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // AppKit hooks
  const { address: appkitAddress, isConnected: appkitIsConnected } = useAppKitAccount();
  const { open, close } = useAppKit();
  const { walletInfo } = useWalletInfo();
  const { disconnect: appkitDisconnect } = useDisconnect();

  // Wagmi hooks
  const { address: wagmiAddress, isConnected: wagmiIsConnected, connector } = useAccount();
  const { disconnect: wagmiDisconnect } = useWagmiDisconnect();

  const address = appkitAddress || wagmiAddress;
  const isConnected = appkitIsConnected || wagmiIsConnected;

  useEffect(() => setMounted(true), []);

  const truncateAddress = (addr: string | undefined) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const getWalletIcon = () => {
    const sanitizeImageUrl = (url: string) => {
      if (!url) return null;
      try {
        const trimmedUrl = url.trim();
        if (trimmedUrl.startsWith('data:')) {
          return trimmedUrl;
        }
        new URL(trimmedUrl);
        return trimmedUrl;
      } catch {
        return null;
      }
    };

    if (walletInfo?.icon) {
      const sanitizedUrl = sanitizeImageUrl(walletInfo.icon);
      if (sanitizedUrl) {
        return (
          <Image
            src={sanitizedUrl}
            alt={walletInfo.name || "Wallet"}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
            onError={() => {}}
            unoptimized
          />
        );
      }
    }

    if (connector?.icon) {
      const sanitizedUrl = sanitizeImageUrl(connector.icon);
      if (sanitizedUrl) {
        return (
          <Image
            src={sanitizedUrl}
            alt={connector.name || "Wallet"}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
            onError={() => {}}
            unoptimized
          />
        );
      }
    }

    return <Wallet className="w-6 h-6 text-[#3B82F6]" />;
  };

  const getWalletName = () => walletInfo?.name || connector?.name || "Connected Wallet";

  const handleConnect = async () => {
    try {
      await open();
    } catch (error: unknown) {
      console.error("Connection error:", error instanceof Error ? error.message : String(error));
    }
  };

  const handleDisconnect = () => {
    setIsDropdownOpen(false);
    try {
      if (appkitIsConnected) {
        appkitDisconnect();
      }
      if (wagmiIsConnected) {
        wagmiDisconnect();
      }
      close();
      router.push("/");
    } catch (error: unknown) {
      console.error("Disconnect error:", error instanceof Error ? error.message : String(error));
    }
  };

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("[data-menu-toggle]")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="flex items-center justify-between py-4 px-6 md:px-12 w-full relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-[#3B82F6] font-bold text-2xl flex gap-2 items-center">
            <span className="text-3xl">⭕</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BlockTacToe
            </span>
          </div>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <Link
          href="/"
          className={`transition-colors ${
            isActive("/") ? "text-[#3B82F6] font-medium" : "text-gray-200 hover:text-[#3B82F6]/60"
          }`}
        >
          Home
        </Link>
        <Link
          href="/games"
          className={`transition-colors ${
            isActive("/games") ? "text-[#3B82F6] font-medium" : "text-gray-200 hover:text-[#3B82F6]/60"
          }`}
        >
          Games
        </Link>
        <Link
          href="/create"
          className={`transition-colors ${
            isActive("/create") ? "text-[#3B82F6] font-medium" : "text-gray-200 hover:text-[#3B82F6]/60"
          }`}
        >
          Create Game
        </Link>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-md mt-2 py-4 px-6 rounded-lg shadow-xl z-40 md:hidden flex flex-col space-y-4 border border-purple-500/20"
        >
          <Link
            href="/"
            className={`transition-colors ${
              isActive("/") ? "text-[#3B82F6] font-medium" : "text-gray-200 hover:text-[#3B82F6]/60"
            }`}
          >
            Home
          </Link>
          <Link
            href="/games"
            className={`transition-colors ${
              isActive("/games") ? "text-[#3B82F6] font-medium" : "text-gray-200 hover:text-[#3B82F6]/60"
            }`}
          >
            Games
          </Link>
          <Link
            href="/create"
            className={`transition-colors ${
              isActive("/create") ? "text-[#3B82F6] font-medium" : "text-gray-200 hover:text-[#3B82F6]/60"
            }`}
          >
            Create Game
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!mounted ? (
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 md:py-3 md:px-10 rounded-lg text-sm md:text-base cursor-pointer font-medium shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all">
            Connect Wallet
          </button>
        ) : isConnected ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-3 py-2 md:px-4 md:py-2 hover:bg-slate-700/50 transition-colors text-sm md:text-base border border-purple-500/30"
            >
              <span className="text-white font-medium hidden sm:inline">{truncateAddress(address)}</span>
              <span className="text-white font-medium sm:hidden">{address ? `${address.slice(0, 4)}...` : ""}</span>
              {getWalletIcon()}
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl z-50 border border-purple-500/30">
                <div className="p-4 border-b border-purple-500/20">
                  <div className="flex items-center gap-3">
                    {getWalletIcon()}
                    <div>
                      <p className="font-medium text-white">{getWalletName()}</p>
                      <p className="text-sm text-gray-400">{truncateAddress(address)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-slate-700/50 rounded-md transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 md:py-3 md:px-10 rounded-lg transition-all text-sm md:text-base cursor-pointer font-medium shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70"
          >
            Connect Wallet
          </button>
        )}

        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-menu-toggle
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </nav>
  );
}

