'use client';

import Link from 'next/link';
import type { Competition } from '@/types';

interface CompetitionCardProps {
  competition: Competition;
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const isDeadlinePassed = new Date() > new Date(competition.regDeadline);
  const isFull = competition.seatsLeft <= 0;
  const registrationClosed = isDeadlinePassed || isFull;

  const getStatusBadge = () => {
    if (isFull) {
      return (
        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
          Full
        </span>
      );
    }
    if (isDeadlinePassed) {
      return (
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
          Closed
        </span>
      );
    }
    if (competition.seatsLeft <= 5) {
      return (
        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
          Few Seats Left
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
        Open
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">
            {competition.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {competition.description}
        </p>

        {/* Tags */}
        {competition.tags && competition.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {competition.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Capacity:</span>
            <span className="font-medium text-gray-900">
              {competition.seatsLeft}/{competition.capacity} seats left
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Deadline:</span>
            <span className="font-medium text-gray-900">
              {new Date(competition.regDeadline).toLocaleDateString()}
            </span>
          </div>
          {competition.startDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(competition.startDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull
                  ? 'bg-red-500'
                  : competition.seatsLeft <= 5
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${((competition.capacity - competition.seatsLeft) / competition.capacity) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/competitions/${competition.id}`}
          className={`block w-full text-center px-4 py-2 rounded font-medium transition ${
            registrationClosed
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {registrationClosed ? 'View Details' : 'Register Now'}
        </Link>
      </div>
    </div>
  );
}