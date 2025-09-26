import React, { useMemo } from 'react';

type Props = {
  /** 0–100 */
  percent: number;
  /** Ball diameter in px (not including optional base) */
  size?: number;
  /** Rim/glow tint */
  color?: string;
  /** Show the base/stand under the ball */
  showBase?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const CrystalBall: React.FC<Props> = ({
  percent,
  size = 64,
  color = '#7DF9FF',
  showBase = false,
  className,
  style,
}) => {
  // Unique ids so multiple balls can coexist
  const id = useMemo(
    () => Math.random().toString(36).slice(2),
    []
  );

  const glowId   = `glow-${id}`;
  const shadeId  = `shade-${id}`;
  const glassId  = `glass-${id}`;

  // Height accounts for optional base
  const viewH = showBase ? 115 : 100;
  const svgH  = showBase ? Math.round(size * 1.15) : size;

  return (
    <svg
      width={size}
      height={svgH}
      viewBox={`0 0 100 ${viewH}`}
      role="img"
      aria-label={`${Math.round(percent)} percent`}
      className={className}
      style={style}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Outer glow around the glass */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
          <feFlood floodColor={color} floodOpacity="0.35"/>
          <feComposite operator="in" in2="blur"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Main crystal ball gradient - iOS style */}
        <radialGradient id={glassId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)"/>
          <stop offset="20%" stopColor="rgba(255,255,255,0.15)"/>
          <stop offset="60%" stopColor={`${color}20`}/>
          <stop offset="85%" stopColor={`${color}50`}/>
          <stop offset="100%" stopColor={`${color}80`}/>
        </radialGradient>

        {/* Dark core for text readability */}
        <radialGradient id={shadeId} cx="50%" cy="50%" r="45%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.2)"/>
          <stop offset="70%" stopColor="rgba(0,0,0,0.4)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>

        {/* iOS-style highlight gradient */}
        <radialGradient id={`highlight-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)"/>
          <stop offset="60%" stopColor="rgba(255,255,255,0.3)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>

        {/* Base gradients - more solid colored */}
        {showBase && (
          <>
            <linearGradient id={`baseTop-${id}`} x1="0%" y1="0%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#47423bff"/>
              <stop offset="100%" stopColor="#383026ff"/>
            </linearGradient>
            <linearGradient id={`baseSide-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6B5B47"/>
              <stop offset="100%" stopColor="#5b5b5bff"/>
            </linearGradient>
            <radialGradient id={`baseHighlight-${id}`} cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="rgba(0, 0, 0, 0.4)"/>
              <stop offset="100%" stopColor="rgba(124, 124, 124, 0.50)"/>
            </radialGradient>
          </>
        )}
      </defs>

      {/* iOS-style crystal ball */}
      <g filter={`url(#${glowId})`}>
        {/* White outline */}
        <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        
        {/* Main glass sphere with iOS gradient */}
        <circle cx="50" cy="50" r="40" fill={`url(#${glassId})`} />
        
        {/* Subtle dark core for text readability */}
        <circle cx="50" cy="50" r="35" fill={`url(#${shadeId})`} />
        
        {/* Large iOS-style highlight (top-left) */}
        <ellipse cx="38" cy="35" rx="12" ry="8" fill={`url(#highlight-${id})`} transform="rotate(-20 38 35)" />
        
        {/* Smaller secondary highlight */}
        <ellipse cx="33" cy="32" rx="4" ry="3" fill="rgba(255,255,255,0.7)" transform="rotate(-20 33 32)" />
        
        {/* iOS-style rim reflection */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        
        {/* Inner subtle rim */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
      </g>

      {/* Percent text (iOS style) */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight={800}
        fontSize="24"
        fill="#FFFFFF"
        style={{ 
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {Math.round(percent)}%
      </text>

      {/* iOS-style wooden base */}
      {showBase && (
        <g>
          {/* Base shadow */}
          <ellipse cx="50" cy="98" rx="20" ry="3" fill="rgba(0,0,0,0.25)" />
          
          {/* Base body - rounded wooden shape */}
          <path
            d="M 32 86 Q 32 84 34 84 L 66 84 Q 68 84 68 86 L 68 92 Q 68 95 65 95 L 35 95 Q 32 95 32 92 Z"
            fill={`url(#baseSide-${id})`}
          />
          
          {/* Base top rim */}
          <ellipse cx="50" cy="86" rx="17" ry="4" fill={`url(#baseTop-${id})`} />
          
          {/* Base top highlight */}
          <ellipse cx="50" cy="85" rx="17" ry="4" fill={`url(#baseHighlight-${id})`} />
          
          {/* Wood grain details */}
          <ellipse cx="50" cy="88" rx="14" ry="2" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.3" />
          <ellipse cx="50" cy="91" rx="13" ry="1.5" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.2" />
          
          {/* Top rim detail */}
          <ellipse cx="50" cy="86" rx="16" ry="3.5" fill="none" stroke="rgba(139,115,85,0.4)" strokeWidth="0.4" />
        </g>
      )}
    </svg>
  );
};

export default CrystalBall;
