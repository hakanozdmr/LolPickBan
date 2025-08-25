import React from 'react';

// Role Icons
export const TopIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L14 8L20 6L16 10L22 12L16 14L20 18L14 16L12 22L10 16L4 18L8 14L2 12L8 10L4 6L10 8L12 2Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    <path 
      d="M12 4L13 7L16 6L14 9L17 10L14 11L16 14L13 13L12 16L11 13L8 14L10 11L7 10L10 9L8 6L11 7L12 4Z" 
      fill="currentColor"
    />
  </svg>
);

export const JungleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2C8 2 5 5 5 9C5 11 6 12.5 7.5 13.5L6 16L8 17L9 15L12 16L15 15L16 17L18 16L16.5 13.5C18 12.5 19 11 19 9C19 5 16 2 12 2Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    <circle cx="10" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="8" r="1.5" fill="currentColor"/>
    <path d="M8 18L10 20L12 19L14 20L16 18L14 22L10 22L8 18Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

export const MidIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M12 1L13 5L17 4L15 7L19 8L15 9L17 12L13 11L12 15L11 11L7 12L9 9L5 8L9 7L7 4L11 5L12 1Z" fill="currentColor" opacity="0.7"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.9"/>
  </svg>
);

export const AdcIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12L8 10L6 8L12 6L18 8L16 10L22 12L16 14L18 16L12 18L6 16L8 14L2 12Z" fill="currentColor" opacity="0.7"/>
    <path d="M12 6L16 8L14 10L18 12L14 14L16 16L12 18L8 16L10 14L6 12L10 10L8 8L12 6Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

export const SupportIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L8 6L12 10L16 6L12 2Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    <path 
      d="M6 8L2 12L6 16L10 12L6 8Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    <path 
      d="M18 8L14 12L18 16L22 12L18 8Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    <path 
      d="M12 14L8 18L12 22L16 18L12 14Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

// Class Icons
export const AssassinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14 6L18 4L16 8L20 10L16 12L18 16L14 14L12 18L10 14L6 16L8 12L4 10L8 8L6 4L10 6L12 2Z" fill="currentColor" opacity="0.6"/>
    <path d="M12 4L13 7L16 6L14 9L17 10L14 11L16 14L13 13L12 16L11 13L8 14L10 11L7 10L10 9L8 6L11 7L12 4Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

export const MageIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L11 8L8 5L10 11L4 9L10 13L7 16L13 10L16 13L13 7L19 9L13 5L16 8L12 2Z" fill="currentColor" opacity="0.7"/>
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M12 18L13 20L15 19L14 21L16 22L14 23L12 24L10 23L8 22L10 21L9 19L11 20L12 18Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

export const TankIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L6 6L4 12L6 18L12 22L18 18L20 12L18 6L12 2Z" fill="currentColor" opacity="0.6"/>
    <path d="M12 4L7 7L6 12L7 17L12 20L17 17L18 12L17 7L12 4Z" fill="currentColor" opacity="0.8"/>
    <path d="M12 6L9 8L8 12L9 16L12 18L15 16L16 12L15 8L12 6Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.9"/>
  </svg>
);

export const FighterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L8 8L12 4L16 8L21 3L18 6L14 10L12 12L10 10L6 6L3 3Z" fill="currentColor" opacity="0.7"/>
    <path d="M3 21L8 16L12 20L16 16L21 21L18 18L14 14L12 12L10 14L6 18L3 21Z" fill="currentColor" opacity="0.7"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

export const MarksmanIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12L6 10L8 12L6 14L2 12Z" fill="currentColor"/>
    <path d="M8 12L12 8L16 12L12 16L8 12Z" fill="currentColor" opacity="0.8"/>
    <path d="M16 12L22 10L20 12L22 14L16 12Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M10 6L12 4L14 6L12 8L10 6Z" fill="currentColor" opacity="0.6"/>
    <path d="M10 18L12 20L14 18L12 16L10 18Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

export const SupportClassIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.5"/>
    <path d="M12 4L15 9L20 7L17 12L22 14L17 16L20 21L15 19L12 24L9 19L4 21L7 16L2 14L7 12L4 7L9 9L12 4Z" fill="currentColor" opacity="0.7"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.9"/>
  </svg>
);