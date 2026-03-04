/**
 * SinglePageViewer.tsx
 * 
 * A complete, self-contained EXR/Video Sequence Viewer UI.
 * No external component dependencies — just React + Lucide icons.
 * 
 * USAGE IN YOUR ELECTRON PROJECT:
 * 1. Copy this file into your renderer/src folder
 * 2. Copy the companion viewer.css file
 * 3. In your main.tsx:
 *    import SinglePageViewer from './SinglePageViewer';
 *    ReactDOM.createRoot(...).render(<SinglePageViewer />);
 * 
 * 4. Wire up your gl.ts, SequencePlayer, EXRSequenceLoader as needed
 *    (see comments marked "// HOOK:" below)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ─── Inline SVG Icons (no lucide dependency needed) ─────────────────────────
// If you have lucide-react installed, replace these with lucide imports.

const Icon = ({ d, size = 18, className = '' }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const PlayIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);
const PauseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="5" y="3" width="4" height="18" />
    <rect x="15" y="3" width="4" height="18" />
  </svg>
);
const StopIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);
const UploadIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const RotateCcwIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const SunIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const GaugeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const FilmIcon = ({ size = 72, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
  </svg>
);
const ImageIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const VideoIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

// ─── Types ──────────────────────────────────────────────────────────────────

interface MediaFile {
  name: string;
  url: string;
  type: 'image' | 'video';
  file?: File;
}

declare global {
  interface Window { api: any; }
}

const getBasename = (name: string) => name.split(/[\\/]/).pop() || name;

// ─── TOOLBAR ────────────────────────────────────────────────────────────────

const Toolbar = ({
  mode, isPlaying, fps, exposure,
  onOpen, onTogglePlay, onStop, onFpsChange, onExposureChange, onResetView,
}: {
  mode: string; isPlaying: boolean; fps: number; exposure: number;
  onOpen: () => void; onTogglePlay: () => void; onStop: () => void;
  onFpsChange: (v: number) => void; onExposureChange: (v: number) => void; onResetView: () => void;
}) => (
  <div className="viewer-toolbar">
    <div className="toolbar-left">
      <button onClick={onOpen} className="btn-primary">
        <UploadIcon size={15} /> Open
      </button>

      {(mode === 'exr' || mode === 'image') && (
        <div className="playback-controls">
          <button onClick={onTogglePlay} className="btn-icon" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
          <button onClick={onStop} className="btn-icon" title="Stop">
            <StopIcon size={18} />
          </button>
          <div className="fps-control">
            <GaugeIcon size={14} />
            <input
              type="number"
              value={fps}
              onChange={(e) => onFpsChange(parseInt(e.target.value) || 24)}
              className="fps-input"
            />
            <span className="fps-label">fps</span>
          </div>
        </div>
      )}
    </div>

    {(mode === 'exr' || mode === 'image') && (
      <div className="toolbar-right">
        <div className="exposure-control">
          <SunIcon size={14} />
          <input
            type="range" min="-8" max="8" step="0.1" value={exposure}
            onChange={(e) => onExposureChange(parseFloat(e.target.value))}
            className="exposure-slider"
          />
          <span className="exposure-value">{exposure.toFixed(1)}</span>
        </div>
        <button onClick={onResetView} className="btn-icon" title="Reset View">
          <RotateCcwIcon size={16} />
        </button>
      </div>
    )}
  </div>
);

// ─── GALLERY ────────────────────────────────────────────────────────────────

const Gallery = ({
  files, currentIndex, onSelect,
}: {
  files: { name: string }[]; currentIndex: number; onSelect: (i: number) => void;
}) => {
  if (files.length === 0) return null;

  return (
    <div className="gallery-sidebar">
      <div className="gallery-header">Sequence • {files.length} frames</div>
      <div className="gallery-grid">
        {files.map((file, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`gallery-thumb ${currentIndex === i ? 'active' : ''}`}
          >
            <div className="thumb-placeholder">
              <ImageIcon size={16} />
            </div>
            <div className="thumb-number">{i + 1}</div>
            <div className="thumb-name">{file.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── CANVAS / VIEWPORT ─────────────────────────────────────────────────────

const Viewport = ({
  mode, currentImageUrl, videoUrl, onOpen,
  onDragOver, onDragEnter, onDragLeave, onDrop, isDragging,
  canvasRef, videoRef,
}: {
  mode: string; currentImageUrl: string | null; videoUrl: string | null;
  onOpen: () => void;
  onDragOver: (e: React.DragEvent) => void; onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  videoRef?: React.RefObject<HTMLVideoElement>;
}) => (
  <div
    className="viewport"
    onDragOver={onDragOver} onDragEnter={onDragEnter}
    onDragLeave={onDragLeave} onDrop={onDrop}
  >
    {isDragging && (
      <div className="drag-overlay">
        <UploadIcon size={48} />
        <p className="drag-text">Drop files here</p>
        <p className="drag-sub">EXR sequences or video files</p>
      </div>
    )}

    {mode === 'idle' && !isDragging && (
      <div className="idle-state">
        <FilmIcon size={72} className="idle-icon" />
        <div className="idle-badge"><ImageIcon size={14} /></div>
        <h1 className="idle-title">EXR Sequence Viewer</h1>
        <p className="idle-sub">Drop files here or click to open</p>
        <button onClick={onOpen} className="btn-primary btn-lg">
          <UploadIcon size={18} /> Open Files
        </button>
        <div className="idle-formats">
          <span><ImageIcon size={12} /> EXR</span>
          <span><VideoIcon size={12} /> Videos</span>
          <span><FilmIcon size={12} /> Sequences</span>
        </div>
      </div>
    )}

    {mode === 'exr' && (
      <div className="canvas-container">
        <canvas ref={canvasRef} className="exr-canvas" style={{ imageRendering: 'pixelated' }} />
      </div>
    )}

    {mode !== 'exr' && mode !== 'video' && mode !== 'idle' && currentImageUrl && (
      <div className="image-container">
        <img src={currentImageUrl} alt="Current frame" className="image-display" />
      </div>
    )}

    {mode === 'video' && videoUrl && (
      <div className="video-container">
        <video ref={videoRef} src={videoUrl} className="video-display" controls autoPlay />
      </div>
    )}
  </div>
);

// ─── TIMELINE ───────────────────────────────────────────────────────────────

const Timeline = ({
  totalFrames, currentFrame, onScrub,
}: {
  totalFrames: number; currentFrame: number; onScrub: (f: number) => void;
}) => {
  if (totalFrames <= 1) return null;

  return (
    <div className="timeline-bar">
      <div className="timeline-track">
        <input
          type="range" min="0" max={totalFrames - 1} value={currentFrame}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))} step="1"
          className="timeline-slider"
        />
        <div className="timeline-markers">
          {totalFrames <= 20 ? (
            Array.from({ length: totalFrames }).map((_, i) => (
              <div key={i} className={`marker ${i === currentFrame ? 'active' : ''}`} />
            ))
          ) : (
            <>
              <span className="marker-label">0</span>
              <span className="marker-label">{Math.floor(totalFrames / 2)}</span>
              <span className="marker-label">{totalFrames - 1}</span>
            </>
          )}
        </div>
      </div>
      <div className="frame-counter">
        <span className="frame-current">{String(currentFrame + 1).padStart(4, '0')}</span>
        <span className="frame-sep">/</span>
        <span>{totalFrames}</span>
      </div>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function SinglePageViewer() {
  const [mode, setMode] = useState<'idle' | 'exr' | 'image' | 'video'>('idle');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exposure, setExposure] = useState(0);
  const [fps, setFps] = useState(24);
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = useRef(0);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── HOOK: Replace with your SequencePlayer / gl.ts logic ──
  // For Electron with EXR: use window.api.openFiles() and your existing loader
  // For browser demo: use file input + URL.createObjectURL

  const processFiles = useCallback((inputFiles: File[]) => {
    if (inputFiles.length === 0) return;

    const imageExts = /\.(jpg|jpeg|png|webp|gif|bmp|tiff|exr|hdr)$/i;
    const videoExts = /\.(mov|mp4|avi|mkv|webm)$/i;

    const imageFiles = inputFiles.filter((f) => imageExts.test(f.name));
    const videoFiles = inputFiles.filter((f) => videoExts.test(f.name));

    if (imageFiles.length > 0) {
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
      setFiles([{ name: f.name, url: URL.createObjectURL(f), type: 'video', file: f }]);
      setMode('video');
      setCurrentFrame(0);
      setIsPlaying(false);
    }
  }, []);

  // ── HOOK: For Electron, replace handleOpen with window.api.openFiles() ──
  const handleOpen = () => fileInputRef.current?.click();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Electron version of handleOpen (uncomment to use): ──
  // const handleOpen = async () => {
  //   const selected = await window.api.openFiles();
  //   if (!selected?.length) return;
  //   // Pass paths to your EXR loader or video loader
  //   await processDroppedPaths(selected);
  // };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
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

  // Cleanup intervals
  useEffect(() => () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); }, []);

  return (
    <div className="viewer-root">
      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden-input" onChange={handleFileInput} />

      <Toolbar
        mode={mode} isPlaying={isPlaying} fps={fps} exposure={exposure}
        onOpen={handleOpen} onTogglePlay={togglePlay} onStop={stop}
        onFpsChange={setFps} onExposureChange={setExposure} onResetView={() => setExposure(0)}
      />

      <div className="viewer-body">
        {(mode === 'exr' || mode === 'image') && files.length > 0 && (
          <Gallery
            files={files.map(f => ({ name: f.name }))}
            currentIndex={currentFrame}
            onSelect={handleScrub}
          />
        )}

        <Viewport
          mode={mode}
          currentImageUrl={files[currentFrame]?.url || null}
          videoUrl={mode === 'video' ? files[0]?.url || null : null}
          onOpen={handleOpen}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isDragging={isDragging}
          canvasRef={canvasRef}
          videoRef={videoRef}
        />
      </div>

      {(mode === 'exr' || mode === 'image') && files.length > 1 && (
        <Timeline totalFrames={files.length} currentFrame={currentFrame} onScrub={handleScrub} />
      )}
    </div>
  );
}
