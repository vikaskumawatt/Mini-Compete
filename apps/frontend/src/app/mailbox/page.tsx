'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth } from '@/lib/auth';
import api from '@/lib/api';

interface MailBoxItem {
  id: string;
  userId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export default function MailboxPage() {
  const router = useRouter();
  const { user } = getAuth();
  const [emails, setEmails] = useState<MailBoxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<MailBoxItem | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadEmails();
  }, [user]);

  const loadEmails = async () => {
    try {
      // Note: This endpoint would need to be implemented in the backend
      // For now, this is a placeholder showing the UI structure
      const response = await api.get(`/mailbox/my`);
      setEmails(response.data);
    } catch (error: any) {
      // Handle 404 - endpoint not implemented yet
      if (error.response?.status === 404) {
        console.log('Mailbox endpoint not implemented yet');
        // Show demo data for now
        setEmails([
          {
            id: '1',
            userId: user?.id || '',
            to: user?.email || '',
            subject: 'Registration Confirmed: Code Sprint 2025',
            body: `Dear ${user?.name},\n\nYour registration for "Code Sprint 2025" has been confirmed!\n\nWe look forward to seeing you at the event!\n\nBest regards,\nMini Compete Team`,
            sentAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mini Compete
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mailbox</h1>
            <p className="text-gray-600 mt-2">
              View your notifications and confirmations
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading emails...</div>
          </div>
        ) : emails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600">No emails yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Register for a competition to receive notifications
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 space-y-2">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition ${
                    selectedEmail?.id === email.id
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {email.subject}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(email.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {email.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Email Detail */}
            <div className="lg:col-span-2">
              {selectedEmail ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">To:</span>
                      <span className="ml-2">{selectedEmail.to}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(selectedEmail.sentAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {selectedEmail.body}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-600">Select an email to view</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}