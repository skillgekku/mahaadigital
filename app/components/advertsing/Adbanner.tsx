'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface GradientColors {
  from: string;
  to: string;
}

interface AdFace {
  title: string;
  subtitle: string;
  image: string;
}

interface RotatingCubeProps {
  images: string[];
  interval?: number;
  cubeId: string;
  gradientColors: GradientColors;
}

interface RotatingCubeAdBannerProps {
  className?: string;
}

const RotatingCube: React.FC<RotatingCubeProps> = ({ 
  images, 
  interval = 3000, 
  cubeId, 
  gradientColors 
}) => {
  const [currentFace, setCurrentFace] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => {
        setCurrentFace((prev) => (prev + 1) % 6);
        setIsRotating(false);
      }, 600);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  const faces: AdFace[] = [
    { title: "Premium Ad", subtitle: "Your Brand Here", image: images[0] || "" },
    { title: "Featured", subtitle: "Special Offer", image: images[1] || "" },
    { title: "Sponsored", subtitle: "Partner Content", image: images[2] || "" },
    { title: "Trending", subtitle: "Hot Deal", image: images[3] || "" },
    { title: "Exclusive", subtitle: "Limited Time", image: images[4] || "" },
    { title: "Popular", subtitle: "Best Seller", image: images[5] || "" }
  ];

  const currentFaceData: AdFace = faces[currentFace];

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
      <div className="relative w-full h-32 bg-black">
        {/* TV Frame Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-lg">
          <div className="absolute inset-2 bg-black rounded-lg overflow-hidden">
            {/* Screen Content */}
            <div 
              className={`relative w-full h-full transition-transform duration-600 ease-in-out ${
                isRotating ? 'animate-pulse' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})`
              }}
            >
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-b from-transparent via-black to-transparent opacity-10 animate-pulse"></div>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={`scanline-${cubeId}-${i}`}
                    className="absolute w-full h-px bg-white opacity-5"
                    style={{ top: `${(i + 1) * 5}%` }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                <div className="text-center">
                  <div className="text-white font-bold text-xs mb-1 animate-pulse">
                    {currentFaceData.title}
                  </div>
                  <div className="text-white text-xs opacity-90">
                    {currentFaceData.subtitle}
                  </div>
                </div>

                {/* Dynamic Image */}
                <div className="flex-1 flex items-center justify-center my-2">
                  <div className="relative w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center overflow-hidden">
                    {currentFaceData.image && !imageErrors[currentFace] ? (
                      <Image
                        src={currentFaceData.image}
                        alt={currentFaceData.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => handleImageError(currentFace)}
                        priority={false}
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-white text-xs">
                        <span role="img" aria-label="TV">📺</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom indicator */}
                <div className="flex justify-center space-x-1">
                  {faces.map((_, index) => (
                    <div
                      key={`indicator-${cubeId}-${index}`}
                      className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                        index === currentFace ? 'bg-white' : 'bg-white bg-opacity-30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Screen Glare Effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent opacity-10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* TV Controls */}
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-col space-y-1">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const RotatingCubeAdBanner: React.FC<RotatingCubeAdBannerProps> = ({ 
  className = "" 
}) => {
  // Sample images - replace with your actual image URLs
  const adImages1: string[] = [
    "https://picsum.photos/100/100?random=1",
    "https://picsum.photos/100/100?random=2",
    "https://picsum.photos/100/100?random=3",
    "https://picsum.photos/100/100?random=4",
    "https://picsum.photos/100/100?random=5",
    "https://picsum.photos/100/100?random=6"
  ];

  const adImages2: string[] = [
    "https://picsum.photos/100/100?random=7",
    "https://picsum.photos/100/100?random=8",
    "https://picsum.photos/100/100?random=9",
    "https://picsum.photos/100/100?random=10",
    "https://picsum.photos/100/100?random=11",
    "https://picsum.photos/100/100?random=12"
  ];

  const adImages3: string[] = [
    "https://picsum.photos/100/100?random=13",
    "https://picsum.photos/100/100?random=14",
    "https://picsum.photos/100/100?random=15",
    "https://picsum.photos/100/100?random=16",
    "https://picsum.photos/100/100?random=17",
    "https://picsum.photos/100/100?random=18"
  ];

  const gradientConfigs: GradientColors[] = [
    { from: '#2563eb', to: '#7c3aed' },
    { from: '#059669', to: '#0d9488' },
    { from: '#dc2626', to: '#ec4899' }
  ];

  return (
    <div className={`hidden lg:flex lg:w-48 xl:w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 ${className}`}>
      <div className="w-full p-4 flex flex-col space-y-4">
        {/* Rotating Cube TV 1 */}
        <RotatingCube 
          images={adImages1}
          interval={3000}
          cubeId="cube1"
          gradientColors={gradientConfigs[0]}
        />
        
        {/* Rotating Cube TV 2 */}
        <RotatingCube 
          images={adImages2}
          interval={4000}
          cubeId="cube2"
          gradientColors={gradientConfigs[1]}
        />
        
        {/* Rotating Cube TV 3 */}
        <RotatingCube 
          images={adImages3}
          interval={3500}
          cubeId="cube3"
          gradientColors={gradientConfigs[2]}
        />

        {/* Channel Info */}
        <div className="text-center text-gray-400 text-xs mt-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>LIVE AD CHANNEL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingCubeAdBanner;