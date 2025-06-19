import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { Clock, Calendar, Play, Star, ArrowLeft, Youtube } from 'lucide-react';
import { CHANNELS, MAHAA_USA_PLAYLIST, REGULAR_SCHEDULE_DATA } from '@/app/lib/constants';
import type { Program, ScheduleDay, ChannelConfig as ImportedChannelConfig, YouTubeVideo } from '@/app/lib/types';
import { ProgramItem } from './ProgramItem'; // Import ProgramItem

interface ChannelsScheduleProps {
  channelIndex?: number;
  onBack?: () => void;
  onPlayVideo?: (videoId: string) => void;
}

export default function ChannelsSchedule({ channelIndex = 0, onBack, onPlayVideo }: ChannelsScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Channel configurations
  // Use ImportedChannelConfig and CHANNELS from constants
const channels: ImportedChannelConfig[] = CHANNELS.map(channel => ({
  ...channel, // Spread properties from CHANNELS constant
  // Ensure all properties of ImportedChannelConfig are met.
  // If CHANNELS items don't have all properties, provide defaults or map them.
  // For this example, we assume CHANNELS items mostly match ImportedChannelConfig.
  // The main difference was 'name' vs 'id', 'description', etc. which are now in types.ts
  // and CHANNELS constant aligns with types.ts ChannelConfig
}));

  // Helper function to find the current program
const findCurrentProgramInList = (programsList: Program[] | undefined, currentTimeString: string): Program | null => {
  if (!programsList) return null;
  for (let i = 0; i < programsList.length; i++) {
    const program = programsList[i];
    const nextProgram = programsList[i + 1];
    if (!nextProgram) {
      if (currentTimeString >= program.time) return program;
    } else {
      if (currentTimeString >= program.time && currentTimeString < nextProgram.time) {
        return program;
      }
    }
  }
  return null;
};

  // Convert YouTube playlist to schedule format for Mahaa USA
  const getYouTubeSchedule = (): ScheduleDay[] => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const todayPrograms: Program[] = MAHAA_USA_PLAYLIST.map(video => ({
      time: video.scheduledTime || '00:00',
      title: video.title,
      genre: video.category,
      duration: video.duration,
      rating: 4.5, // Default rating
      isLive: false
    })).sort((a, b) => a.time.localeCompare(b.time));

    const tomorrowPrograms: Program[] = MAHAA_USA_PLAYLIST.map(video => ({
      time: video.scheduledTime || '00:00',
      title: `${video.title} (Repeat)`,
      genre: video.category,
      duration: video.duration,
      rating: 4.5,
      isLive: false
    })).sort((a, b) => a.time.localeCompare(b.time));

    return [
      {
        day: 'Today',
        date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        programs: todayPrograms
      },
      {
        day: 'Tomorrow',
        date: tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        programs: tomorrowPrograms
      }
    ];
  };

  // Get the appropriate schedule based on channel
  const getCurrentSchedule = (): ScheduleDay[] => {
    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const tomorrowDate = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (channelIndex === 3) { // Mahaa USA
      return getYouTubeSchedule();
    }
    
    // Use REGULAR_SCHEDULE_DATA and map dates dynamically
    const channelScheduleData = REGULAR_SCHEDULE_DATA[channelIndex]; // Make sure channelIndex is valid
    if (!channelScheduleData) { // Basic safety check
        // Return a default schedule structure or handle error
        // For now, returning an empty array for today and tomorrow
        return [
            { day: 'Today', date: todayDate, programs: [] },
            { day: 'Tomorrow', date: tomorrowDate, programs: [] }
        ];
    }
    return channelScheduleData.map(daySchedule => ({
      ...daySchedule,
      date: daySchedule.day === 'Today' ? todayDate : tomorrowDate,
    }));
  };

  const currentSchedule = useMemo(() => {
    return getCurrentSchedule();
  }, [channelIndex, currentTime]); // currentTime dependency to refresh dates if app runs past midnight

  const currentTimeStr = useMemo(() => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  }, [currentTime]);

  const actualCurrentProgram = useMemo(() => {
    if (selectedDay !== 0) return null;
    const todaySchedule = currentSchedule[0];
    if (!todaySchedule || !todaySchedule.programs) return null;
    
    return findCurrentProgramInList(todaySchedule.programs, currentTimeStr);
  }, [selectedDay, currentSchedule, currentTimeStr]);

  const isCurrentProgram = (program: Program): boolean => {
    if (selectedDay !== 0 || !actualCurrentProgram) return false;
    return actualCurrentProgram.time === program.time && actualCurrentProgram.title === program.title;
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      // News Channel Colors
      'Breaking News': 'bg-red-600',
      'News': 'bg-red-500',
      'Politics': 'bg-blue-600',
      'Business': 'bg-green-600',
      'Live Event': 'bg-purple-600',
      'Regional': 'bg-orange-500',
      'Investigation': 'bg-gray-600',
      'Crime': 'bg-red-700',
      'Health': 'bg-green-500',
      'Education': 'bg-blue-500',
      'Sports': 'bg-orange-600',
      'Debate': 'bg-purple-500',
      'Analysis': 'bg-indigo-500',
      'Review': 'bg-teal-500',
      'Documentary': 'bg-yellow-600',
      'Interview': 'bg-pink-500',
      'International': 'bg-cyan-600',
      'Technology': 'bg-gray-500',
      
      // Bhakti Channel Colors
      'Prayer': 'bg-orange-600',
      'Devotional Music': 'bg-orange-500',
      'Discourse': 'bg-yellow-600',
      'Live Darshan': 'bg-red-600',
      'Chanting': 'bg-purple-600',
      'Stories': 'bg-blue-500',
      'Movie': 'bg-red-500',
      'Aarti': 'bg-orange-700',
      'Biography': 'bg-green-600',
      'Kirtan': 'bg-purple-500',
      'Talk Show': 'bg-blue-600',
      'Music': 'bg-violet-500',
      'Meditation': 'bg-indigo-600',
      'Special': 'bg-pink-600',
      'Festival': 'bg-red-500',
      'Scripture': 'bg-yellow-500',
      'Yoga': 'bg-green-500',
      
      // Max Channel Colors
      'Comedy': 'bg-lime-500',
      'Reality TV': 'bg-pink-500',
      'Action Movie': 'bg-red-600',
      'Dance': 'bg-purple-500',
      'Romance Movie': 'bg-rose-500',
      'Game Show': 'bg-blue-500',
      'Drama Series': 'bg-indigo-600',
      'Thriller Movie': 'bg-gray-700',
      'Family Movie': 'bg-teal-500',
      'Children': 'bg-cyan-500',
      'Competition': 'bg-orange-500',
      'Music Show': 'bg-violet-600',
      
      // USA Channel Colors (YouTube Categories)
      'Conference': 'bg-blue-600',
      'Youth Event': 'bg-green-600',
      'Political': 'bg-red-600',
      'Awards': 'bg-yellow-600',
      'Entertainment': 'bg-purple-600',
      'Pageant': 'bg-pink-600',
      'Cultural': 'bg-teal-500',
      'Lifestyle': 'bg-purple-500',
      'Educational': 'bg-indigo-500',
      'Variety': 'bg-pink-500',
      'Cooking': 'bg-orange-600',
      'Family': 'bg-teal-500',
      'Travel': 'bg-emerald-500'
    };
    return colors[genre] || 'bg-gray-500';
  };

  // Handle YouTube video play
  const handlePlayYouTubeVideo = (program: Program) => {
    if (channelIndex === 3 && onPlayVideo) { // Mahaa USA
      // Find the corresponding YouTube video
      const video = MAHAA_USA_PLAYLIST.find(v => v.title === program.title.replace(' (Repeat)', ''));
      if (video) {
        onPlayVideo(video.youtubeId);
      }
    }
  };

  const currentChannel = channels[channelIndex];
  // Ensure currentSchedule is updated when selectedDay or channelIndex changes,
  // as getCurrentSchedule now dynamically calculates dates.
  // const currentChannel = channels[channelIndex]; // Removed duplicate
  // currentSchedule is now memoized

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentChannel?.bgGradient} rounded-xl p-6 mb-8 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl">
              {currentChannel?.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentChannel?.name}</h1>
              <p className="text-gray-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{currentChannel?.description} - Program Schedule</span>
                {currentChannel?.isYoutube && (
                  <>
                    <Youtube className="w-4 h-4" />
                    <span>YouTube Playlist</span>
                  </>
                )}
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

      {/* Day Selector */}
      <div className="flex space-x-4 mb-6">
        {currentSchedule.map((day, dayIndex) => (
          <button
            key={dayIndex}
            onClick={() => setSelectedDay(dayIndex)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
  selectedDay === dayIndex
    ? `bg-gradient-to-r ${currentChannel?.bgGradient} text-white shadow-lg`
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}`}
          >
            <div className="text-lg">{day.day}</div>
            <div className="text-sm opacity-75">{day.date}</div>
          </button>
        ))}
      </div>

      {/* Current Program Highlight */}
      {selectedDay === 0 && actualCurrentProgram && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-500 font-semibold">
                  {currentChannel?.isYoutube ? 'NOW STREAMING' : 'NOW PLAYING'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {actualCurrentProgram.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-400">
                    {actualCurrentProgram.time}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs text-white ${getGenreColor(actualCurrentProgram.genre || '')}`}>
                    {actualCurrentProgram.genre}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-400">
                      {actualCurrentProgram.rating}
                    </span>
                  </div>
                  {currentChannel?.isYoutube && (
                    <div className="flex items-center space-x-1">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-400">YouTube</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                if (currentChannel?.isYoutube && actualCurrentProgram) {
                  handlePlayYouTubeVideo(actualCurrentProgram);
                }
              }}
              className={`bg-gradient-to-r ${currentChannel?.bgGradient} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all`}
            >
              <Play className="w-4 h-4" />
              <span>{currentChannel?.isYoutube ? 'Stream' : 'Watch'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Program Schedule Grid */}
      {currentSchedule[selectedDay] && currentSchedule[selectedDay].programs && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6" />
            <span>{currentSchedule[selectedDay].day}&apos;s Schedule</span>
            {currentChannel?.isYoutube && (
              <div className="flex items-center space-x-2 ml-4">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-400">YouTube Playlist</span>
              </div>
            )}
          </h2>

          <div className="space-y-3">
            {currentSchedule[selectedDay].programs.map((program, index) => (
              <ProgramItem
                key={index}
                program={program}
                isCurrent={isCurrentProgram(program)}
                channel={currentChannel} // currentChannel might be null if channels array is empty or channelIndex is out of bounds
                getGenreColor={getGenreColor}
                onPlayYouTubeVideo={handlePlayYouTubeVideo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          &copy; 2025 Mahaa Digital. All times are in Eastern Time (ET).
          {currentChannel?.isYoutube && (
            <span className="ml-2">• YouTube content available on-demand</span>
          )}
        </p>
      </div>
    </div>
  );
}