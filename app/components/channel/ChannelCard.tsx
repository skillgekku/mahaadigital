'use client';

import React, { memo } from 'react'; // Added memo
import Image from 'next/image';
import { ChannelConfig } from '@/app/lib/types';
import { useTheme } from '@/app/hooks/useTheme';
import { THEME_CLASSES, MAHAA_USA_PLAYLIST } from '@/app/lib/constants';
import { Youtube, List } from 'lucide-react';

interface ChannelCardProps {
  channel: ChannelConfig;
  index: number;
  onPlay: (channel: ChannelConfig) => void;
  onSchedule: (channelIndex: number) => void;
}

// Wrapped with React.memo
const ChannelCardComponent = ({ channel, index, onPlay, onSchedule }: ChannelCardProps) => {
  const { isDarkMode } = useTheme();
  const theme = THEME_CLASSES[isDarkMode ? 'dark' : 'light'];

  const getImageSrc = () => {
    const imageMap = {
      'mahaa-news': 'https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/news.png',
      'mahaa-bhakti': 'https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/baks.png',
      'mahaa-max': 'https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/max.png',
      'mahaa-usa': 'https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/MAHAA%20USA%20PNG.png'
    };
    return imageMap[channel.id as keyof typeof imageMap] || '';
  };

  const buttonColorMap = {
    'mahaa-news': 'bg-blue-600 hover:bg-blue-700',
    'mahaa-bhakti': 'bg-red-600 hover:bg-red-700',
    'mahaa-max': 'bg-purple-600 hover:bg-purple-700',
    'mahaa-usa': 'bg-green-600 hover:bg-green-700'
  };

  const isUSAChannel = channel.id === 'mahaa-usa';

  return (
    <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className={`${theme.card} rounded-xl overflow-hidden shadow-xl border`}>
        <div className="relative">
          <div onClick={() => onPlay(channel)}>
            <Image
              src={getImageSrc()}
              alt={channel.name}
              width={300}
              height={150}
              className={`w-full h-56 group-hover:scale-110 transition-transform duration-500 ${
                channel.id === 'mahaa-usa' ? 'object-contain bg-white' : 'object-cover'
              }`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="absolute top-4 right-4 text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center">
            {channel.icon}
          </div>
          
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-medium">
            {isUSAChannel ? 'YOUTUBE PLAYLIST' : (channel.isYoutube ? 'YOUTUBE' : 'LIVE')}
          </div>

          {/* Special indicator for USA channel */}
          {isUSAChannel && (
            <div className="absolute top-4 left-4 bg-green-600 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <List className="w-3 h-3" />
              <span>{MAHAA_USA_PLAYLIST.length} Videos</span>
            </div>
          )}
          
          {/* Hover overlay with buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
            <button
              onClick={() => onPlay(channel)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isUSAChannel ? (
                <>
                  <List className="w-4 h-4" />
                  <span>Browse</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Play</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-xl font-bold ${theme.title}`}>{channel.name}</h3>
            {isUSAChannel && (
              <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
          </div>
          
          <p className={`${theme.description} mb-4`}>{channel.description}</p>
          
        
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onPlay(channel)}
              className={`flex-1 ${buttonColorMap[channel.id as keyof typeof buttonColorMap]} text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center space-x-2`}
            >
              {isUSAChannel ? (
                <>
                  <List className="w-4 h-4" />
                  <span>Watch Now</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Watch Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ChannelCardComponent);