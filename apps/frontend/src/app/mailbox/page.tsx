'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth } from '@/lib/auth';
import api from '@/lib/api';
import Header from '@/components/Header'; 

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadEmails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEmails = async () => {
    try {
      const response = await api.get(`/mailbox/my`);
      setEmails(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 404) {
        setEmails([
          {
            id: '1',
            userId: user?.id || '',
            to: user?.email || '',
            subject: 'Registration Confirmed: Code Sprint 2025',
            body: `Dear ${user?.name},\n\nYour registration for "Code Sprint 2025" has been confirmed!\n\nWe're excited to have you join this exciting coding challenge. Get ready to showcase your skills and compete with talented developers from around the world.\n\nEvent Details:\n• Date: March 15-16, 2025\n• Platform: Online\n• Theme: AI-Powered Solutions\n\nWe look forward to seeing your innovative solutions!\n\nBest regards,\nMini Compete Team`,
            sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            userId: user?.id || '',
            to: user?.email || '',
            subject: 'Welcome to Mini Compete!',
            body: `Welcome aboard, ${user?.name}!\n\nWe're thrilled to have you join our community of competitive learners and innovators. Here's what you can do on Mini Compete:\n\n• Discover exciting competitions\n• Showcase your skills\n• Connect with like-minded individuals\n• Learn and grow together\n\nFeel free to explore available competitions and don't hesitate to reach out if you have any questions.\n\nHappy competing!\n\nThe Mini Compete Team`,
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            userId: user?.id || '',
            to: user?.email || '',
            subject: 'Reminder: Design Challenge Submission Deadline',
            body: `Hello ${user?.name},\n\nThis is a friendly reminder that the submission deadline for the "Creative Design Challenge 2025" is approaching.\n\nDeadline: March 10, 2025, 11:59 PM UTC\n\nMake sure to submit your work before the deadline to be considered for the competition. Late submissions cannot be accepted.\n\nIf you've already submitted, please disregard this message.\n\nGood luck with your submission!\n\nBest regards,\nMini Compete Team`,
            sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Mailbox</h1>
              <p className="text-base sm:text-lg text-gray-600">Your notifications and competition updates</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 sm:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 pl-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-gray-900 font-medium text-center flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                <div className="space-y-3 mt-6">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredEmails.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
              {searchTerm ? 'Try adjusting your search terms' : 'Register for competitions to receive notifications and updates'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 space-y-3">
              {filteredEmails.map((email, index) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-4 cursor-pointer group transition-all duration-200 transform hover:scale-[1.02] ${
                    selectedEmail?.id === email.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1 min-w-0">
                        {email.subject}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
                      {formatTime(email.sentAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                    {email.body}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 truncate flex-1 mr-2">To: {email.to}</span>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex-shrink-0">
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Email Detail */}
            <div className="lg:col-span-2">
              {selectedEmail ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-4 break-words">
                        {selectedEmail.subject}
                      </h2>
                      <button
                        onClick={() => setSelectedEmail(null)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-2 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">To:</span>
                        <span className="break-all">{selectedEmail.to}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base sm:text-lg">
                      {selectedEmail.body}
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-sm sm:text-base">Reply</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-sm sm:text-base">Forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Select an email</h3>
                  <p className="text-gray-600 max-w-sm text-sm sm:text-base">
                    Choose an email from your inbox to read the full message and details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}