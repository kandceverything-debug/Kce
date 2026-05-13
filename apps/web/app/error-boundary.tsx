'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg p-4">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-4 text-white/60">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-accent"
      >
        Try again
      </button>
    </div>
  );
}
