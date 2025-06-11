'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChannelsSchedule from './ChannelsSchedule';
import { CHANNELS } from '@/app/lib/constants';

export default function SchedulePage() {
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Channel Selector */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Channel Schedules</h1>
            <button
              onClick={handleBackToHome}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>
          
          <div className="flex space-x-4">
            {CHANNELS.map((channel, index) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannelIndex(index)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedChannelIndex === index
                    ? `bg-gradient-to-r ${channel.bgGradient} text-white shadow-lg`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{channel.icon}</span>
                  <span>{channel.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChannelsSchedule 
        channelIndex={selectedChannelIndex} 
        onBack={handleBackToHome} 
      />
    </div>
  );
}