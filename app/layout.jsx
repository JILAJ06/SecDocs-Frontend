import { Inter, JetBrains_Mono } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import './globals.css';

// Next.js descarga las fuentes al compilar y las sirve desde el propio dominio (cumple la CSP 'self').
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata = {
  title: 'SecDocs · Bóveda digital',
  description: 'Bóveda con cifrado en reposo y enlaces efímeros con autenticación fuera de banda',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export const viewport = { themeColor: '#00412E' };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
