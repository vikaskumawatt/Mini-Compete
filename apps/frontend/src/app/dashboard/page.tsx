'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth, clearAuth, isOrganizer } from '@/lib/auth';
import { competitions, registrations } from '@/lib/api';
import type { Competition, Registration } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = getAuth();
  const [myComps, setMyComps] = useState<Competition[]>([]);
  const [myRegs, setMyRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (isOrganizer()) {
        const response = await competitions.getMyCompetitions();
        setMyComps(response.data);
      } else {
        const response = await registrations.getMy();
        setMyRegs(response.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mini Compete
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isOrganizer() ? 'My Competitions' : 'My Registrations'}
          </h1>
          {isOrganizer() && (
            <Link
              href="/competitions/create"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Competition
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : isOrganizer() ? (
          myComps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any competitions yet</p>
              <Link
                href="/competitions/create"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Your First Competition
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myComps.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {comp.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {comp.description}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>
                      <strong>Registrations:</strong> {comp._count?.registrations || 0}
                    </p>
                    <p>
                      <strong>Seats Left:</strong> {comp.seatsLeft}/{comp.capacity}
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
          )
        ) : (
          myRegs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't registered for any competitions yet</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Browse Competitions
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-lg shadow-md p-6 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {reg.competition.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {reg.competition.description}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Status:</strong>{' '}
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            reg.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : reg.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </span>
                      <span>
                        <strong>Registered:</strong>{' '}
                        {new Date(reg.registeredAt).toLocaleDateString()}
                      </span>
                      {reg.competition.startDate && (
                        <span>
                          <strong>Start Date:</strong>{' '}
                          {new Date(reg.competition.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/competitions/${reg.competitionId}`}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}