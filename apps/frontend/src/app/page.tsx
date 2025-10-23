'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { competitions } from '@/lib/api';
import Header from '@/components/Header';
import type { Competition } from '@/types';

export default function HomePage() {
  const [comps, setComps] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Compete. Learn.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Grow.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join exciting competitions, showcase your skills, and connect with like-minded
            individuals in our vibrant community.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search competitions, tags, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadCompetitions()}
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={loadCompetitions}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Competitions</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : comps.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No competitions found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or check back later for new competitions.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  loadCompetitions();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                View All Competitions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comps.map((comp) => (
                <div
                  key={comp.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {comp.title}
                      </h3>
                      <div className="flex-shrink-0 ml-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {comp.seatsLeft}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {comp.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {comp.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {comp.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                          +{comp.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Capacity</span>
                        <span className="font-semibold text-gray-900">
                          {comp.seatsLeft}/{comp.capacity} seats
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Deadline</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(comp.regDeadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(comp.seatsLeft / comp.capacity) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      href={`/competitions/${comp.id}`}
                      className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium group-hover:scale-105 transform"
                    >
                      View Competition
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Mini Compete</span>
            </div>

            {/* Copyright Text */}
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm sm:text-base">
                © 2025 Mini Compete. Building the future of competitive learning.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
