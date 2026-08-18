'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientWorkoutsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/plan?tab=workout');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-8 h-8 rounded-full border-2 border-teal-700 border-t-transparent animate-spin" />
    </div>
  );
}
