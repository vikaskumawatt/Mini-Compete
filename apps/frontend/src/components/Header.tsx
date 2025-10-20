'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth, clearAuth, isOrganizer } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const { user } = getAuth();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Mini Compete</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center text-sm text-gray-600">
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                    {user.role}
                  </span>
                </div>

                {/* Navigation Links */}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>

                {isOrganizer() && (
                  <Link
                    href="/competitions/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Create Competition
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}