'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, AlertCircle } from 'lucide-react';
import { ChannelConfig } from '@/app/lib/types';
import { useTheme } from '@/app/hooks/useTheme';
import { THEME_CLASSES } from '@/app/lib/constants';

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
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Cleanup function
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

  // Handle YouTube channel
  const getYouTubeEmbedUrl = () => {
    if (!channel.isYoutube || !channel.youtubeVideoId) return '';
    return `https://www.youtube.com/embed/${channel.youtubeVideoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
  };

  // Video event handlers
  const handleVideoEvents = () => {
    const video = videoRef.current;
    if (!video) return;

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
  }, []);

  // Controls functions
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
    
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(console.warn);
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

  // PiP event handlers
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

  // Retry function
  const handleRetry = () => {
    setError(null);
    if (channel.streamUrl) {
      initializePlayer(channel.streamUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <div className={`flex justify-between items-center p-4 bg-black bg-opacity-70 text-white z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <h3 className="text-xl font-bold">{channel.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-sm">{channel.isYoutube ? 'YOUTUBE' : 'LIVE'}</span>
            {isPiPMode && !channel.isYoutube && (
              <span className="text-blue-400 text-sm">• PiP Active</span>
            )}
            <span className="text-gray-400 text-sm">
              • {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isPiPSupported && !channel.isYoutube && (
            <button
              onClick={togglePiP}
              className="text-white hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              title="Picture-in-Picture (P)"
            >
              <Minimize className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div 
        className="flex-1 relative bg-black"
        onMouseMove={resetControlsTimeout}
        onMouseEnter={resetControlsTimeout}
      >
        {/* YouTube Content */}
        {channel.isYoutube && (
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl()}
              title={`${channel.name} YouTube Stream`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Regular HLS Content */}
        {!channel.isYoutube && (
          <>
            {/* Loading */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading {channel.name}...</p>
                  <p className="text-gray-400 text-sm mt-2">Connecting to stream...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                <div className="text-center bg-gray-800 p-8 rounded-lg border border-red-500 max-w-md mx-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-white text-xl mb-4">Playback Error</p>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <div className="space-y-3">
                    <button 
                      onClick={handleRetry}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                    <button 
                      onClick={handleClose}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
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
              className="w-full h-full object-contain"
              controls={false}
              playsInline
              onError={() => setError('Video playback error occurred')}
            />
          </>
        )}
      </div>

      {/* Bottom Controls - Only show for non-YouTube content */}
      {!channel.isYoutube && (
        <div className={`p-4 bg-black bg-opacity-70 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                disabled={isLoading || !!error}
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                disabled={isLoading || !!error}
                title="Mute/Unmute (M)"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-red-500"
                  disabled={isLoading || !!error}
                />
                <span className="text-white text-sm w-8">
                  {Math.round((isMuted ? 0 : volume) * 100)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isPiPSupported && (
                <button
                  onClick={togglePiP}
                  className={`hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10 ${isPiPMode ? 'text-blue-400' : 'text-white'}`}
                  disabled={isLoading || !!error}
                  title="Picture-in-Picture (P)"
                >
                  <Minimize className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                disabled={isLoading || !!error}
                title="Fullscreen (F)"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-gray-400 text-xs">
            Space: Play/Pause • M: Mute • F: Fullscreen • {isPiPSupported ? 'P: Picture-in-Picture • ' : ''}Esc: Exit
          </div>
        </div>
      )}

      {/* YouTube Controls Info */}
      {channel.isYoutube && (
        <div className={`p-4 bg-black bg-opacity-70 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center text-gray-400 text-sm">
            Use YouTube player controls for playback, volume, and fullscreen options
          </div>
        </div>
      )}
    </div>
  );
}