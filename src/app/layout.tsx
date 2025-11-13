import { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { MiniKitContextProvider } from "@/providers/MiniKitProvider";
import AppKitProvider from "@/contexts/AppKitProvider";
import { Navbar } from "@/components/common/Navbar";
import { headers } from 'next/headers';
import { Toaster } from "react-hot-toast";

export async function generateMetadata(): Promise<Metadata> {
  const URL = "https://blocxtactoe.vercel.app";
  return {
    title: 'BlOcXTacToe',
    description: 'Decentralized Tic Tac Toe on Base Sepolia',
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: 'https://blocxtactoe.vercel.app/og.png',
        button: {
          title: 'Launch BlOcXTacToe',
          action: {
            type: 'launch_frame',
            name: 'BlOcXTacToe',
            url: URL,
            splashImageUrl: 'https://blocxtactoe.vercel.app/bbt-logo.png',
            splashBackgroundColor: '#000000',
          },
        },
      }),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body className="blocxtactoe-bg">
        <AppKitProvider cookies={cookies}>
          <MiniKitContextProvider>
            <Providers>
              <div className="min-h-screen flex flex-col relative">
                <Navbar />
                <main className="flex-1 relative">
                  {children}
                </main>
              </div>
              <Toaster position="bottom-right" />
            </Providers>
          </MiniKitContextProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
