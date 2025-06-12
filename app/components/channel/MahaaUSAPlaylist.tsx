'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, Calendar, Star, ArrowLeft, Youtube, Shuffle, List, Grid } from 'lucide-react';
import { MAHAA_USA_PLAYLIST, YouTubeVideo } from '@/app/lib/constants';
import { useTheme } from '@/app/hooks/useTheme';
import { THEME_CLASSES } from '@/app/lib/constants';

interface MahaaUSAPlaylistProps {
  onBack: () => void;
  onPlayVideo: (videoId: string) => void;
}

export default function MahaaUSAPlaylist({ onBack, onPlayVideo }: MahaaUSAPlaylistProps) {
  const { isDarkMode } = useTheme();
  const theme = THEME_CLASSES[isDarkMode ? 'dark' : 'light'];
  
  const [viewMode, setViewMode] = useState<'schedule' | 'playlist'>('schedule');
  const [shuffledPlaylist, setShuffledPlaylist] = useState<YouTubeVideo[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize playlist
  useEffect(() => {
    setShuffledPlaylist([...MAHAA_USA_PLAYLIST]);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Shuffle functionality
  const shuffleArray = (array: YouTubeVideo[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleShuffle = () => {
    if (!isShuffled) {
      const shuffled = shuffleArray(MAHAA_USA_PLAYLIST);
      setShuffledPlaylist(shuffled);
    } else {
      setShuffledPlaylist([...MAHAA_USA_PLAYLIST]);
    }
    setIsShuffled(!isShuffled);
  };

  // Get current playlist
  const getCurrentPlaylist = () => {
    return viewMode === 'playlist' && isShuffled ? shuffledPlaylist : MAHAA_USA_PLAYLIST;
  };

  // Get currently scheduled video
  const getCurrentVideo = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    const sortedVideos = [...MAHAA_USA_PLAYLIST].sort((a, b) => 
      (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
    );
    
    for (let i = 0; i < sortedVideos.length; i++) {
      const video = sortedVideos[i];
      const nextVideo = sortedVideos[i + 1];
      
      if (!nextVideo) {
        if (currentTimeStr >= (video.scheduledTime || '')) return video;
      } else {
        if (currentTimeStr >= (video.scheduledTime || '') && 
            currentTimeStr < (nextVideo.scheduledTime || '')) {
          return video;
        }
      }
    }
    return sortedVideos[0]; // Default to first video
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Conference': 'bg-blue-600',
      'Youth Event': 'bg-green-600',
      'Political': 'bg-red-600',
      'Awards': 'bg-yellow-600',
      'Entertainment': 'bg-purple-600',
      'Interview': 'bg-orange-600',
      'Pageant': 'bg-pink-600'
    };
    return colors[category] || 'bg-gray-600';
  };

  // Get scheduled videos for today
  const getScheduledVideos = () => {
    return [...MAHAA_USA_PLAYLIST]
      .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
      .map(video => ({
        ...video,
        isCurrentlyPlaying: getCurrentVideo()?.id === video.id
      }));
  };

  const currentVideo = getCurrentVideo();

  return (
    <div className={`min-h-screen ${theme.body}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-6 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/MAHAA%20USA%20PNG.png"
                  alt="Mahaa USA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mahaa USA</h1>
                <p className="text-gray-100 flex items-center space-x-2">
                  <Youtube className="w-4 h-4" />
                  <span>US Telugu Content - YouTube Playlist</span>
                  <span>• {MAHAA_USA_PLAYLIST.length} Videos</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className="text-sm opacity-75">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Controls */}
      <div className={`${theme.card} border-b px-6 py-4`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                              <button
                onClick={() => setViewMode('playlist')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                  viewMode === 'playlist'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Playlist View</span>
              </button>
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                  viewMode === 'schedule'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule View</span>
              </button>

            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {viewMode === 'playlist' && (
              <button
                onClick={toggleShuffle}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  isShuffled
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                <span>{isShuffled ? 'Shuffled' : 'Shuffle'}</span>
              </button>
            )}
            <div className={`px-3 py-2 rounded-lg ${theme.card} border`}>
              <span className={`text-sm ${theme.description}`}>
                {getCurrentPlaylist().length} videos available
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Currently Playing Section */}
        {currentVideo && viewMode === 'schedule' && (
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                  <span className="text-red-300 font-semibold">NOW SCHEDULED</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{currentVideo.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-red-100">
                      Scheduled: {currentVideo.scheduledTime}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm text-white ${getCategoryColor(currentVideo.category)}`}>
                      {currentVideo.category}
                    </span>
                    <span className="text-red-100">{currentVideo.duration}</span>
                    <div className="flex items-center space-x-1">
                      <Youtube className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm">YouTube</span>
                    </div>
                  </div>
                  <p className="text-red-100 mt-2 max-w-2xl">{currentVideo.description}</p>
                </div>
              </div>
              <button
                onClick={() => onPlayVideo(currentVideo.youtubeId)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-3 transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span className="text-yellow-300 font-semibold">Stream Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Video Grid/List */}
        <div className={viewMode === 'schedule' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
          {viewMode === 'schedule' ? (
            // Schedule View
            <>
              <h2 className={`text-2xl font-bold ${theme.title} mb-6 flex items-center space-x-2`}>
                <Clock className="w-6 h-6" />
                <span>Today's Schedule</span>
              </h2>
              {getScheduledVideos().map((video, index) => (
                <div
                  key={video.id}
                  className={`${theme.card} rounded-xl p-6 border transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    video.isCurrentlyPlaying ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:border-red-300'
                  }`}
                  onClick={() => onPlayVideo(video.youtubeId)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-lg font-bold ${theme.title} mb-1`}>
                        {video.scheduledTime}
                      </div>
                      <div className={`text-xs ${theme.description}`}>
                        {video.duration}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-xl font-bold ${theme.title} truncate`}>
                          {video.title}
                        </h3>
                        {video.isCurrentlyPlaying && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            NOW SCHEDULED
                          </span>
                        )}
                        <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm text-white ${getCategoryColor(video.category)}`}>
                          {video.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className={`text-sm ${theme.description}`}>4.5</span>
                        </div>
                      </div>
                      
                      <p className={`${theme.description} text-sm mb-4 line-clamp-2`}>
                        {video.description}
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayVideo(video.youtubeId);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Stream Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Playlist View
            <>
              <div className="col-span-full mb-6">
                <h2 className={`text-2xl font-bold ${theme.title} flex items-center space-x-2`}>
                  <List className="w-6 h-6" />
                  <span>Video Playlist</span>
                  {isShuffled && (
                    <span className="text-red-600 text-lg">• Shuffled</span>
                  )}
                </h2>
              </div>
              
              {getCurrentPlaylist().map((video, index) => (
                <div
                  key={video.id}
                  className={`${theme.card} rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer hover:border-red-300 transform hover:scale-105`}
                  onClick={() => onPlayVideo(video.youtubeId)}
                >
                  {/* Video Thumbnail Placeholder */}
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Youtube className="w-12 h-12 mx-auto mb-2 text-red-500" />
                      <div className="text-sm opacity-75">{video.duration}</div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor(video.category)}`}>
                        {video.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {video.scheduledTime}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className={`text-lg font-bold ${theme.title} mb-2 line-clamp-2`}>
                      {video.title}
                    </h3>
                    <p className={`${theme.description} text-sm mb-3 line-clamp-2`}>
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className={`text-sm ${theme.description}`}>4.5</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayVideo(video.youtubeId);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${theme.footer} text-center py-6 mt-12`}>
        <p className="text-sm">
          &copy; 2025 Mahaa Digital. Premium Telugu content from North America.
        </p>
      </div>
    </div>
  );
}