import React, { memo } from 'react';
import { Play, Star, Youtube } from 'lucide-react';
import type { Program, ChannelConfig as ImportedChannelConfig } from '@/app/lib/types';

interface ProgramItemProps {
  program: Program;
  isCurrent: boolean;
  channel: ImportedChannelConfig; // Renamed from currentChannel for clarity
  getGenreColor: (genre: string) => string;
  onPlayYouTubeVideo: (program: Program) => void; // For YouTube video plays
  // Consider adding a generic onWatch or onSetReminder prop if non-YouTube channels need specific actions
}

const ProgramItemComponent: React.FC<ProgramItemProps> = ({
  program,
  isCurrent,
  channel,
  getGenreColor,
  onPlayYouTubeVideo,
}) => {
  const handleWatchClick = () => {
    if (channel.isYoutube) {
      onPlayYouTubeVideo(program);
    }
    // Else, for non-YouTube channels, this button might be a "Watch" or "Set Reminder".
    // The current logic from ChannelsSchedule for the "Watch" button on current programs
    // (non-YouTube) doesn't have an explicit action tied to it other than styling.
    // The "Set Reminder" button also doesn't have an action.
    // If these need actions, additional props/logic would be required.
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
        isCurrent
          ? 'bg-green-800 border-green-500'
          : 'bg-gray-700 hover:bg-gray-600 border-transparent hover:border-green-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center min-w-[60px]">
            <div className="text-lg font-bold text-white">
              {program.time}
            </div>
            <div className="text-xs text-gray-400">
              {program.duration}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">
                {program.title}
              </h3>
              {program.isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-red-500 text-xs font-medium">LIVE</span>
                </div>
              )}
              {isCurrent && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {channel.isYoutube ? 'STREAMING' : 'ON AIR'}
                </span>
              )}
              {channel.isYoutube && (
                <Youtube className="w-4 h-4 text-red-500" />
              )}
            </div>

            <div className="flex items-center space-x-4 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs text-white ${getGenreColor(program.genre)}`}>
                {program.genre}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-400">
                  {program.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isCurrent ? (
            <button
              onClick={handleWatchClick}
              className={`bg-gradient-to-r ${channel.bgGradient} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all`}
            >
              <Play className="w-4 h-4" />
              <span>{channel.isYoutube ? 'Stream' : 'Watch'}</span>
            </button>
          ) : (
            <button
              onClick={handleWatchClick} // For YouTube, this will attempt to play. For others, it's "Set Reminder"
              className="bg-gray-600 hover:bg-gray-500 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              {channel.isYoutube ? 'Stream Video' : 'Set Reminder'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProgramItem = memo(ProgramItemComponent);
