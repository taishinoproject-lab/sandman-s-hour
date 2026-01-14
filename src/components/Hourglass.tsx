import { useMemo } from 'react';

interface HourglassProps {
  /** Lost sleep in minutes (fills bottom half) */
  lostMinutes: number;
  /** Maximum minutes to show (e.g., target sleep time) */
  maxMinutes?: number;
  /** Size of the hourglass */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Hourglass({ 
  lostMinutes, 
  maxMinutes = 480, 
  size = 'lg',
  className = '' 
}: HourglassProps) {
  const fillPercentage = useMemo(() => {
    return Math.min(100, (lostMinutes / maxMinutes) * 100);
  }, [lostMinutes, maxMinutes]);

  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-24 h-36',
    lg: 'w-32 h-48',
  };

  const remainingPercentage = 100 - fillPercentage;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 150"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(180, 140, 80, 0.15))' }}
      >
        {/* Definitions */}
        <defs>
          {/* Glass gradient */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(220, 20%, 25%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(220, 15%, 35%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(220, 20%, 25%)" stopOpacity="0.6" />
          </linearGradient>
          
          {/* Sand gradient - top (remaining) */}
          <linearGradient id="sandTopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(35, 50%, 70%)" />
            <stop offset="100%" stopColor="hsl(35, 40%, 55%)" />
          </linearGradient>
          
          {/* Sand gradient - bottom (lost) */}
          <linearGradient id="sandBottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(35, 35%, 50%)" />
            <stop offset="100%" stopColor="hsl(35, 30%, 40%)" />
          </linearGradient>
          
          {/* Clip paths for sand */}
          <clipPath id="topHalf">
            <path d="M 20 10 L 80 10 L 55 70 L 45 70 Z" />
          </clipPath>
          <clipPath id="bottomHalf">
            <path d="M 45 80 L 55 80 L 80 140 L 20 140 Z" />
          </clipPath>
        </defs>

        {/* Frame - outer glow */}
        <ellipse cx="50" cy="10" rx="32" ry="6" fill="url(#glassGradient)" />
        <ellipse cx="50" cy="140" rx="32" ry="6" fill="url(#glassGradient)" />
        
        {/* Glass body outline */}
        <path
          d="M 20 10 
             C 20 10, 20 15, 20 20 
             L 45 70 
             C 48 73, 48 77, 45 80 
             L 20 130 
             C 20 135, 20 140, 20 140
             L 80 140
             C 80 140, 80 135, 80 130
             L 55 80
             C 52 77, 52 73, 55 70
             L 80 20
             C 80 15, 80 10, 80 10
             Z"
          fill="none"
          stroke="url(#glassGradient)"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Sand in top half (remaining sleep) */}
        {remainingPercentage > 0 && (
          <g clipPath="url(#topHalf)">
            <rect
              x="20"
              y={10 + (60 * (1 - remainingPercentage / 100))}
              width="60"
              height={60 * (remainingPercentage / 100)}
              fill="url(#sandTopGradient)"
              className="transition-all duration-1000 ease-linear"
            />
          </g>
        )}

        {/* Sand falling through neck */}
        {fillPercentage > 0 && fillPercentage < 100 && (
          <g>
            <line
              x1="50"
              y1="70"
              x2="50"
              y2="80"
              stroke="hsl(35, 50%, 65%)"
              strokeWidth="1.5"
              opacity="0.8"
            />
            {/* Falling particles */}
            <circle cx="50" cy="74" r="1" fill="hsl(35, 50%, 70%)" className="animate-sand-fall" style={{ animationDelay: '0s' }} />
            <circle cx="50" cy="76" r="0.8" fill="hsl(35, 45%, 65%)" className="animate-sand-fall" style={{ animationDelay: '0.5s' }} />
          </g>
        )}

        {/* Sand in bottom half (lost sleep) */}
        {fillPercentage > 0 && (
          <g clipPath="url(#bottomHalf)">
            <rect
              x="20"
              y={140 - (60 * fillPercentage / 100)}
              width="60"
              height={60 * fillPercentage / 100}
              fill="url(#sandBottomGradient)"
              className="transition-all duration-1000 ease-linear"
            />
          </g>
        )}

        {/* Center connection point */}
        <ellipse cx="50" cy="75" rx="4" ry="2" fill="hsl(220, 15%, 20%)" opacity="0.6" />
        
        {/* Highlights on glass */}
        <path
          d="M 25 15 L 42 65"
          stroke="hsl(220, 30%, 60%)"
          strokeWidth="1"
          opacity="0.2"
          strokeLinecap="round"
        />
        <path
          d="M 25 135 L 42 85"
          stroke="hsl(220, 30%, 60%)"
          strokeWidth="1"
          opacity="0.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
