'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import CompetitionCard from '@/components/CompetitionCard';
import { competitions } from '@/lib/api';
import type { Competition } from '@/types';

export default function CompetitionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [comps, setComps] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async (search?: string, tags?: string[]) => {
    try {
      setLoading(true);
      const tagsParam = tags && tags.length > 0 ? tags.join(',') : undefined;
      const response = await competitions.getAll({ 
        search: search || undefined, 
        tags: tagsParam 
      });
      setComps(response.data);
      
      // Extract unique tags from all competitions
      const uniqueTags = new Set<string>();
      response.data.forEach((comp: Competition) => {
        comp.tags?.forEach(tag => uniqueTags.add(tag));
      });
      setAllTags(Array.from(uniqueTags).sort());
    } catch (error) {
      console.error('Failed to load competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCompetitions(searchQuery, selectedTags);
    updateURL();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    loadCompetitions(searchQuery, newTags);
    updateURL();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    loadCompetitions('', []);
    router.push('/competitions');
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    
    const queryString = params.toString();
    router.push(`/competitions${queryString ? '?' + queryString : ''}`, { scroll: false });
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Component - Already properly placed here */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Competitions
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and join exciting competitions that match your skills and interests. 
            Challenge yourself and grow with our vibrant community.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search competitions by title, description, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 pl-12 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg transition-all duration-200"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Search
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filter by Categories</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      selectedTags.includes(tag)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200">
                    Search: &quot;{searchQuery}&quot;
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-2 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {loading ? (
          // Skeleton Loading
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
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : comps.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {hasActiveFilters ? 'No matching competitions' : 'No competitions available'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {hasActiveFilters
                ? 'Try adjusting your search terms or filters to find more competitions.'
                : 'Check back soon for new competitions or consider creating your own!'
              }
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
              >
                Clear All Filters
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/competitions/create')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
                >
                  Create Competition
                </button>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Join as Participant
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Available Competitions
                </h2>
                <p className="text-gray-600">
                  Found <span className="font-semibold text-blue-600">{comps.length}</span> competition{comps.length !== 1 ? 's' : ''} 
                  {hasActiveFilters && ' matching your criteria'}
                </p>
              </div>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 lg:mt-0 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Competition Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comps.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          </>
        )}

        {/* Organizer CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-white text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Host Your Own Competition?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of organizers who use our platform to create engaging competitions 
              and connect with talented participants worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/auth/signup?role=organizer')}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Organizing
              </button>
              <button
                onClick={() => router.push('/competitions/create')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Create Competition
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}