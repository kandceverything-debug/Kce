export const Skeleton = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} {...props} />
);
