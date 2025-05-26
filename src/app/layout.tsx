import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Italian Brainrot pro",
  description:
    "“Welcome to the chaotic world of Italian Brainrotter! Test your ‘brain endurance’ with quizzes based on strange AI-generated characters and nonsense voices. From Tralarello Tralala to Bombardino Crocodillo, this app will make you a great brainrotter!”",
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
