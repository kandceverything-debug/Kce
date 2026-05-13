'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
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
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        setTransactions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <table className="w-full border-collapse border border-white/20">
        <thead>
          <tr className="bg-white/5">
            <th className="border border-white/20 p-4 text-left">Kind</th>
            <th className="border border-white/20 p-4 text-left">Amount</th>
            <th className="border border-white/20 p-4 text-left">Status</th>
            <th className="border border-white/20 p-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="border border-white/20 p-4">{tx.kind}</td>
              <td className="border border-white/20 p-4">${(tx.amount_cents / 100).toFixed(2)}</td>
              <td className="border border-white/20 p-4">{tx.status}</td>
              <td className="border border-white/20 p-4">{new Date(tx.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
