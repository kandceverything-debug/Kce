export const dynamic = 'force-dynamic';

export default function CompoundIndex() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-brand-glow mb-4">The Compound</h1>
      <nav className="mt-8 space-y-4">
        <p className="mb-6 text-white/60">Choose your path:</p>
        <a href="/compound/avatar" className="block rounded-lg bg-brand-primary px-6 py-3 text-white hover:bg-brand-accent">
          Avatar Editor
        </a>
        <a href="/compound/venue" className="block rounded-lg bg-brand-primary px-6 py-3 text-white hover:bg-brand-accent">
          Enter the Venue
        </a>
      </nav>
    </div>
  );
}
