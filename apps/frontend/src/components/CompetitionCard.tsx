'use client';

import Link from 'next/link';
import type { Competition } from '@/types';
import { useState, useEffect } from 'react';

interface CompetitionCardProps {
  competition: Competition;
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [formattedDeadline, setFormattedDeadline] = useState('');

  // Use useEffect to handle client-side only calculations
  useEffect(() => {
    setIsMounted(true);
    const deadline = new Date(competition.regDeadline);
    setIsDeadlinePassed(new Date() > deadline);
    setFormattedDeadline(formatDate(competition.regDeadline));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competition.regDeadline]);

  const isFull = competition.seatsLeft <= 0;
  const registrationClosed = isDeadlinePassed || isFull;
  const registrationProgress = ((competition.capacity - competition.seatsLeft) / competition.capacity) * 100;
  const isAlmostFull = competition.seatsLeft <= 5 && !isFull;

  const getStatusConfig = () => {
    if (isFull) {
      return {
        text: 'Full',
        color: 'bg-red-100 text-red-700 border-red-200',
        progressColor: 'bg-red-500',
        urgency: 'high'
      };
    }
    if (isDeadlinePassed) {
      return {
        text: 'Registration Closed',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        progressColor: 'bg-gray-500',
        urgency: 'none'
      };
    }
    if (isAlmostFull) {
      return {
        text: 'Almost Full',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        progressColor: 'bg-orange-500',
        urgency: 'medium'
      };
    }
    return {
      text: 'Open for Registration',
      color: 'bg-green-100 text-green-700 border-green-200',
      progressColor: 'bg-gradient-to-r from-green-500 to-blue-500',
      urgency: 'low'
    };
  };

  const status = getStatusConfig();

  // Move formatDate inside component and make it pure
  const formatDate = (dateString: string) => {
    if (!isMounted) {
      // Return a neutral value during SSR
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past deadline';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format start date safely
  const formatStartDate = (dateString: string) => {
    if (!isMounted) {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Don't render dynamic content until mounted
  if (!isMounted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
        <div className="h-2 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden transform hover:scale-[1.02]">
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
              {competition.title}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
              {status.urgency === 'medium' && (
                <svg className="w-3 h-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              )}
              {status.text}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {competition.description}
        </p>

        {/* Tags */}
        {competition.tags && competition.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {competition.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
              >
                {tag}
              </span>
            ))}
            {competition.tags.length > 3 && (
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                +{competition.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Registration Progress</span>
            <span className="font-semibold text-gray-900">{Math.round(registrationProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${status.progressColor}`}
              style={{
                width: `${registrationProgress}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{competition.capacity - competition.seatsLeft} registered</span>
            <span>{competition.seatsLeft} seats left</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium text-gray-900">{formattedDeadline}</div>
              <div className="text-xs">Deadline</div>
            </div>
          </div>

          {competition.startDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {formatStartDate(competition.startDate)}
                </div>
                <div className="text-xs">Starts</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={`/competitions/${competition.id}`}
          className={`group/btn w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            registrationClosed
              ? 'bg-gray-100 text-gray-600 border border-gray-300 cursor-pointer hover:bg-gray-200'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
          }`}
        >
          <span>
            {registrationClosed ? 'View Details' : 'Register Now'}
          </span>
          <svg 
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${
              registrationClosed ? 'group-hover/btn:translate-x-1' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Urgent Indicator */}
      {status.urgency === 'medium' && (
        <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500 animate-pulse"></div>
      )}
      {status.urgency === 'high' && (
        <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
      )}
      {status.urgency === 'low' && (
        <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      )}
    </div>
  );
}