'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { competitions } from '@/lib/api';
import { getAuth, isParticipant } from '@/lib/auth';
import Header from '@/components/Header';
import type { Competition } from '@/types';

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = getAuth();
  const [comp, setComp] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCompetition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadCompetition = async () => {
    try {
      const response = await competitions.getOne(params.id as string);
      setComp(response.data);
    } catch (error) {
      console.error('Failed to load competition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setError('');
    setSuccess('');
    setRegistering(true);

    try {
      // Generate idempotency key
      const idempotencyKey = `${user.id}-${params.id}-${Date.now()}`;

      await competitions.register(params.id as string, idempotencyKey);
      setSuccess('Registration successful! Check your mailbox for confirmation.');
      setTimeout(() => router.push('/dashboard'), 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-600">Loading competition details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!comp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">Competition not found</p>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isDeadlinePassed = new Date() > new Date(comp.regDeadline);
  const isFull = comp.seatsLeft <= 0;
  const canRegister = user && isParticipant() && !isDeadlinePassed && !isFull;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Component */}
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{comp.title}</h1>
            <p className="text-gray-600">
              Organized by <strong>{comp.organizer.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {comp.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm rounded-full border border-blue-200 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{comp.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Competition Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Capacity:</dt>
                  <dd className="font-semibold text-gray-900">
                    {comp.capacity - comp.seatsLeft}/{comp.capacity} registered
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Seats Left:</dt>
                  <dd className="font-semibold text-gray-900">{comp.seatsLeft}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Registration Deadline:</dt>
                  <dd className="font-semibold text-gray-900">
                    {new Date(comp.regDeadline).toLocaleString()}
                  </dd>
                </div>
                {comp.startDate && (
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-600">Start Date:</dt>
                    <dd className="font-semibold text-gray-900">
                      {new Date(comp.startDate).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Organizer</h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Name:</dt>
                  <dd className="font-semibold text-gray-900">{comp.organizer.name}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="font-semibold text-gray-900">{comp.organizer.email}</dd>
                </div>
              </dl>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              {success}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {canRegister ? (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {registering ? 'Registering...' : 'Register Now'}
              </button>
            ) : !user ? (
              <Link
                href="/auth/login"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 text-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Login to Register
              </Link>
            ) : isDeadlinePassed ? (
              <div className="flex-1 px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-xl text-center cursor-not-allowed">
                Registration Closed
              </div>
            ) : isFull ? (
              <div className="flex-1 px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-xl text-center cursor-not-allowed">
                Competition Full
              </div>
            ) : (
              <div className="flex-1 px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-xl text-center cursor-not-allowed">
                Organizers Cannot Register
              </div>
            )}
            <Link 
              href="/competitions" 
              className="px-6 py-3 border border-gray-300 text-center rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-gray-900 font-medium"
            >
              Back to Competitions
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}