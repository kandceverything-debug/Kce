const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }) => {
  const variants = {
    default: 'bg-brand-primary/20 text-brand-glow',
    success: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/20 text-red-300',
  };
  return <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

export { Badge };
