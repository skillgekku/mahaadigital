'use client';

import { JSX, useEffect } from "react";
import Image from "next/image";
import Hls from "hls.js";

const streams: Record<string, string> = {
  stream1: "http://tv.mahaadigital.com:8080/hls/test.m3u8",
  stream2: "http://tv.mahaadigital.com:8081/hls/test.m3u8",
  stream3: "http://tv.mahaadigital.com:8082/hls/test.m3u8",
};

export default function Home(): JSX.Element {
  useEffect(() => {
    const handleFullScreenExit = () => {
      const overlay = document.getElementById("overlay") as HTMLElement;
      const video = document.getElementById("fullscreenVideo") as HTMLVideoElement;
      if (
        !document.fullscreenElement &&
        !document.fullscreenElement &&
        !document.fullscreenElement &&
        !document.fullscreenElement
      ) {
        overlay.style.display = "none";
        video.pause();
        if ((window as any).hlsInstance) {
          (window as any).hlsInstance.destroy();
          (window as any).hlsInstance = null;
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenExit);
    document.addEventListener("webkitfullscreenchange", handleFullScreenExit);
    document.addEventListener("mozfullscreenchange", handleFullScreenExit);
    document.addEventListener("MSFullscreenChange", handleFullScreenExit);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenExit);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenExit);
      document.removeEventListener("mozfullscreenchange", handleFullScreenExit);
      document.removeEventListener("MSFullscreenChange", handleFullScreenExit);
    };
  }, []);

  const openFullScreenPlayer = (streamKey: string): void => {
    const overlay = document.getElementById("overlay") as HTMLElement;
    const video = document.getElementById("fullscreenVideo") as HTMLVideoElement;
    const sourceUrl = streams[streamKey];

    overlay.style.display = "block";

    if ((window as any).hlsInstance) {
      (window as any).hlsInstance.destroy();
      (window as any).hlsInstance = null;
    }

    if (Hls.isSupported()) {
      (window as any).hlsInstance = new Hls();
      (window as any).hlsInstance.loadSource(sourceUrl);
      (window as any).hlsInstance.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else {
      alert("Your browser does not support HLS playback.");
      overlay.style.display = "none";
      return;
    }

    requestVideoFullscreen(video);
    video.play();
  };

  const requestVideoFullscreen = (videoElement: HTMLVideoElement): void => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if ((videoElement as any).webkitRequestFullscreen) {
      (videoElement as any).webkitRequestFullscreen();
    } else if ((videoElement as any).msRequestFullscreen) {
      (videoElement as any).msRequestFullscreen();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-black text-white py-4 px-8 text-xl font-bold">
        Mahaa Streaming
      </nav>

      <main className="flex-grow px-4 py-10">
        <h1 className="text-center text-3xl font-semibold">Select Channel</h1>
        <p className="text-center text-gray-600 mb-8">Watch in fullscreen</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {["Mahaa News", "Mahaa Bhakti", "Mahaa Max"].map((channel, idx) => (
            <div
              key={channel}
              className="cursor-pointer border shadow-lg w-72"
              onClick={() => openFullScreenPlayer(`stream${idx + 1}`)}
            >
              <Image
                src={`https://raw.githubusercontent.com/skillgekku/media-assets/refs/heads/main/${["news", "baks", "max"][idx]}.png`}
                alt={channel}
                width={288}
                height={192}
                className="w-full h-48 object-cover"
              />
              <div className="text-center py-4 font-medium text-lg">
                {channel}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-black text-white text-center py-4">
        &copy; 2025 My TV Streaming. All rights reserved.
      </footer>

      <div
        id="overlay"
        className="fixed inset-0 bg-black z-50 hidden flex items-center justify-center"
      >
        <video id="fullscreenVideo" controls className="w-full h-full object-cover" />
      </div>
    </div>
  );
}