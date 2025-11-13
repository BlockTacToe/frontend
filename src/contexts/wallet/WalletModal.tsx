"use client";

import { useState, useRef, useEffect } from "react";
import { useConnectors, useAccount } from "wagmi";
import { ExternalLink, X, Loader2 } from "lucide-react";

const WalletModal = () => {
  const connectors = useConnectors();
  const { address, isConnected } = useAccount();
  const [pendingConnectorUID, setPendingConnectorUID] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInFarcasterFrame, setIsInFarcasterFrame] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    
    // Check if we're in a Farcaster Frame context
    const checkFarcasterFrame = () => {
      if (typeof window !== 'undefined') {
        // More comprehensive Farcaster Frame detection
        const inFrame = window.location.href.includes('farcaster') || 
                       navigator.userAgent.includes('Farcaster') ||
                       window.location.href.includes('warpcast') ||
                       navigator.userAgent.includes('Warpcast') ||
                       window.location.href.includes('miniapps') ||
                       window.location.href.includes('oXpRXDCzmUMJ') ||
                       window.location.href.includes('vibecasters') ||
                       // Check for Farcaster-specific query parameters
                       window.location.search.includes('farcaster') ||
                       // Check for Farcaster-specific headers or context
                       (window as any).farcaster ||
                       (window as any).warpcast ||
                       // Check for Mini App specific context
                       (window as any).miniapp ||
                       // Check for specific VibeCaster Mini App
                       window.location.href.includes('farcaster.xyz/miniapps');
        
        setIsInFarcasterFrame(inFrame);
        
        console.log('Window location:', window.location.href);
        console.log('User agent:', navigator.userAgent);
        console.log('Is in Farcaster Frame:', inFrame);
        console.log('Farcaster context:', (window as any).farcaster);
        console.log('Warpcast context:', (window as any).warpcast);
        console.log('Mini App context:', (window as any).miniapp);
        console.log('URL pathname:', window.location.pathname);
        console.log('URL search:', window.location.search);
        console.log('URL hash:', window.location.hash);
      }
    };
    
    checkFarcasterFrame();
  }, []);

  // Debug: Log all available connectors
  useEffect(() => {
    if (isClient) {
      console.log('Available connectors:', connectors.map(c => ({
        id: c.id,
        name: c.name,
        uid: c.uid,
        ready: c.ready,
        type: typeof c.connect,
        hasConnect: typeof c.connect === 'function',
        hasDisconnect: typeof c.disconnect === 'function'
      })));
      
      // Log connector details for debugging
      connectors.forEach((connector, index) => {
        console.log(`Connector ${index + 1}:`, {
          id: connector.id,
          name: connector.name,
          ready: connector.ready,
          connectType: typeof connector.connect,
          disconnectType: typeof connector.disconnect,
          keys: Object.keys(connector)
        });
      });
    }
  }, [connectors, isClient]);

  // Monitor connection state and close modal when connected
  useEffect(() => {
    console.log('Connection state changed:', { isConnected, address });
    if (isConnected && address) {
      console.log('✅ User is connected! Closing modal...');
      console.log('Connected address:', address);
      setIsModalOpen(false);
    }
  }, [isConnected, address]);

  // Remove duplicates and filter connectors
  const uniqueConnectors = Array.from(
    new Map(connectors.map((c) => [c.name, c])).values()
  );

  // Find Farcaster connector and prioritize it
  const farcasterConnector = uniqueConnectors.find(
    (connector) => 
      connector.id === "farcaster" || 
      connector.name?.toLowerCase().includes('farcaster') ||
      connector.name?.toLowerCase().includes('miniapp') ||
      connector.uid?.includes('farcaster')
  );
  
  const walletConnectConnector = uniqueConnectors.find(
    (connector) => connector.id === "walletConnect"
  );
  
  const otherConnectors = uniqueConnectors.filter(
    (connector) => 
      connector.id !== "walletConnect" && 
      connector.id !== "farcaster" && 
      !connector.name?.toLowerCase().includes('farcaster')
  );

  // Helper function to get wallet icon with better fallbacks
  const getWalletIcon = (connector: any) => {
    // Debug logging
    console.log('Connector:', connector.id, connector.name, 'Icon:', connector.icon);
    
    // Special handling for Farcaster
    if (connector.id === "farcaster" || connector.name?.toLowerCase().includes('farcaster')) {
      return "/farcaster.svg";
    }
    
    // Special handling for WalletConnect
    if (connector.id === "walletConnect") {
      return "https://avatars.githubusercontent.com/u/37784886?s=200&v=4";
    }

    // Special handling for MetaMask if it's not working
    if (connector.id === "metaMaskSDK" || connector.name?.toLowerCase().includes('metamask')) {
      return "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg";
    }

    // Special handling for Coinbase Wallet
    if (connector.id === "coinbaseWalletSDK" || connector.name?.toLowerCase().includes('coinbase')) {
      return "https://avatars.githubusercontent.com/u/18060234?s=200&v=4";
    }

    // If connector provides a base64 or URL icon
    if (connector.icon) {
      if (typeof connector.icon === "string") {
        return connector.icon;
      }
      if (connector.icon?.url) {
        return connector.icon.url;
      }
    }

    // Default generic Ethereum icon
    return "https://cdn.iconscout.com/icon/free/png-256/ethereum-2752194-2285011.png";
  };

  const connectWallet = async (connector: any) => {
    try {
      const isFarcasterConnector = connector.id === "farcaster" || 
                                   connector.name?.toLowerCase().includes('farcaster') ||
                                   connector.name?.toLowerCase().includes('miniapp');
      
      console.log('Attempting to connect with connector:', {
        id: connector.id,
        name: connector.name,
        uid: connector.uid,
        ready: connector.ready,
        type: typeof connector.connect,
        isFarcaster: isFarcasterConnector,
        isInFarcasterFrame,
        connectorKeys: Object.keys(connector)
      });
      
      // Check if this is the Farcaster connector and we're not in a Farcaster Frame
      if (isFarcasterConnector && !isInFarcasterFrame) {
        console.warn('Farcaster connector requires Farcaster Frame context');
        alert('Farcaster wallet connection is only available when using this app within Farcaster. Please open this app in Farcaster to connect your wallet.');
        return;
      }
      
      setPendingConnectorUID(connector.uid);
      
      // For Farcaster connector, we might need to handle it differently
      if (isFarcasterConnector) {
        console.log('Handling Farcaster connector specifically...');
        console.log('Farcaster connector object:', connector);
        console.log('Available methods on connector:', Object.getOwnPropertyNames(connector));
        console.log('Connector prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(connector)));
        
        // Check for Farcaster Mini App environment
        console.log('Environment check:');
        console.log('- NODE_ENV:', process.env.NODE_ENV);
        console.log('- NEXT_PUBLIC_* vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
        
        // Check if the connector has a specific Farcaster connect method
        if (connector.connectFarcaster) {
          console.log('Using connectFarcaster method...');
          const result = await connector.connectFarcaster();
          console.log('Farcaster connection result:', result);
        } else if (connector.connect) {
          console.log('Using standard connect method...');
          const result = await connector.connect();
          console.log('Farcaster connection result:', result);
          
          // Check if connection was successful
          if (result && result.accounts && result.accounts.length > 0) {
            console.log('✅ Farcaster connection successful!');
            console.log('Connected account:', result.accounts[0]);
            console.log('Connected chain:', result.chainId);
            
            // Force a re-render to update the UI state
            setTimeout(() => {
              console.log('Forcing UI update after successful connection...');
              // Trigger a window resize to force React to re-render
              window.dispatchEvent(new Event('resize'));
            }, 100);
          } else {
            console.warn('Farcaster connection result seems incomplete:', result);
          }
        } else {
          console.error('No connect method found on Farcaster connector');
          console.log('Available methods:', Object.keys(connector));
          
          // Try to find any method that might be for connecting
          const connectMethods = Object.keys(connector).filter(key => 
            key.toLowerCase().includes('connect') || 
            key.toLowerCase().includes('auth') ||
            key.toLowerCase().includes('login')
          );
          
          if (connectMethods.length > 0) {
            console.log('Found potential connect methods:', connectMethods);
            // Try the first potential connect method
            const methodName = connectMethods[0];
            console.log(`Trying method: ${methodName}`);
            const result = await connector[methodName]();
            console.log('Connection result:', result);
          } else {
            throw new Error('No connect method found on Farcaster connector');
          }
        }
      } else {
        // Standard connector handling
        console.log('Handling standard connector:', connector.name);
        
        // For standard connectors, we'll try to connect even if ready is undefined
        // Many connectors work fine even when ready state is not explicitly set
        if (connector.ready === false) {
          console.error('Connector explicitly not ready:', connector);
          throw new Error('Connector is not ready');
        }
        
        // Wait a bit for the connector to initialize if ready is undefined
        if (connector.ready === undefined) {
          console.log('Connector ready state is undefined, waiting for initialization...');
          // Wait a bit for the connector to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Check if connect method exists
        if (typeof connector.connect !== 'function') {
          console.error('Connect method not found on connector:', connector);
          throw new Error('Connect method not available');
        }
        
        console.log('Calling connector.connect()...');
        console.log('Connector object:', connector);
        
        try {
          const result = await connector.connect();
          console.log('Connection result:', result);
        } catch (connectError) {
          console.error('Connection failed:', connectError);
          
          // If the first attempt fails, try waiting a bit more and retry
          if (connector.ready === undefined) {
            console.log('Retrying connection after additional wait...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const retryResult = await connector.connect();
            console.log('Retry connection result:', retryResult);
          } else {
            throw connectError;
          }
        }
      }
      
      setIsModalOpen(false); // Close modal on successful connection
    } catch (error) {
      console.error('Connection error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        connector: {
          id: connector.id,
          name: connector.name,
          ready: connector.ready
        }
      });
      
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Connection failed: ${error.message}`);
      } else {
        alert('Connection failed. Please try again.');
      }
    } finally {
      setPendingConnectorUID(null);
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#FF6B6B] px-4 py-2 font-semibold text-white transition-transform hover:scale-105"
      >
        Connect Wallet
      </button>

      {isModalOpen && (
        <>
          {/* Modal */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 origin-top-right rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:max-w-none md:border-none md:shadow-none md:p-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#222222]">Connect a Wallet</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#666666] hover:text-[#222222]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Helpful message for Farcaster users */}
                {!isInFarcasterFrame && farcasterConnector && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Want to use Farcaster Wallet?</strong> Open this app in Farcaster to connect your wallet automatically.
                    </p>
                  </div>
                )}

                {/* Farcaster as the primary option */}
                {farcasterConnector && (
                  <div className="mb-4">
                    <h3 className="text-[#666666] text-xs font-medium mb-2">
                      Recommended for Farcaster
                    </h3>
                    <button
                      onClick={() => connectWallet(farcasterConnector)}
                      disabled={pendingConnectorUID === farcasterConnector.uid}
                      className={`w-full flex gap-4 items-center p-4 border-2 rounded-xl transition-all ${
                        isInFarcasterFrame 
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100' 
                          : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <img
                        src={getWalletIcon(farcasterConnector)}
                        className="w-8 h-8"
                        alt="Farcaster"
                        onError={(e) => console.error('Farcaster icon failed to load:', e.currentTarget.src)}
                      />
                      <div className="flex-1 text-left">
                        <span className="text-[#222222] font-semibold">Farcaster Wallet</span>
                        <div className="text-xs text-[#666666]">
                          {isInFarcasterFrame 
                            ? 'Connect with your Farcaster account' 
                            : 'Only available in Farcaster Frame'
                          }
                        </div>
                      </div>

                      {pendingConnectorUID === farcasterConnector.uid && (
                        <Loader2
                          className="w-4 h-4 ml-auto animate-spin"
                        />
                      )}
                    </button>
                  </div>
                )}

                {/* Only show other wallets when NOT in Farcaster Frame */}
                {!isInFarcasterFrame && (
                  <>
                    {walletConnectConnector && (
                      <button
                        onClick={() => connectWallet(walletConnectConnector)}
                        disabled={pendingConnectorUID === walletConnectConnector.uid}
                        className="w-full flex gap-4 items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <img
                          src={getWalletIcon(walletConnectConnector)}
                          className="w-6 h-6"
                          alt="WalletConnect"
                          onError={(e) => console.error('WalletConnect icon failed to load:', e.currentTarget.src)}
                        />
                        <span className="text-[#222222] text-sm">WalletConnect</span>

                        {pendingConnectorUID === walletConnectConnector.uid && (
                          <Loader2
                            className="w-4 h-4 ml-auto animate-spin"
                          />
                        )}
                      </button>
                    )}

                    <h3 className="text-[#666666] text-xs font-medium">
                      Other Wallets
                    </h3>

                    <div className="grid grid-cols-3 gap-1">
                      {otherConnectors.map((connector) => (
                        <button
                          key={connector.id}
                          onClick={() => connectWallet(connector)}
                          disabled={pendingConnectorUID === connector.uid}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                          <img
                            src={getWalletIcon(connector)}
                            className="w-8 h-8 bg-white p-1 rounded-md"
                            alt={connector.name}
                            onError={(e) => console.error(`${connector.name} icon failed to load:`, e.currentTarget.src)}
                          />
                          <span className="text-[10px] text-[#222222]">
                            {connector.name}
                          </span>

                          {pendingConnectorUID === connector.uid && (
                            <Loader2
                              className="w-3 h-3 animate-spin"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <a
                        href="https://ethereum.org/en/wallets/find-wallet/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 text-xs text-[#00d2ff] hover:underline"
                      >
                        <span>Don't have a wallet? Get one here</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                )}
              </div>

              <p className="text-[#666666] text-[10px] mt-3 text-center">
                By connecting a wallet, you agree to BlOcXTacToe's Terms of
                Service
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletModal;