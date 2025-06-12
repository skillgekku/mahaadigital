'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, AlertCircle, SkipForward, SkipBack, List, Shuffle, Calendar } from 'lucide-react';
import { ChannelConfig } from '@/app/lib/types';
import { useTheme } from '@/app/hooks/useTheme';
import { THEME_CLASSES, MAHAA_USA_PLAYLIST } from '@/app/lib/constants';

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
  
  // YouTube playlist state (only for Mahaa USA)
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

  // Check if this is Mahaa USA with YouTube playlist
  const isUSAPlaylist = channel.id === 'mahaa-usa' && channel.isYoutube;

  // Initialize shuffled playlist for USA channel
  useEffect(() => {
    if (isUSAPlaylist) {
      setShuffledPlaylist([...MAHAA_USA_PLAYLIST]);
      // Find current video index based on youtubeVideoId
      if (channel.youtubeVideoId) {
        const index = MAHAA_USA_PLAYLIST.findIndex(v => v.youtubeId === channel.youtubeVideoId);
        if (index !== -1) {
          setCurrentVideoIndex(index);
        }
      }
    }
  }, [isUSAPlaylist, channel.youtubeVideoId]);

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

  // Load HLS.js dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Shuffle functionality (USA only)
  const shuffleArray = (array: YouTubeVideo[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleShuffle = () => {
    if (!isUSAPlaylist) return;
    
    if (!isShuffled) {
      const shuffled = shuffleArray(MAHAA_USA_PLAYLIST);
      setShuffledPlaylist(shuffled);
      setCurrentVideoIndex(0);
    } else {
      setShuffledPlaylist([...MAHAA_USA_PLAYLIST]);
      setCurrentVideoIndex(0);
    }
    setIsShuffled(!isShuffled);
  };

  // Get current playlist (USA only)
  const getCurrentPlaylist = () => {
    if (!isUSAPlaylist) return [];
    return isShuffled ? shuffledPlaylist : MAHAA_USA_PLAYLIST;
  };

  // Get current video (USA only)
  const getCurrentVideo = () => {
    if (!isUSAPlaylist) return null;
    const playlist = getCurrentPlaylist();
    return playlist[currentVideoIndex] || playlist[0];
  };

  // Next/Previous video (USA only)
  const nextVideo = () => {
    if (!isUSAPlaylist) return;
    const playlist = getCurrentPlaylist();
    const nextIndex = (currentVideoIndex + 1) % playlist.length;
    setCurrentVideoIndex(nextIndex);
  };

  const previousVideo = () => {
    if (!isUSAPlaylist) return;
    const playlist = getCurrentPlaylist();
    const prevIndex = currentVideoIndex === 0 ? playlist.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(prevIndex);
  };

  // Play specific video (USA only)
  const playVideo = (videoIndex: number) => {
    if (!isUSAPlaylist) return;
    setCurrentVideoIndex(videoIndex);
    setShowPlaylist(false);
  };

  // Cleanup function for HLS
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

  // Initialize HLS player
  const initializePlayer = (streamUrl: string) => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    // Clean up any existing instance
    cleanup();

    // Wait for HLS.js to load
    const initHls = () => {
      if (window.Hls && window.Hls.isSupported()) {
        console.log('HLS.js is supported, initializing...');
        
        hlsRef.current = new window.Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
        });

        hlsRef.current.loadSource(streamUrl);
        hlsRef.current.attachMedia(video);

        // HLS events
        hlsRef.current.on(window.Hls.Events.MEDIA_ATTACHED, () => {
          console.log('Media attached');
        });

        hlsRef.current.on(window.Hls.Events.MANIFEST_PARSED, () => {
          console.log('Manifest parsed, starting playback');
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
        // Native HLS support (Safari)
        console.log('Using native HLS support');
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

    // Check if HLS.js is already loaded
    if (window.Hls) {
      initHls();
    } else {
      // Wait for script to load
      const checkHls = setInterval(() => {
        if (window.Hls) {
          clearInterval(checkHls);
          initHls();
        }
      }, 100);

      // Timeout after 5 seconds
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

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = () => {
    if (!channel.isYoutube) return '';
    
    let videoId = channel.youtubeVideoId;
    
    // For USA playlist, use current video
    if (isUSAPlaylist) {
      const currentVideo = getCurrentVideo();
      if (currentVideo) {
        videoId = currentVideo.youtubeId;
      }
    }
    
    if (!videoId) return '';
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&enablejsapi=1`;
  };

  // Video event handlers (HLS only)
  const handleVideoEvents = () => {
    const video = videoRef.current;
    if (!video || channel.isYoutube) return;

    video.onplay = () => setIsPlaying(true);
    video.onpause = () => setIsPlaying(false);
    video.onvolumechange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    video.onerror = () => setError('Video playback error occurred');
  };

  useEffect(() => {
    handleVideoEvents();
  }, [channel.isYoutube]);

  // HLS Controls functions
  const togglePlayPause = () => {
    if (channel.isYoutube) return;
    
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    }
  };

  const toggleMute = () => {
    if (channel.isYoutube) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (channel.isYoutube) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    if (channel.isYoutube) {
      setError('Use YouTube player controls for fullscreen');
      return;
    }
    
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(console.warn);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.warn);
      }
    }
  };

  const togglePiP = async () => {
    if (channel.isYoutube) {
      setError('Picture-in-Picture is not available for YouTube content');
      return;
    }

    const video = videoRef.current;
    if (!video || !isPiPSupported) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Failed to toggle Picture-in-Picture:', error);
      setError('Picture-in-Picture not available');
    }
  };

  // PiP event handlers (HLS only)
  useEffect(() => {
    if (channel.isYoutube) return;
    
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiPMode(true);
      onPiPChange?.(true);
    };

    const handleLeavePiP = () => {
      setIsPiPMode(false);
      onPiPChange?.(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [channel.isYoutube, onPiPChange]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (channel.isYoutube) return;
      
      switch (e.key) {
        case 'Escape':
          if (!document.pictureInPictureElement) {
            onClose();
          }
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          if (isPiPSupported) {
            togglePiP();
          }
          break;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, channel.isYoutube, isPiPSupported]);

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

  // Retry function (HLS only)
  const handleRetry = () => {
    setError(null);
    if (channel.streamUrl && !channel.isYoutube) {
      initializePlayer(channel.streamUrl);
    }
  };

  // Get category color (USA only)
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

  // Calculate responsive dimensions
  const isMobile = windowSize.width < 768;
  const topBarHeight = isMobile ? '60px' : '80px';
  const bottomControlsHeight = channel.isYoutube ? '60px' : (isMobile ? '80px' : '100px');

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
            {isUSAPlaylist && getCurrentVideo() ? getCurrentVideo()!.title : channel.name}
          </h3>
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0"></div>
            <span className="text-red-400 text-xs md:text-sm shrink-0">
              {isUSAPlaylist ? 'YOUTUBE PLAYLIST' : (channel.isYoutube ? 'YOUTUBE' : 'LIVE')}
            </span>
            {isUSAPlaylist && (
              <span className="text-gray-400 text-xs md:text-sm truncate">
                • Video {currentVideoIndex + 1} of {getCurrentPlaylist().length}
              </span>
            )}
            {isPiPMode && !channel.isYoutube && (
              <span className="text-blue-400 text-xs md:text-sm shrink-0">• PiP Active</span>
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
          {isUSAPlaylist && (
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
          {isPiPSupported && !channel.isYoutube && (
            <button
              onClick={togglePiP}
              className="text-white hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              title="Picture-in-Picture (P)"
            >
              <Minimize className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-white hover:text-red-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

  {/* Video Container with Ad Banners */}
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
        
        {/* Left Ad Banner */}
        <div className="hidden lg:flex lg:w-48 xl:w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0">
          <div className="w-full p-4 flex flex-col space-y-4">
            {/* Ad Banner 1 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-center">
                <div className="text-white font-bold text-sm mb-2">Advertisement</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-1">Your Ad Here</div>
                  <div className="text-white text-xs opacity-75">Premium placement</div>
                </div>
              </div>
            </div>
            
            {/* Ad Banner 2 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-br from-green-600 to-teal-600 p-4 text-center">
                <div className="text-white font-bold text-sm mb-2">Sponsored</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-1">Brand Partner</div>
                  <div className="text-white text-xs opacity-75">Click to learn more</div>
                </div>
              </div>
            </div>
            
            {/* Ad Banner 3 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-br from-red-600 to-pink-600 p-4 text-center">
                <div className="text-white font-bold text-sm mb-2">Featured</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-1">Special Offer</div>
                  <div className="text-white text-xs opacity-75">Limited time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Video Area */}
        <div className={`flex-1 transition-all duration-300 ${(showPlaylist || showSchedule) && isUSAPlaylist ? 'lg:flex-none lg:w-1/2 xl:w-3/5' : ''}`}>
          {/* YouTube Content */}
          {channel.isYoutube && (
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                key={isUSAPlaylist ? getCurrentVideo()?.youtubeId : channel.youtubeVideoId}
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl()}
                title={`${isUSAPlaylist ? getCurrentVideo()?.title : channel.name} YouTube Stream`}
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
              {/* Loading */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                  <div className="text-center px-4">
                    <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-white text-base md:text-lg">Loading {channel.name}...</p>
                    <p className="text-gray-400 text-sm mt-2">Connecting to stream...</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20 p-4">
                  <div className="text-center bg-gray-800 p-4 md:p-8 rounded-lg border border-red-500 max-w-md w-full">
                    <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-white text-lg md:text-xl mb-4">Playback Error</p>
                    <p className="text-gray-300 mb-6 text-sm md:text-base">{error}</p>
                    <div className="space-y-3">
                      <button 
                        onClick={handleRetry}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base"
                      >
                        Retry
                      </button>
                      <button 
                        onClick={handleClose}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base"
                      >
                        Close Player
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-contain max-w-full max-h-full"
                controls={false}
                playsInline
                onError={() => setError('Video playback error occurred')}
                style={{
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </>
          )}
        </div>

        {/* Playlist Sidebar (USA only) */}
        {(showPlaylist || showSchedule) && isUSAPlaylist && (
          <div className="w-full lg:w-1/3 xl:w-1/4 bg-gray-900 bg-opacity-95 overflow-hidden border-l border-gray-700">
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
              </div>
            </div>
          </div>
        )}

        {/* Right Ad Banner */}
        <div className="hidden lg:flex lg:w-48 xl:w-64 bg-gray-900 border-l border-gray-700 flex-shrink-0">
          <div className="w-full p-4 flex flex-col space-y-4">
            {/* Ad Banner 1 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-br from-orange-600 to-yellow-600 p-4 text-center">
                <div className="text-white font-bold text-sm mb-2">Promoted</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-1">Your Business</div>
                  <div className="text-white text-xs opacity-75">Advertise here</div>
                </div>
              </div>
            </div>
            
            {/* Ad Banner 2 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-4 text-center">
                <div className="text-white font-bold text-sm mb-2">Partnership</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-1">Collaborate</div>
                  <div className="text-white text-xs opacity-75">Join our network</div>
                </div>
              </div>
            </div>
            
            {/* Ad Banner 3 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 text-center">
                <div className="text-white font-bold text-sm mb-2">Premium</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-1">Upgrade Now</div>
                  <div className="text-white text-xs opacity-75">Ad-free experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        className={`px-3 md:px-4 py-2 md:py-4 bg-black bg-opacity-70 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} shrink-0`}
        style={{ height: bottomControlsHeight }}
      >
        {isUSAPlaylist ? (
          // YouTube Playlist Controls
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
        ) : channel.isYoutube ? (
          // Regular YouTube Controls
          <div className="text-center text-gray-400 text-xs md:text-sm flex items-center justify-center h-full">
            Use YouTube player controls for playback, volume, and fullscreen options
          </div>
        ) : (
          // HLS Controls
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-red-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 shrink-0"
                disabled={isLoading || !!error}
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              
              <button
                onClick={toggleMute}
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
                  onChange={handleVolumeChange}
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
                  onClick={togglePiP}
                  className={`hover:text-blue-400 transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white hover:bg-opacity-10 ${isPiPMode ? 'text-blue-400' : 'text-white'}`}
                  disabled={isLoading || !!error}
                  title="Picture-in-Picture (P)"
                >
                  <Minimize className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
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
          {isUSAPlaylist 
            ? 'Use YouTube player controls for playback • Previous/Next: Skip videos • Shuffle: Randomize playlist'
            : channel.isYoutube 
              ? 'Use YouTube player controls for playback, volume, and fullscreen options'
              : 'Space: Play/Pause • M: Mute • F: Fullscreen • P: Picture-in-Picture • Esc: Exit'
          }
        </div>
      </div>
    </div>
  );
}