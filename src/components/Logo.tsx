'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'icon-only';
  className?: string;
}

export function Logo({ size = 'md', variant = 'default', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'icon-only') {
    return (
      <div
        className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-105`}
      >
        <Image
          src="/logo.jpg"
          alt="TrakInvests Logo"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-105`}
      >
        <Image
          src="/logo.jpg"
          alt="TrakInvests Logo"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
      {variant === 'default' && (
        <div>
          <h1
            className={`${textSizeClasses[size]} bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text font-bold text-transparent`}
          >
            TrakInvests
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track • Grow • Prosper</p>
        </div>
      )}
    </div>
  );
}
