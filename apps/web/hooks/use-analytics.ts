import { useEffect } from 'react';
import posthog from 'posthog-js';

export function useAnalytics() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      });
    }
  }, []);

  return {
    captureEvent: (name: string, properties?: Record<string, any>) => {
      if (typeof window !== 'undefined') {
        posthog.capture(name, properties);
      }
    },
  };
}
