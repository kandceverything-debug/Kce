import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  userId: string | null;
  profile: any;
  isLoading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  redeemVouchCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  profile: null,
  isLoading: false,

  signInWithMagicLink: async (email: string) => {
    const supabase = createClient();
    await supabase.auth.signInWithOtp({ email });
  },

  redeemVouchCode: async (code: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/redeem-vouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error('Failed to redeem vouch code');
      const data = await response.json();
      set({ userId: data.userId, profile: data.profile });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ userId: null, profile: null });
  },

  refreshProfile: async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    set({ profile });
  },
}));
