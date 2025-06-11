'use client';

import { useState } from 'react';
import { ChannelConfig, ViewMode } from './lib/types';
import { useTheme } from './hooks/useTheme';
import { THEME_CLASSES } from './lib/constants';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import ChannelGrid from './components/channel/ChannelGrid';
import VideoPlayer from './components/channel/VideoPlayer';
import ChannelsSchedule from './components/schedule/ChannelsSchedule';
import MahaaUSAPlaylist from './components/channel/MahaaUSAPlaylist';

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(null);
  const [selectedChannelForSchedule, setSelectedChannelForSchedule] = useState(0);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [selectedYouTubeVideoId, setSelectedYouTubeVideoId] = useState<string | null>(null);

  const theme = THEME_CLASSES[isDarkMode ? 'dark' : 'light'];

  const handlePlayChannel = (channel: ChannelConfig) => {
    if (channel.id === 'mahaa-usa') {
      // For Mahaa USA, show playlist selector instead of direct play
      setSelectedChannel(channel);
      setCurrentView('usa-playlist');
    } else {
      // For other channels, play directly
      setSelectedChannel(channel);
      setCurrentView('player');
    }
  };

  const handleScheduleView = (channelIndex: number) => {
    if (channelIndex === 3) { // Mahaa USA
      setSelectedChannelForSchedule(channelIndex);
      setCurrentView('usa-playlist');
    } else {
      setSelectedChannelForSchedule(channelIndex);
      setCurrentView('schedule');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedChannel(null);
    setSelectedYouTubeVideoId(null);
  };

  const handleClosePlayer = () => {
    setSelectedChannel(null);
    setSelectedYouTubeVideoId(null);
    setCurrentView('home');
    setIsPiPActive(false);
  };

  const handlePlayYouTubeVideo = (videoId: string) => {
    setSelectedYouTubeVideoId(videoId);
    setCurrentView('player');
  };

  // Create a modified channel for YouTube video playback
  const getModifiedUSAChannel = (): ChannelConfig | null => {
    if (!selectedChannel || selectedChannel.id !== 'mahaa-usa' || !selectedYouTubeVideoId) {
      return selectedChannel;
    }
    
    return {
      ...selectedChannel,
      youtubeVideoId: selectedYouTubeVideoId
    };
  };

  if (currentView === 'schedule') {
    return (
      <ChannelsSchedule 
        channelIndex={selectedChannelForSchedule} 
        onBack={handleBackToHome} 
      />
    );
  }

  if (currentView === 'usa-playlist') {
    return (
      <MahaaUSAPlaylist
        onBack={handleBackToHome}
        onPlayVideo={handlePlayYouTubeVideo}
      />
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${theme.body}`}>
      <Header 
        onScheduleClick={() => setCurrentView('schedule')} 
        isPiPActive={isPiPActive} 
      />

      <main className="flex-grow px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold ${theme.title} mb-4`}>
              Select Your Channel
            </h2>
            <p className={`${theme.subtitle} text-lg mb-4`}>
              Experience premium live streaming
            </p>
          </div>

          <ChannelGrid 
            onPlay={handlePlayChannel}
            onSchedule={handleScheduleView}
          />
        </div>
      </main>

      <Footer />

      {selectedChannel && currentView === 'player' && (
        <VideoPlayer
          channel={getModifiedUSAChannel()!}
          isOpen={currentView === 'player'}
          onClose={handleClosePlayer}
          onPiPChange={setIsPiPActive}
        />
      )}
    </div>
  );
}