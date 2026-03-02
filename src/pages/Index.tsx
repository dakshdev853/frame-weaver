import React, { useState, useRef, useCallback } from 'react';
import ViewerToolbar from '@/components/ViewerToolbar';
import MediaGallery from '@/components/MediaGallery';
import ViewerCanvas from '@/components/ViewerCanvas';
import ViewerTimeline from '@/components/ViewerTimeline';

interface MediaFile {
  name: string;
  url: string;
  type: 'image' | 'video';
  file: File;
}

const getBasename = (name: string) => name.split(/[\\/]/).pop() || name;

const Index = () => {
  const [mode, setMode] = useState<'idle' | 'image' | 'video'>('idle');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exposure, setExposure] = useState(0);
  const [fps, setFps] = useState(24);
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = useRef(0);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((inputFiles: File[]) => {
    if (inputFiles.length === 0) return;

    const imageExts = /\.(jpg|jpeg|png|webp|gif|bmp|tiff|exr|hdr)$/i;
    const videoExts = /\.(mov|mp4|avi|mkv|webm)$/i;

    const imageFiles = inputFiles.filter((f) => imageExts.test(f.name));
    const videoFiles = inputFiles.filter((f) => videoExts.test(f.name));

    if (imageFiles.length > 0) {
      // Sort numerically
      const sorted = [...imageFiles].sort((a, b) => {
        const numA = parseInt(getBasename(a.name).match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(getBasename(b.name).match(/\d+/)?.[0] || '0', 10);
        return numA - numB || a.name.localeCompare(b.name);
      });

      const mediaFiles: MediaFile[] = sorted.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: 'image' as const,
        file: f,
      }));

      setFiles(mediaFiles);
      setMode('image');
      setCurrentFrame(0);
      setIsPlaying(false);
    } else if (videoFiles.length === 1) {
      const f = videoFiles[0];
      setFiles([
        {
          name: f.name,
          url: URL.createObjectURL(f),
          type: 'video',
          file: f,
        },
      ]);
      setMode('video');
      setCurrentFrame(0);
      setIsPlaying(false);
    }
  }, []);

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    processFiles(selected);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const togglePlay = () => {
    if (files.length <= 1) return;

    if (isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playIntervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % files.length);
      }, 1000 / fps);
    }
  };

  const stop = () => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    playIntervalRef.current = null;
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const handleScrub = (idx: number) => {
    setCurrentFrame(idx);
    if (isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      playIntervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % files.length);
      }, 1000 / fps);
    }
  };

  const resetCamera = () => {
    setExposure(0);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileInput}
      />

      <ViewerToolbar
        mode={mode}
        isPlaying={isPlaying}
        fps={fps}
        exposure={exposure}
        onOpen={handleOpen}
        onTogglePlay={togglePlay}
        onStop={stop}
        onFpsChange={setFps}
        onExposureChange={setExposure}
        onResetView={resetCamera}
      />

      <div className="flex flex-1 overflow-hidden">
        {mode === 'image' && files.length > 0 && (
          <MediaGallery
            files={files}
            currentIndex={currentFrame}
            onSelect={handleScrub}
          />
        )}

        <ViewerCanvas
          mode={mode}
          currentImageUrl={files[currentFrame]?.url || null}
          videoUrl={mode === 'video' ? files[0]?.url || null : null}
          onOpen={handleOpen}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isDragging={isDragging}
        />
      </div>

      {mode === 'image' && files.length > 1 && (
        <ViewerTimeline
          totalFrames={files.length}
          currentFrame={currentFrame}
          onScrub={handleScrub}
        />
      )}
    </div>
  );
};

export default Index;
