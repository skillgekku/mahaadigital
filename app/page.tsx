'use client';

import { JSX, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Hls from "hls.js";

const streams: Record<string, string> = {
  stream1: "https://news.mahaaone.com/hls/test.m3u8",
  stream2: "https://bhakti.mahaaone.com/hls/test.m3u8",
  stream3: "https://max.mahaaone.com/hls/test.m3u8",
};
// Folder Structure
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Check PiP support on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsPiPSupported('pictureInPictureEnabled' in document);
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
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn);
    }
  };

  // Toggle Picture-in-Picture
  const togglePiP = async () => {
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
    setSelectedChannel(channelName);
    setShowOverlay(true);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      initializePlayer(streams[streamKey]);
    }, 100);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
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
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Enter fullscreen
  const enterFullscreen = () => {
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
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiPMode(true);
      setShowOverlay(false); // Hide the overlay when entering PiP
    };

    const handleLeavePiP = () => {
      setIsPiPMode(false);
      // Don't automatically show overlay when leaving PiP
      // User can manually open it again if needed
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && showOverlay && !isPiPMode) {
        closePlayer();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showOverlay && !isPiPMode) return;
      
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
  }, [showOverlay, isPiPMode, isPiPSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <nav className="bg-gradient-to-r from-red-600 to-red-800 text-white py-6 px-8 shadow-2xl">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide">Mahaa LIVE TV</h1>
          <div className="flex items-center space-x-4">
            {isPiPMode && (
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
            <h2 className="text-4xl font-bold text-white mb-4">Select Your Channel</h2>
            <p className="text-gray-300 text-lg">Experience premium live streaming</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: "Mahaa News", 
                description: "24×7 News Channel",
                color: "from-blue-600 to-blue-800",
                icon: "📺"
              },
              { 
                name: "Mahaa Bhakti", 
                description: "24×7 Devotional",
                color: "from-orange-600 to-orange-800",
                icon: "🙏"
              },
              { 
                name: "Mahaa Max", 
                description: "Unlimited Entertainment",
                color: "from-purple-600 to-purple-800",
                icon: "🎬"
              },
            ].map((channel, idx) => (
              <div
                key={channel.name}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => openPlayer(`stream${idx + 1}`, channel.name)}
              >
                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:border-gray-600">
                  <div className="relative">
                    <Image
                      src={`https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/${["news", "baks", "max"][idx]}.png`}
                      alt={channel.name}
                      width={300}
                      height={150}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${channel.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                    <div className="absolute top-4 right-4 text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center">{channel.icon}</div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                      LIVE
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{channel.name}</h3>
                    <p className="text-gray-400 mb-4">{channel.description}</p>
                    <button className={`w-full bg-gradient-to-r ${channel.color} text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}>
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PiP Status Card */}
          {isPiPMode && (
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
      <footer className="bg-black text-gray-400 text-center py-6 border-t border-gray-800">
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
                <span className="text-red-400 text-sm">LIVE</span>
                {isPiPMode && (
                  <span className="text-blue-400 text-sm">• PiP Active</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isPiPSupported && (
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
                <div className="text-center bg-gray-800 p-8 rounded-lg border border-red-500 max-w-md mx-4">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-white text-xl mb-4">Playback Error</p>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setError(null);
                        initializePlayer(streams[`stream${selectedChannel.includes('News') ? '1' : selectedChannel.includes('Bhakti') ? '2' : '3'}`]);
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
          </div>

          {/* Bottom Controls */}
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
        </div>
      )}

      {/* Hidden video element for PiP mode */}
      {isPiPMode && !showOverlay && (
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