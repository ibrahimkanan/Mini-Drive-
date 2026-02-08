'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api'; // سيعمل بشكل صحيح
import Link from 'next/link';

export default function Home() {
  const [message, setMessage] = useState('Checking connection...');

  useEffect(() => {
    api.get('/')
      .then(() => setMessage('✅ Connected to Go Backend!'))
      .catch((err) => {
        console.error(err);
        setMessage('❌ Connection Failed (Check CORS or Port)');
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">System Status</h1>
      <div className="text-2xl font-mono border p-4 rounded bg-gray-100 text-black">
        {message}
      </div>
      
      <div className="mt-8">
        <Link 
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}