import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '営業日報システム',
  description: '営業担当者が日々の顧客訪問活動を記録し、上長がフィードバックを行うための業務システム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
