import React from 'react';

export const CebAssistLogo: React.FC<{ className?: string; iconOnly?: boolean }> = ({
  className = '',
  iconOnly = false,
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* CEBAssist Lightning icon matching official style */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-sky-500 shadow-sm p-1.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 drop-shadow"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex items-baseline tracking-tight">
          <span className="font-bold text-xl text-slate-800">CEB</span>
          <span className="font-semibold text-xl text-slate-600">Assist</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-0.5 inline-block" />
        </div>
      )}
    </div>
  );
};
