import type { Metadata } from 'next';
import './globals.css';

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
      <body className={`antialiased w-full h-full flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
