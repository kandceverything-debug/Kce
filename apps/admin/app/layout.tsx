import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compound Admin',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#04020a', color: '#e8e0f0', margin: 0, fontFamily: 'monospace' }}>
        {children}
      </body>
    </html>
  );
}
