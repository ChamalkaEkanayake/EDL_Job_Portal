import React from 'react';
import logoImg from '../../assets/ceb-job-portal-logo.png';

interface CebJobPortalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CebJobPortalLogo: React.FC<CebJobPortalLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const heightClasses = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-18 sm:h-20',
    xl: 'h-24 sm:h-28',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="CEB Job Portal - Build Your Career with CEB"
        className={`${heightClasses[size]} w-auto object-contain transition-all`}
      />
    </div>
  );
};
