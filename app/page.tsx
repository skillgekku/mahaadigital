'use client';

import { JSX, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Hls from "hls.js";
import ChannelsSchedule from "./ChannelsSchedule";

const streams: Record<string, string> = {
  stream1: "https://distro.legitpro.co.in/mahaanews/index.m3u8",
  stream2: "https://bhakti.mahaaone.com/hls/test.m3u8",
  stream3: "https://distro.legitpro.co.in/mahaamaxx/index.m3u8",
  stream4: "youtube", // Special identifier for YouTube content
};

// YouTube video ID extracted from the URL
const YOUTUBE_VIDEO_ID = "Izd-SLokbPY";

export default function Home(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPiPMode, setIsPiPMode] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'schedule'>('home');
  const [selectedChannelForSchedule, setSelectedChannelForSchedule] = useState(0);
  const [isYouTubeChannel, setIsYouTubeChannel] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Check PiP support and load theme preference on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsPiPSupported('pictureInPictureEnabled' in document);
      
      // Load theme preference from localStorage
      const savedTheme = localStorage.getItem('mahaa-tv-theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mahaa-tv-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Open schedule for specific channel
  const openSchedule = (channelIndex: number) => {
    setSelectedChannelForSchedule(channelIndex);
    setCurrentView('schedule');
  };

  // Return to home view
  const backToHome = () => {
    setCurrentView('home');
  };

  // Theme classes
  const themeClasses = {
    body: isDarkMode 
      ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" 
      : "bg-gradient-to-br from-gray-50 via-white to-gray-100",
    header: isDarkMode 
      ? "bg-gradient-to-r from-red-600 to-red-800" 
      : "bg-gradient-to-r from-red-500 to-red-700",
    card: isDarkMode 
      ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
      : "bg-white border-gray-200 hover:border-gray-300 shadow-lg",
    title: isDarkMode ? "text-white" : "text-gray-900",
    subtitle: isDarkMode ? "text-gray-300" : "text-gray-600",
    description: isDarkMode ? "text-gray-400" : "text-gray-500",
    footer: isDarkMode 
      ? "bg-black text-gray-400 border-gray-800" 
      : "bg-gray-900 text-gray-300 border-gray-700",
    pipCard: isDarkMode 
      ? "bg-gradient-to-r from-blue-600 to-blue-800" 
      : "bg-gradient-to-r from-blue-500 to-blue-700",
    errorCard: isDarkMode 
      ? "bg-gray-800 border-red-500" 
      : "bg-white border-red-400",
    errorText: isDarkMode ? "text-white" : "text-gray-900",
    errorSubtext: isDarkMode ? "text-gray-300" : "text-gray-600"
  };

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

  // Close player
  const closePlayer = () => {
    // Exit PiP if active
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(console.warn);
    }
    
    cleanup();
    setShowOverlay(false);
    setIsLoading(false);
    setError(null);
    setIsPlaying(false);
    setIsPiPMode(false);
    setIsYouTubeChannel(false);
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn);
    }
  };

  // Toggle Picture-in-Picture
  const togglePiP = async () => {
    if (isYouTubeChannel) {
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

  // Handle YouTube channel
  const openYouTubeChannel = (channelName: string) => {
    setSelectedChannel(channelName);
    setIsYouTubeChannel(true);
    setShowOverlay(true);
    setIsLoading(false);
    setError(null);
  };

  // Initialize HLS player
  const initializePlayer = (streamUrl: string) => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    // Clean up any existing instance
    cleanup();

    // Check HLS support
    if (Hls.isSupported()) {
      console.log('HLS.js is supported, initializing...');
      
      hlsRef.current = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
      });

      hlsRef.current.loadSource(streamUrl);
      hlsRef.current.attachMedia(video);

      // HLS events
      hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('Media attached');
      });

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Manifest parsed, starting playback');
        setIsLoading(false);
        video.play().catch(err => {
          console.error('Play failed:', err);
          setError('Failed to start playback. Please try again.');
          setIsLoading(false);
        });
      });

      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
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

  // Open player
  const openPlayer = (streamKey: string, channelName: string) => {
    console.log('Opening player for:', channelName, streams[streamKey]);
    
    if (streams[streamKey] === "youtube") {
      openYouTubeChannel(channelName);
      return;
    }
    
    setSelectedChannel(channelName);
    setIsYouTubeChannel(false);
    setShowOverlay(true);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      initializePlayer(streams[streamKey]);
    }, 100);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isYouTubeChannel) return; // YouTube controls handled by YouTube player
    
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

  // Toggle mute
  const toggleMute = () => {
    if (isYouTubeChannel) return; // YouTube controls handled by YouTube player
    
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isYouTubeChannel) return; // YouTube controls handled by YouTube player
    
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Enter fullscreen
  const enterFullscreen = () => {
    if (isYouTubeChannel) {
      // For YouTube, we can't control fullscreen directly
      setError('Use YouTube player controls for fullscreen');
      return;
    }
    
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen().catch(console.warn);
    } else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) {
      (video as any).msRequestFullscreen();
    }
  };

  // PiP event handlers
  useEffect(() => {
    if (isYouTubeChannel) return; // Skip PiP events for YouTube
    
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiPMode(true);
      setShowOverlay(false);
    };

    const handleLeavePiP = () => {
      setIsPiPMode(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [isYouTubeChannel]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && showOverlay && !isPiPMode && !isYouTubeChannel) {
        closePlayer();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showOverlay && !isPiPMode) return;
      if (isYouTubeChannel) return; // Let YouTube handle keyboard shortcuts
      
      switch (e.key) {
        case 'Escape':
          if (!document.pictureInPictureElement) {
            closePlayer();
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
        case 'p':
        case 'P':
          if (isPiPSupported) {
            togglePiP();
          }
          break;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showOverlay, isPiPMode, isPiPSupported, isYouTubeChannel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // If schedule view is active, show the schedule component
  if (currentView === 'schedule') {
    return (
      <div className={`min-h-screen ${themeClasses.body} p-6`}>
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              {['Mahaa News', 'Mahaa Bhakti', 'Mahaa Max', 'Mahaa USA'][selectedChannelForSchedule]} Schedule
            </h1>
            <button
              onClick={backToHome}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Channels</span>
            </button>
          </div>
          <div className="text-gray-300 mb-4">
            Program schedule for {['Mahaa News', 'Mahaa Bhakti', 'Mahaa Max', 'Mahaa USA'][selectedChannelForSchedule]}
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400">
            <p className="mb-2">📺 Schedule Component Placeholder</p>
            <p className="text-sm">
              <ChannelsSchedule channelIndex={selectedChannelForSchedule} onBack={backToHome} />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${themeClasses.body}`}>
      {/* Header */}
      <nav className={`${themeClasses.header} text-white py-6 px-8 shadow-2xl`}>
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide">Mahaa LIVE TV</h1>
          <div className="flex items-center space-x-4">
            {/* Schedule Button */}
            <button
              onClick={() => setCurrentView('schedule')}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              title="View All Schedules"
            >
              <span>📅</span>
              <span className="hidden sm:inline">Schedules</span>
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {isPiPMode && !isYouTubeChannel && (
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

      {/* Main Content */}
      <main className="flex-grow px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold ${themeClasses.title} mb-4`}>Select Your Channel</h2>
            <p className={`${themeClasses.subtitle} text-lg mb-4`}>Experience premium live streaming</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: "Mahaa News", 
                description: "24×7 News Channel",
                buttonColor: "bg-blue-600 hover:bg-blue-700",
                icon: "📺"
              },
              { 
                name: "Mahaa Bhakti", 
                description: "24×7 Devotional",
                buttonColor: "bg-red-600 hover:bg-red-700",
                icon: "🙏"
              },
              { 
                name: "Mahaa Max", 
                description: "Unlimited Entertainment",
                buttonColor: "bg-purple-600 hover:bg-purple-700",
                icon: "🎬"
              },
              { 
                name: "Mahaa USA", 
                description: "US Telugu Content",
                buttonColor: "bg-green-600 hover:bg-green-700",
                icon: "🇺🇸"
              },
            ].map((channel, idx) => (
              <div
                key={channel.name}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`${themeClasses.card} rounded-xl overflow-hidden shadow-xl border`}>
                  <div className="relative">
                    <div onClick={() => openPlayer(`stream${idx + 1}`, channel.name)}>
                      <Image
                        src={
                          idx === 3 
                            ? "https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/MAHAA%20USA%20PNG.png"
                            : `https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/${["news", "baks", "max"][idx]}.png`
                        }
                        alt={channel.name}
                        width={300}
                        height={150}
                        className={`w-full h-56 group-hover:scale-110 transition-transform duration-500 ${
                          idx === 3 ? 'object-contain bg-white' : 'object-cover'
                        }`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="absolute top-4 right-4 text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center">{channel.icon}</div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-medium">
                      {idx === 3 ? 'YOUTUBE' : 'LIVE'}
                    </div>
                    {/* Hover overlay with buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                      <button
                        onClick={() => openPlayer(`stream${idx + 1}`, channel.name)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <span>▶</span>
                      </button>
                      <button
                        onClick={() => openSchedule(idx)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <span>📅</span>
                        <span>Schedule</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold ${themeClasses.title} mb-2`}>{channel.name}</h3>
                    <p className={`${themeClasses.description} mb-4`}>{channel.description}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openPlayer(`stream${idx + 1}`, channel.name)}
                        className={`flex-1 ${channel.buttonColor} text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}
                      >
                        {idx === 3 ? 'Watch Now' : 'Watch Now'}
                      </button>
                      <button
                        onClick={() => openSchedule(idx)}
                        className={`px-4 py-3 rounded-lg transition-colors border-2 font-semibold ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        📅
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PiP Status Card */}
          {isPiPMode && !isYouTubeChannel && (
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Picture-in-Picture Active</h3>
                  <p className="text-blue-100">"{selectedChannel}" is playing in mini player</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowOverlay(true)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                  >
                    Show Player
                  </button>
                  <button
                    onClick={closePlayer}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`${themeClasses.footer} text-center py-6 border-t`}>
        <div className="container mx-auto">
          <p>&copy; 2025 Mahaa Digital. All rights reserved.</p>
          <p className="text-sm mt-2">Premium streaming experience</p>
        </div>
      </footer>

      {/* Video Player Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-70 text-white z-10">
            <div>
              <h3 className="text-xl font-bold">{selectedChannel}</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm">{isYouTubeChannel ? 'YOUTUBE' : 'LIVE'}</span>
                {isPiPMode && !isYouTubeChannel && (
                  <span className="text-blue-400 text-sm">• PiP Active</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isPiPSupported && !isYouTubeChannel && (
                <button
                  onClick={togglePiP}
                  className="text-white hover:text-blue-400 transition-colors text-xl"
                  title="Picture-in-Picture"
                >
                  📱
                </button>
              )}
              <button
                onClick={closePlayer}
                className="text-white hover:text-red-400 transition-colors text-2xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative bg-black">
            {/* YouTube Content */}
            {isYouTubeChannel && (
              <div className="w-full h-full flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
                  title="Mahaa USA YouTube Stream"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}

            {/* Regular HLS Content */}
            {!isYouTubeChannel && (
              <>
                {/* Loading */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                      <p className="text-white text-lg">Loading {selectedChannel}...</p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className={`text-center ${themeClasses.errorCard} p-8 rounded-lg border max-w-md mx-4`}>
                      <div className="text-red-500 text-6xl mb-4">⚠️</div>
                      <p className={`${themeClasses.errorText} text-xl mb-4`}>Playback Error</p>
                      <p className={`${themeClasses.errorSubtext} mb-6`}>{error}</p>
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            setError(null);
                            initializePlayer(streams[`stream${selectedChannel.includes('News') ? '1' : selectedChannel.includes('Bhakti') ? '2' : selectedChannel.includes('Max') ? '3' : '4'}`]);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                        <button 
                          onClick={closePlayer}
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
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onVolumeChange={(e) => {
                    const video = e.currentTarget;
                    setVolume(video.volume);
                    setIsMuted(video.muted);
                  }}
                  onError={() => setError('Video playback error occurred')}
                />
              </>
            )}
          </div>

          {/* Bottom Controls - Only show for non-YouTube content */}
          {!isYouTubeChannel && (
            <div className="p-4 bg-black bg-opacity-70 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-red-400 transition-colors text-2xl"
                    disabled={isLoading || !!error}
                  >
                    {isPlaying ? "⏸️" : "▶️"}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-red-400 transition-colors text-xl"
                    disabled={isLoading || !!error}
                  >
                    {isMuted ? "🔇" : "🔊"}
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
                      className={`hover:text-blue-400 transition-colors text-xl ${isPiPMode ? 'text-blue-400' : 'text-white'}`}
                      disabled={isLoading || !!error}
                      title="Picture-in-Picture (P)"
                    >
                      📱
                    </button>
                  )}
                  <button
                    onClick={enterFullscreen}
                    className="text-white hover:text-red-400 transition-colors text-xl"
                    disabled={isLoading || !!error}
                  >
                    ⛶
                  </button>
                </div>
              </div>
              
              <div className="mt-2 text-gray-400 text-xs">
                Space: Play/Pause • M: Mute • {isPiPSupported ? 'P: Picture-in-Picture • ' : ''}Esc: Exit
              </div>
            </div>
          )}

          {/* YouTube Controls Info */}
          {isYouTubeChannel && (
            <div className="p-4 bg-black bg-opacity-70 text-white">
              <div className="text-center text-gray-400 text-sm">
                Use YouTube player controls for playback, volume, and fullscreen options
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden video element for PiP mode */}
      {isPiPMode && !showOverlay && !isYouTubeChannel && (
        <video
          ref={videoRef}
          className="hidden"
          controls={false}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(e) => {
            const video = e.currentTarget;
            setVolume(video.volume);
            setIsMuted(video.muted);
          }}
          onError={() => setError('Video playback error occurred')}
        />
      )}
    </div>
  );
}