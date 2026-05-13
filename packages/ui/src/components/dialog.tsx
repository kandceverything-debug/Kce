import * as React from 'react';
import { X } from 'lucide-react';

const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-brand-bg p-6 shadow-xl">
        <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-white/50 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export { Dialog };
