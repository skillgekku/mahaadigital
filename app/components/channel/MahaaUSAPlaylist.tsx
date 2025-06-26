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

export default function MahaaUSAPlaylist({ onBack, onPlayVideo }: Readonly<MahaaUSAPlaylistProps>) {
  const { isDarkMode } = useTheme();
  const theme = THEME_CLASSES[isDarkMode ? 'dark' : 'light'];
  
  const [viewMode, setViewMode] = useState<'schedule' | 'playlist'>('playlist');
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

  // Function to get YouTube thumbnail URL
  const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium') => {
    const baseUrl = 'https://img.youtube.com/vi';
    const qualityMap = {
      'default': 'default.jpg',
      'medium': 'mqdefault.jpg',
      'high': 'hqdefault.jpg',
      'standard': 'sddefault.jpg',
      'maxres': 'maxresdefault.jpg'
    };
    return `${baseUrl}/${videoId}/${qualityMap[quality]}`;
  };

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
      {/* Mobile/Tablet Optimized Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-4 sm:py-6 px-3 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors touch-target"
              >
                <ArrowLeft className="w-5 h-5 "  />
              </button>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/MAHAA%20USA%20PNG.png"
                  alt="Mahaa USA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Mahaa USA</h1>
                <p className="text-gray-100 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base">
                  <Youtube className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">US Telugu Content - YouTube Playlist</span>
                  <span className="sm:hidden">Telugu Content</span>
                  <span>• {MAHAA_USA_PLAYLIST.length} Videos</span>
                </p>
              </div>
            </div>
            <div className="text-right sm:text-right">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className="text-xs sm:text-sm opacity-75">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Optimized View Toggle & Controls */}
      <div className={`${theme.card} border-b px-3 sm:px-6 py-3 sm:py-4`}>
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('playlist')}
                  className={`px-3 sm:px-4 py-2 rounded-md flex items-center justify-center space-x-1 sm:space-x-2 transition-colors flex-1 sm:flex-initial text-sm sm:text-base ${
                    viewMode === 'playlist'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Playlist</span>
                  <span className="sm:hidden">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('schedule')}
                  className={`px-3 sm:px-4 py-2 rounded-md flex items-center justify-center space-x-1 sm:space-x-2 transition-colors flex-1 sm:flex-initial text-sm sm:text-base ${
                    viewMode === 'schedule'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-3">
              {viewMode === 'playlist' && (
                <button
                  onClick={toggleShuffle}
                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm touch-target ${
                    isShuffled
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                  <span className="hidden sm:inline">{isShuffled ? 'Shuffled' : 'Shuffle'}</span>
                </button>
              )}
              <div className={`px-3 py-2 rounded-lg ${theme.card} border`}>
                <span className={`text-xs sm:text-sm ${theme.description}`}>
                  {getCurrentPlaylist().length} videos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Mobile/Tablet Optimized Currently Playing Section */}
        {currentVideo && viewMode === 'schedule' && (
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white overflow-hidden relative">
            {/* Background thumbnail with overlay */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${getYouTubeThumbnail(currentVideo.youtubeId, 'high')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-800/90" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Video thumbnail - smaller on mobile */}
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <img
                      src={getYouTubeThumbnail(currentVideo.youtubeId, 'medium')}
                      alt={currentVideo.title}
                      className="w-24 h-18 sm:w-32 sm:h-24 rounded-lg object-cover border-2 border-white/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                      <span className="text-red-300 font-semibold text-sm">NOW SCHEDULED</span>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{currentVideo.title}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-red-100">
                        {currentVideo.scheduledTime}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getCategoryColor(currentVideo.category)}`}>
                        {currentVideo.category}
                      </span>
                      <span className="text-red-100">{currentVideo.duration}</span>
                      <div className="flex items-center space-x-1">
                        <Youtube className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        <span className="text-red-300">YouTube</span>
                      </div>
                    </div>
                    <p className="text-red-100 mt-2 text-sm line-clamp-2 sm:line-clamp-none">{currentVideo.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onPlayVideo(currentVideo.youtubeId)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center space-x-2 sm:space-x-3 transition-all transform hover:scale-105 touch-target w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-yellow-300 font-semibold text-sm sm:text-base">Stream Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Video Grid/List */}
        <div className={viewMode === 'schedule' ? 'space-y-3 sm:space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6'}>
          {viewMode === 'schedule' ? (
            // Mobile/Tablet Optimized Schedule View
            <>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme.title} mb-4 sm:mb-6 flex items-center space-x-2`}>
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Today's Schedule</span>
              </h2>
              {getScheduledVideos().map((video, index) => (
                <div
                  key={video.id}
                  className={`${theme.card} rounded-xl p-4 sm:p-6 border transition-all duration-300 hover:shadow-lg cursor-pointer touch-target ${
                    video.isCurrentlyPlaying ? 'border-red-500  dark:bg-red-900/20' : 'hover:border-red-300'
                  }`}
                  onClick={() => onPlayVideo(video.youtubeId)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center justify-between sm:flex-col sm:flex-shrink-0 sm:text-center">
                      <div className={`text-base sm:text-lg font-bold ${theme.title} sm:mb-1`}>
                        {video.scheduledTime}
                      </div>
                      <div className={`text-xs ${theme.description}`}>
                        {video.duration}
                      </div>
                    </div>
                    
                    {/* Video thumbnail in schedule view - responsive */}
                    <div className="flex-shrink-0 self-center sm:self-start">
                      <img
                        src={getYouTubeThumbnail(video.youtubeId, 'medium')}
                        alt={video.title}
                        className="w-20 h-15 sm:w-24 sm:h-18 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-20 h-15 sm:w-24 sm:h-18 rounded-lg bg-gray-800 flex items-center justify-center">
                                <svg class="w-6 h-6 sm:w-8 sm:h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-1 sm:space-y-0">
                        <h3 className={`text-lg sm:text-xl font-bold ${theme.title} line-clamp-2`}>
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          {video.isCurrentlyPlaying && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              LIVE
                            </span>
                          )}
                          <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs sm:text-sm text-white ${getCategoryColor(video.category)}`}>
                          {video.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className={`text-xs sm:text-sm ${theme.description}`}>4.5</span>
                        </div>
                      </div>
                      
                      <p className={`${theme.description} text-xs sm:text-sm mb-4 line-clamp-2`}>
                        {video.description}
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayVideo(video.youtubeId);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto touch-target"
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-sm">Stream Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Mobile/Tablet/TV Optimized Playlist View
            <>
              <div className="col-span-full mb-4 sm:mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold ${theme.title} flex items-center space-x-2`}>
                  <List className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Video Playlist</span>
                  {isShuffled && (
                    <span className="text-red-600 text-base sm:text-lg">• Shuffled</span>
                  )}
                </h2>
              </div>
              
              {getCurrentPlaylist().map((video, index) => (
                <div
                  key={video.id}
                  className={`${theme.card} rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer hover:border-red-300 transform hover:scale-105 touch-target`}
                  onClick={() => onPlayVideo(video.youtubeId)}
                >
                  {/* Responsive YouTube Video Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={getYouTubeThumbnail(video.youtubeId, 'high')}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center';
                          fallback.innerHTML = `
                            <div class="text-center text-white">
                              <div class="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2">
                                <svg class="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </div>
                              <div class="text-xs sm:text-sm opacity-75">${video.duration}</div>
                            </div>
                          `;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    
                    {/* Responsive overlay elements */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor(video.category)}`}>
                        {video.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {video.scheduledTime}
                    </div>
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${theme.title} mb-2 line-clamp-2`}>
                      {video.title}
                    </h3>
                    <p className={`${theme.description} text-xs sm:text-sm mb-3 line-clamp-2 hidden sm:block`}>
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className={`text-xs sm:text-sm ${theme.description}`}>4.5</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayVideo(video.youtubeId);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1 transition-colors touch-target"
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
      <div className={`${theme.footer} text-center py-4 sm:py-6 mt-8 sm:mt-12 px-3`}>
        <p className="text-xs sm:text-sm">
          &copy; 2025 Mahaa Digital. Premium Telugu content from North America.
        </p>
      </div>
    </div>
  );
}