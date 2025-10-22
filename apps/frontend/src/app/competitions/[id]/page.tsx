'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { competitions } from '@/lib/api';
import { getAuth, isParticipant } from '@/lib/auth';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!comp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Competition not found</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = new Date() > new Date(comp.regDeadline);
  const isFull = comp.seatsLeft <= 0;
  const canRegister = user && isParticipant() && !isDeadlinePassed && !isFull;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mini Compete
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{comp.title}</h1>
            <p className="text-gray-600">
              Organized by <strong>{comp.organizer.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {comp.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{comp.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Competition Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Capacity:</dt>
                  <dd className="font-medium">
                    {comp.capacity - comp.seatsLeft}/{comp.capacity} registered
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Seats Left:</dt>
                  <dd className="font-medium">{comp.seatsLeft}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Registration Deadline:</dt>
                  <dd className="font-medium">{new Date(comp.regDeadline).toLocaleString()}</dd>
                </div>
                {comp.startDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Start Date:</dt>
                    <dd className="font-medium">{new Date(comp.startDate).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Organizer</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Name:</dt>
                  <dd className="font-medium">{comp.organizer.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="font-medium">{comp.organizer.email}</dd>
                </div>
              </dl>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="flex gap-4">
            {canRegister ? (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register Now'}
              </button>
            ) : !user ? (
              <Link
                href="/auth/login"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center"
              >
                Login to Register
              </Link>
            ) : isDeadlinePassed ? (
              <div className="flex-1 px-6 py-3 bg-gray-300 text-gray-600 font-medium rounded-lg text-center cursor-not-allowed">
                Registration Closed
              </div>
            ) : isFull ? (
              <div className="flex-1 px-6 py-3 bg-gray-300 text-gray-600 font-medium rounded-lg text-center cursor-not-allowed">
                Competition Full
              </div>
            ) : (
              <div className="flex-1 px-6 py-3 bg-gray-300 text-gray-600 font-medium rounded-lg text-center cursor-not-allowed">
                Organizers Cannot Register
              </div>
            )}
            <Link href="/" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
