'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, AlertCircle, SkipForward, SkipBack, List, Shuffle, Calendar } from 'lucide-react';
import { ChannelConfig } from '@/app/lib/types';
import { useTheme } from '@/app/hooks/useTheme';
import { THEME_CLASSES } from '@/app/lib/constants';

// YouTube Video Interface
interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  category: string;
  scheduledTime?: string;
}

// HLS.js type declaration
declare global {
  interface Window {
    Hls: any;
  }
}

interface VideoPlayerProps {
  channel: ChannelConfig;
  isOpen: boolean;
  onClose: () => void;
  onPiPChange?: (isPiP: boolean) => void;
}

export default function VideoPlayer({ channel, isOpen, onClose, onPiPChange }: VideoPlayerProps) {
  const { isDarkMode } = useTheme();
  const theme = THEME_CLASSES[isDarkMode ? 'dark' : 'light'];
  
  // YouTube playlist for Mahaa USA
  const [youtubePlaylist] = useState<YouTubeVideo[]>([
    {
      id: 'tana-24th-conference',
      title: 'TANA 24th Conference',
      description: 'Telugu Association of North America 24th Annual Conference',
      youtubeId: 'Izd-SLokbPY',
      duration: '2:45:30',
      category: 'Conference',
      scheduledTime: '09:00'
    },
    {
      id: 'tana-youth-conference-2025',
      title: 'TANA Youth Conference 2025',
      description: 'Young Telugu professionals gathering and networking event',
      youtubeId: 'kS9L0lz0EWM',
      duration: '1:30:45',
      category: 'Youth Event',
      scheduledTime: '11:45'
    },
    {
      id: 'ktr-dallas',
      title: 'KTR in Dallas',
      description: 'KT Rama Rao visit to Dallas - Political and cultural event',
      youtubeId: 'wf8tDgoCuX4',
      duration: '2:15:20',
      category: 'Political',
      scheduledTime: '14:00'
    },
    {
      id: 'mahaa-icon',
      title: 'Mahaa ICON',
      description: 'Prestigious awards ceremony celebrating Telugu excellence',
      youtubeId: 'tq6kVYunCTk',
      duration: '3:20:15',
      category: 'Awards',
      scheduledTime: '16:30'
    },
    {
      id: 'kannappa-manchu-vishnu',
      title: 'Kannappa - Manchu Vishnu in USA',
      description: 'Actor Manchu Vishnu promotes his upcoming film Kannappa',
      youtubeId: '3erbr7GN3UI',
      duration: '1:45:30',
      category: 'Entertainment',
      scheduledTime: '20:00'
    },
    {
      id: 'rana-daggubati-loca-loka',
      title: 'Rana Daggubati - Loca Loka',
      description: 'Popular actor Rana Daggubati in exclusive interview',
      youtubeId: '-A_xRPsKSWg',
      duration: '1:20:45',
      category: 'Interview',
      scheduledTime: '22:00'
    },
    {
      id: 'nats-8th-conference',
      title: 'NATS 8th Conference',
      description: 'North American Telugu Society annual conference highlights',
      youtubeId: 'UTArkqpGGCw',
      duration: '2:00:30',
      category: 'Conference',
      scheduledTime: '06:00'
    },
    {
      id: 'miss-telugu-usa-2025',
      title: 'Miss Telugu USA 2025',
      description: 'Beauty pageant celebrating Telugu culture in America',
      youtubeId: 'RcIX4xjTkf0',
      duration: '2:30:15',
      category: 'Pageant',
      scheduledTime: '19:00'
    }
  ]);

  // Player state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPiPMode, setIsPiPMode] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // YouTube playlist state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<YouTubeVideo[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize shuffled playlist
  useEffect(() => {
    setShuffledPlaylist([...youtubePlaylist]);
  }, []);

  // Track window size for responsive design
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    window.addEventListener('orientationchange', updateWindowSize);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      window.removeEventListener('orientationchange', updateWindowSize);
    };
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check PiP support on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsPiPSupported('pictureInPictureEnabled' in document);
    }
  }, []);

  // Shuffle playlist function
  const shuffleArray = (array: YouTubeVideo[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    if (!isShuffled) {
      const shuffled = shuffleArray(youtubePlaylist);
      setShuffledPlaylist(shuffled);
      setCurrentVideoIndex(0);
    } else {
      setShuffledPlaylist([...youtubePlaylist]);
      setCurrentVideoIndex(0);
    }
    setIsShuffled(!isShuffled);
  };

  // Get current playlist
  const getCurrentPlaylist = () => {
    return isShuffled ? shuffledPlaylist : youtubePlaylist;
  };

  // Get current video
  const getCurrentVideo = () => {
    const playlist = getCurrentPlaylist();
    return playlist[currentVideoIndex] || playlist[0];
  };

  // Play specific video
  const playVideo = (videoIndex: number) => {
    setCurrentVideoIndex(videoIndex);
    setShowPlaylist(false);
  };

  // Next video
  const nextVideo = () => {
    const playlist = getCurrentPlaylist();
    const nextIndex = (currentVideoIndex + 1) % playlist.length;
    setCurrentVideoIndex(nextIndex);
  };

  // Previous video
  const previousVideo = () => {
    const playlist = getCurrentPlaylist();
    const prevIndex = currentVideoIndex === 0 ? playlist.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(prevIndex);
  };

  // Get YouTube embed URL for current video
  const getYouTubeEmbedUrl = () => {
    if (!channel.isYoutube) return '';
    
    const currentVideo = getCurrentVideo();
    if (!currentVideo) return '';
    
    return `https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&enablejsapi=1`;
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
    return youtubePlaylist.map((video, index) => ({
      ...video,
      originalIndex: index,
      isCurrentlyPlaying: getCurrentVideo()?.id === video.id
    })).sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  };

  // Regular HLS initialization for non-YouTube channels
  const cleanup = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
  };

  const initializePlayer = (streamUrl: string) => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);
    cleanup();

    const initHls = () => {
      if (window.Hls && window.Hls.isSupported()) {
        hlsRef.current = new window.Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
        });

        hlsRef.current.loadSource(streamUrl);
        hlsRef.current.attachMedia(video);

        hlsRef.current.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(err => {
            console.error('Play failed:', err);
            setError('Failed to start playback. Please try again.');
            setIsLoading(false);
          });
        });

        hlsRef.current.on(window.Hls.Events.ERROR, (event: any, data: any) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            setError(`Streaming error: ${data.details || 'Unknown error'}`);
            setIsLoading(false);
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch(err => {
            console.error('Play failed:', err);
            setError('Failed to start playback. Please try again.');
            setIsLoading(false);
          });
        });

        video.addEventListener('error', () => {
          setError('Failed to load the stream. Please check your connection.');
          setIsLoading(false);
        });

      } else {
        setError('Your browser does not support HLS streaming.');
        setIsLoading(false);
      }
    };

    if (window.Hls) {
      initHls();
    } else {
      const checkHls = setInterval(() => {
        if (window.Hls) {
          clearInterval(checkHls);
          initHls();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkHls);
        if (!window.Hls) {
          setError('Failed to load video player. Please refresh the page.');
          setIsLoading(false);
        }
      }, 5000);
    }
  };

  // Initialize player when channel changes
  useEffect(() => {
    if (isOpen && channel && !channel.isYoutube && channel.streamUrl) {
      setTimeout(() => {
        initializePlayer(channel.streamUrl!);
      }, 100);
    }
  }, [isOpen, channel]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Close player
  const handleClose = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(console.warn);
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn);
    }
    cleanup();
    onClose();
  };

  // Calculate responsive dimensions
  const isMobile = windowSize.width < 768;
  const topBarHeight = isMobile ? '60px' : '80px';
  const bottomControlsHeight = isMobile ? '80px' : '100px';

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden"
      style={{ 
        width: '100vw', 
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh'
      }}
    >
      {/* Top Bar */}
      <div 
        className={`flex justify-between items-center px-3 md:px-4 py-2 md:py-4 bg-black bg-opacity-70 text-white z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} shrink-0`}
        style={{ height: topBarHeight }}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold truncate">
            {channel.isYoutube && channel.id === 'mahaa-usa' ? getCurrentVideo()?.title : channel.name}
          </h3>
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0"></div>
            <span className="text-red-400 text-xs md:text-sm shrink-0">
              {channel.isYoutube ? 'YOUTUBE PLAYLIST' : 'LIVE'}
            </span>
            {channel.isYoutube && channel.id === 'mahaa-usa' && (
              <span className="text-gray-400 text-xs md:text-sm truncate">
                • Video {currentVideoIndex + 1} of {getCurrentPlaylist().length}
              </span>
            )}
            <span className="text-gray-400 text-xs md:text-sm truncate">
              • {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 md:space-x-3 shrink-0 ml-2">
          {channel.isYoutube && channel.id === 'mahaa-usa' && (
            <>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="text-white hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                title="Show Schedule"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="text-white hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                title="Show Playlist"
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}
          <button
            onClick={handleClose}
            className="text-white hover:text-red-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div 
        className="flex-1 relative bg-black min-h-0 overflow-hidden flex"
        onMouseMove={resetControlsTimeout}
        onMouseEnter={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        style={{
          height: `calc(100vh - ${topBarHeight} - ${bottomControlsHeight})`,
          minHeight: '200px'
        }}
      >
        {/* Main Video Area */}
        <div className={`${(showPlaylist || showSchedule) ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          {/* YouTube Content */}
          {channel.isYoutube && (
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                key={getCurrentVideo()?.youtubeId}
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl()}
                title={`${getCurrentVideo()?.title || channel.name} YouTube Stream`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full max-w-full max-h-full"
                style={{
                  aspectRatio: '16/9',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            </div>
          )}

          {/* Regular HLS Content */}
          {!channel.isYoutube && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                  <div className="text-center px-4">
                    <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-white text-base md:text-lg">Loading {channel.name}...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20 p-4">
                  <div className="text-center bg-gray-800 p-4 md:p-8 rounded-lg border border-red-500 max-w-md w-full">
                    <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-white text-lg md:text-xl mb-4">Playback Error</p>
                    <p className="text-gray-300 mb-6 text-sm md:text-base">{error}</p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-full object-contain max-w-full max-h-full"
                controls={false}
                playsInline
                style={{
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </>
          )}
        </div>

        {/* Playlist Sidebar */}
        {(showPlaylist || showSchedule) && channel.isYoutube && channel.id === 'mahaa-usa' && (
          <div className="w-1/3 bg-gray-900 bg-opacity-95 overflow-hidden border-l border-gray-700">
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">
                  {showSchedule ? 'Today\'s Schedule' : 'Playlist'}
                </h3>
                <div className="flex items-center space-x-2">
                  {!showSchedule && (
                    <button
                      onClick={toggleShuffle}
                      className={`p-2 rounded-lg transition-colors ${
                        isShuffled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowPlaylist(false);
                      setShowSchedule(false);
                    }}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Video List */}
              <div className="flex-1 overflow-y-auto">
                {showSchedule ? (
                  <div className="p-4 space-y-3">
                    {getScheduledVideos().map((video, index) => (
                      <div
                        key={video.id}
                        onClick={() => playVideo(video.originalIndex)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          video.isCurrentlyPlaying
                            ? 'bg-green-600 border border-green-400'
                            : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`text-xs px-2 py-1 rounded ${
                              video.isCurrentlyPlaying ? 'bg-green-400 text-green-900' : 'bg-gray-600 text-white'
                            }`}>
                              {video.scheduledTime}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-semibold mb-1 line-clamp-2">
                              {video.title}
                            </h4>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded text-white ${getCategoryColor(video.category)}`}>
                                {video.category}
                              </span>
                              <span className="text-xs text-gray-400">{video.duration}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {video.description}
                            </p>
                            {video.isCurrentlyPlaying && (
                              <div className="flex items-center space-x-1 mt-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-400 font-medium">NOW PLAYING</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {getCurrentPlaylist().map((video, index) => (
                      <div
                        key={video.id}
                        onClick={() => playVideo(index)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          index === currentVideoIndex
                            ? 'bg-blue-600 border border-blue-400'
                            : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === currentVideoIndex ? 'bg-blue-400 text-blue-900' : 'bg-gray-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-semibold mb-1 line-clamp-2">
                              {video.title}
                            </h4>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded text-white ${getCategoryColor(video.category)}`}>
                                {video.category}
                              </span>
                              <span className="text-xs text-gray-400">{video.duration}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {video.description}
                            </p>
                            {index === currentVideoIndex && (
                              <div className="flex items-center space-x-1 mt-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-blue-400 font-medium">NOW PLAYING</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls - Enhanced for YouTube playlist */}
      <div 
        className={`px-3 md:px-4 py-2 md:py-4 bg-black bg-opacity-70 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} shrink-0`}
        style={{ height: bottomControlsHeight }}
      >
        {channel.isYoutube && channel.id === 'mahaa-usa' ? (
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <button
                onClick={previousVideo}
                className="text-white hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 shrink-0"
                title="Previous Video"
              >
                <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button
                onClick={nextVideo}
                className="text-white hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 shrink-0"
                title="Next Video"
              >
                <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="flex-1 min-w-0 px-2">
                <div className="text-sm text-white font-medium truncate">
                  {getCurrentVideo()?.title}
                </div>
                <div className="text-xs text-gray-400">
                  {getCurrentVideo()?.category} • {getCurrentVideo()?.duration}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-4 shrink-0 ml-2">
              <button
                onClick={toggleShuffle}
                className={`hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 ${
                  isShuffled ? 'text-green-400' : 'text-white'
                }`}
                title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
              >
                <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 ${
                  showPlaylist ? 'text-blue-400' : 'text-white'
                }`}
                title="Toggle Playlist"
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        ) : (
          // Regular HLS controls
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => {/* togglePlayPause for HLS */}}
                className="text-white hover:text-red-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 shrink-0"
                disabled={isLoading || !!error}
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              
              <button
                onClick={() => {/* toggleMute for HLS */}}
                className="text-white hover:text-red-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 shrink-0"
                disabled={isLoading || !!error}
                title="Mute/Unmute (M)"
              >
                {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              
              <div className="flex items-center space-x-2 min-w-0 flex-1 max-w-32">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={() => {/* handleVolumeChange for HLS */}}
                  className="flex-1 accent-red-500 min-w-0"
                  disabled={isLoading || !!error}
                />
                <span className="text-white text-xs md:text-sm w-6 md:w-8 shrink-0 text-center">
                  {Math.round((isMuted ? 0 : volume) * 100)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-4 shrink-0 ml-2">
              {isPiPSupported && (
                <button
                  onClick={() => {/* togglePiP for HLS */}}
                  className={`hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 ${isPiPMode ? 'text-blue-400' : 'text-white'}`}
                  disabled={isLoading || !!error}
                  title="Picture-in-Picture (P)"
                >
                  <Minimize className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              <button
                onClick={() => {/* toggleFullscreen for HLS */}}
                className="text-white hover:text-red-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                disabled={isLoading || !!error}
                title="Fullscreen (F)"
              >
                <Maximize className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-1 md:mt-2 text-gray-400 text-xs hidden md:block">
          {channel.isYoutube && channel.id === 'mahaa-usa' 
            ? 'Use YouTube player controls for playback • Previous/Next: Skip videos • Shuffle: Randomize playlist'
            : 'Space: Play/Pause • M: Mute • F: Fullscreen • P: Picture-in-Picture • Esc: Exit'
          }
        </div>
      </div>
    </div>
  );
}