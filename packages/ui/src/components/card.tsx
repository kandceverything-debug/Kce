export const Card = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-lg border border-white/10 bg-brand-surface p-4 ${className}`}>
    {children}
  </div>
);
