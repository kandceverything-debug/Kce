import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#04020a',
  viewportFit: 'cover',
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'The Compound',
  description: 'The digital home of the Goth Wook Clique.',
  appleWebApp: {
    capable: true,
    title: 'The Compound',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-brand-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
