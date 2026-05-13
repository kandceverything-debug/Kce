'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError('Supabase env vars not configured');
          setLoading(false);
          return;
        }

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .order('joined_at', { ascending: false });

        setMembers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Members</h1>
      <table className="w-full border-collapse border border-white/20">
        <thead>
          <tr className="bg-white/5">
            <th className="border border-white/20 p-4 text-left">Handle</th>
            <th className="border border-white/20 p-4 text-left">Status</th>
            <th className="border border-white/20 p-4 text-left">Joined</th>
            <th className="border border-white/20 p-4 text-left">Tier</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className="border border-white/20 p-4">{member.handle}</td>
              <td className="border border-white/20 p-4">{member.status}</td>
              <td className="border border-white/20 p-4">{new Date(member.joined_at).toLocaleDateString()}</td>
              <td className="border border-white/20 p-4">{member.traits?.tier || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
