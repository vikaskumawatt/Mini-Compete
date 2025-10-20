'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { competitions } from '@/lib/api';
import { getAuth, clearAuth } from '@/lib/auth';
import type { Competition } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [comps, setComps] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = getAuth();

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const response = await competitions.getAll({ search });
      setComps(response.data);
    } catch (error) {
      console.error('Failed to load competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Mini Compete</h1>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {user.name} ({user.role})
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Available Competitions
          </h2>
          <input
            type="text"
            placeholder="Search competitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadCompetitions()}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading competitions...</div>
          </div>
        ) : comps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No competitions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comps.map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {comp.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {comp.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {comp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>
                    <strong>Capacity:</strong> {comp.seatsLeft}/{comp.capacity} seats left
                  </p>
                  <p>
                    <strong>Deadline:</strong>{' '}
                    {new Date(comp.regDeadline).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/competitions/${comp.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}