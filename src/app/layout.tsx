import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pressStart2P = Press_Start_2P({
  variable: '--font-press-start-2p',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Circles Leaderboard',
  description: 'Circles Leaderboard /DappCon 2025/',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.className} antialiased w-full h-full flex flex-col min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
