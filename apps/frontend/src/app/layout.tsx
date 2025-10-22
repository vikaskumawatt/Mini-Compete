import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Mini Compete - Compete. Learn. Grow.',
    template: '%s | Mini Compete'
  },
  description: 'Join exciting competitions, showcase your skills, and connect with like-minded individuals in our vibrant community. Register and manage competitions with ease.',
  keywords: ['competitions', 'learning', 'skills', 'community', 'challenges'],
  authors: [{ name: 'Mini Compete Team' }],
  creator: 'Mini Compete',
  publisher: 'Mini Compete',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://minicompete.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://minicompete.com',
    siteName: 'Mini Compete',
    title: 'Mini Compete - Compete. Learn. Grow.',
    description: 'Join exciting competitions, showcase your skills, and connect with like-minded individuals in our vibrant community.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mini Compete - Competition Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mini Compete - Compete. Learn. Grow.',
    description: 'Join exciting competitions, showcase your skills, and connect with like-minded individuals.',
    images: ['/og-image.jpg'],
    creator: '@minicompete',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 bg-fixed">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse delay-500"></div>
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
