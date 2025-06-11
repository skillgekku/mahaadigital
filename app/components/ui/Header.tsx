'use client';

import { useTheme } from '@/app/hooks/useTheme';

interface HeaderProps {
  onScheduleClick: () => void;
  isPiPActive?: boolean;
}

export default function Header({ onScheduleClick, isPiPActive }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="bg-gradient-to-r from-red-600 to-red-800 text-white py-6 px-8 shadow-2xl">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide">Mahaa LIVE TV</h1>
        <div className="flex items-center space-x-4">
{/*           <button
            onClick={onScheduleClick}
            className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            title="View All Schedules"
          >
            <span>📅</span>
            <span className="hidden sm:inline">Schedules</span>
          </button> */}
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {isPiPActive && (
            <div className="flex items-center space-x-2 bg-blue-600 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">PiP Active</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}