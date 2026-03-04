/**
 * SinglePageViewer.tsx — Self-contained EXR/Video Sequence Viewer
 * Drop into your Electron project with viewer.css
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const PlayIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);
const PauseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="5" y="3" width="4" height="18" /><rect x="15" y="3" width="4" height="18" />
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
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const RotateCcwIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
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
    <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const VideoIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

// ─── Edit tool icons ────────────────────────────────────────────────────────
const PencilIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);
const EraserIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" /><path d="m5 11 9 9" />
  </svg>
);
const CropIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" />
  </svg>
);
const MoveIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);
const ZoomInIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const PipetteIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" />
    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
  </svg>
);
const TypeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);
const RulerIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
  </svg>
);

// ─── Info panel icon ────────────────────────────────────────────────────────
const InfoIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);
const LayersIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const HashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);
const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const FrameIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" /><path d="M9 21V9" />
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

// Extract shot info from filename
const extractShotInfo = (filename: string) => {
  const base = getBasename(filename).replace(/\.[^.]+$/, '');
  // Try patterns like "shot_010_comp_v02_0001" or "SH010_beauty_v3_fr001"
  const shotMatch = base.match(/(sh(?:ot)?[_-]?\d+)/i);
  const versionMatch = base.match(/v(?:ersion)?[_-]?(\d+)/i);
  const layerMatch = base.match(/(beauty|comp|diffuse|specular|albedo|normal|depth|ao|shadow|emission|crypto|matte)/i);
  
  return {
    shotName: shotMatch ? shotMatch[1].toUpperCase().replace(/[_-]/g, '_') : base.split(/[_.\-]/)[0]?.toUpperCase() || 'UNTITLED',
    shotId: shotMatch ? shotMatch[1].replace(/\D/g, '').padStart(3, '0') : '001',
    version: versionMatch ? `v${versionMatch[1].padStart(2, '0')}` : 'v01',
    layer: layerMatch ? layerMatch[1].charAt(0).toUpperCase() + layerMatch[1].slice(1).toLowerCase() : 'Beauty',
  };
};

// ─── TOOLBAR ────────────────────────────────────────────────────────────────

const Toolbar = ({
  mode, isPlaying, fps, exposure,
  onOpen, onTogglePlay, onStop, onFpsChange, onExposureChange, onResetView,
  fileTypeFilter, onFilterChange,
}: {
  mode: string; isPlaying: boolean; fps: number; exposure: number;
  onOpen: () => void; onTogglePlay: () => void; onStop: () => void;
  onFpsChange: (v: number) => void; onExposureChange: (v: number) => void; onResetView: () => void;
  fileTypeFilter: string; onFilterChange: (v: string) => void;
}) => (
  <div className="viewer-toolbar">
    <div className="toolbar-left">
      <div className="open-group">
        <select value={fileTypeFilter} onChange={(e) => onFilterChange(e.target.value)} className="file-type-select">
          <option value="all">All supported</option>
          <option value="exr">EXR sequences</option>
          <option value="video">Videos</option>
          <option value="image">Images</option>
        </select>
        <button onClick={onOpen} className="btn-primary">
          <UploadIcon size={15} /> Open
        </button>
      </div>

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
            <input type="number" value={fps} onChange={(e) => onFpsChange(parseInt(e.target.value) || 24)} className="fps-input" />
            <span className="fps-label">fps</span>
          </div>
        </div>
      )}
    </div>

    {(mode === 'exr' || mode === 'image') && (
      <div className="toolbar-right">
        <div className="exposure-control">
          <SunIcon size={14} />
          <input type="range" min="-8" max="8" step="0.1" value={exposure}
            onChange={(e) => onExposureChange(parseFloat(e.target.value))} className="exposure-slider" />
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
  files, thumbnails, currentIndex, onSelect,
}: {
  files: { name: string }[]; thumbnails: string[]; currentIndex: number; onSelect: (i: number) => void;
}) => {
  if (files.length === 0) return null;
  return (
    <div className="gallery-sidebar">
      <div className="gallery-header">Sequence • {files.length} frames</div>
      <div className="gallery-grid">
        {files.map((file, i) => (
          <button key={i} onClick={() => onSelect(i)}
            className={`gallery-thumb ${currentIndex === i ? 'active' : ''}`}
            title={`Frame ${i + 1} — ${file.name}`}>
            <div className="thumb-image-wrapper">
              {thumbnails[i] ? (
                <img src={thumbnails[i]} alt={`frame ${i + 1}`} className="thumb-image" loading="lazy" draggable={false} />
              ) : (
                <div className="thumb-placeholder"><ImageIcon size={28} /></div>
              )}
              <div className="thumb-number-overlay">{i + 1}</div>
            </div>
            <div className="thumb-name" title={file.name}>{file.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── INFO PANEL (Right Sidebar) ─────────────────────────────────────────────

const InfoPanel = ({
  files, currentFrame, fps, exposure, mode,
}: {
  files: string[]; currentFrame: number; fps: number; exposure: number; mode: string;
}) => {
  if (mode === 'idle' || files.length === 0) return null;

  const currentFile = files[currentFrame] || files[0] || '';
  const info = extractShotInfo(currentFile);
  const basename = getBasename(currentFile);
  const ext = basename.split('.').pop()?.toUpperCase() || '—';
  const totalDuration = files.length > 1 ? (files.length / fps).toFixed(2) : '—';

  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <InfoIcon size={14} />
        <span>Shot Info</span>
      </div>

      <div className="info-section">
        <div className="info-row">
          <span className="info-label"><LayersIcon size={12} /> Shot</span>
          <span className="info-value">{info.shotName}</span>
        </div>
        <div className="info-row">
          <span className="info-label"><HashIcon size={12} /> ID</span>
          <span className="info-value info-mono">{info.shotId}</span>
        </div>
        <div className="info-row">
          <span className="info-label"><FrameIcon size={12} /> Version</span>
          <span className="info-value info-badge">{info.version}</span>
        </div>
        <div className="info-row">
          <span className="info-label"><ImageIcon size={12} /> Layer</span>
          <span className="info-value">{info.layer}</span>
        </div>
      </div>

      <div className="info-divider" />

      <div className="info-section">
        <div className="info-section-title">Sequence</div>
        <div className="info-row">
          <span className="info-label"><FilmIcon size={12} /> Frames</span>
          <span className="info-value info-mono">{files.length}</span>
        </div>
        <div className="info-row">
          <span className="info-label"><GaugeIcon size={12} /> FPS</span>
          <span className="info-value info-mono">{fps}</span>
        </div>
        <div className="info-row">
          <span className="info-label"><ClockIcon size={12} /> Duration</span>
          <span className="info-value info-mono">{totalDuration}s</span>
        </div>
        <div className="info-row">
          <span className="info-label"><SunIcon size={12} /> Exposure</span>
          <span className="info-value info-mono">{exposure.toFixed(1)}</span>
        </div>
      </div>

      <div className="info-divider" />

      <div className="info-section">
        <div className="info-section-title">Current File</div>
        <div className="info-filename">{basename}</div>
        <div className="info-row">
          <span className="info-label">Format</span>
          <span className="info-value info-badge-sm">{ext}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Frame</span>
          <span className="info-value info-mono">{currentFrame + 1} / {files.length}</span>
        </div>
      </div>
    </div>
  );
};

// ─── VIEWPORT ───────────────────────────────────────────────────────────────

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
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) => (
  <div className="viewport" onDragOver={onDragOver} onDragEnter={onDragEnter}
    onDragLeave={onDragLeave} onDrop={onDrop}>
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
        <input type="range" min="0" max={totalFrames - 1} value={currentFrame}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))} step="1" className="timeline-slider" />
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

// ─── EDIT TOOLS BAR ─────────────────────────────────────────────────────────

const EditToolsBar = ({
  activeTool, onToolChange,
}: {
  activeTool: string; onToolChange: (tool: string) => void;
}) => {
  const tools = [
    { id: 'move', icon: <MoveIcon size={16} />, label: 'Move (V)' },
    { id: 'pencil', icon: <PencilIcon size={16} />, label: 'Pencil (B)' },
    { id: 'eraser', icon: <EraserIcon size={16} />, label: 'Eraser (E)' },
    { id: 'crop', icon: <CropIcon size={16} />, label: 'Crop (C)' },
    { id: 'zoom', icon: <ZoomInIcon size={16} />, label: 'Zoom (Z)' },
    { id: 'pipette', icon: <PipetteIcon size={16} />, label: 'Color Picker (I)' },
    { id: 'type', icon: <TypeIcon size={16} />, label: 'Text (T)' },
    { id: 'ruler', icon: <RulerIcon size={16} />, label: 'Measure (M)' },
  ];

  return (
    <div className="edit-tools-bar">
      <div className="edit-tools-group">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`edit-tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <div className="edit-tools-separator" />
      <div className="edit-tools-status">
        <span className="edit-tool-active-label">{tools.find(t => t.id === activeTool)?.label || 'Select tool'}</span>
      </div>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function SinglePageViewer() {
  const [mode, setMode] = useState<'idle' | 'exr' | 'image' | 'video'>('idle');
  const [files, setFiles] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exposure, setExposure] = useState(0);
  const [fps, setFps] = useState(24);
  const [isDragging, setIsDragging] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState('move');

  const dragCounter = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HOOK: Replace with your SequencePlayer / gl.ts logic
  const playerRef = useRef<any>(null);

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const map: Record<string, string> = { v: 'move', b: 'pencil', e: 'eraser', c: 'crop', z: 'zoom', i: 'pipette', t: 'type', m: 'ruler' };
      if (map[e.key.toLowerCase()]) {
        setActiveTool(map[e.key.toLowerCase()]);
      }
      if (e.key === ' ') {
        e.preventDefault();
        // toggle play
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // HOOK: file loading — wire to your EXRSequenceLoader + SequencePlayer
  const loadSequence = async (selectedPaths: string[]) => {
    if (selectedPaths.length === 0) return;
    const exrFiles = selectedPaths.filter(p => /\.exr$/i.test(p));
    const videoFiles = selectedPaths.filter(p => /\.(mov|mp4|avi|mkv|webm)$/i.test(p));

    if (exrFiles.length > 0) {
      const sorted = [...exrFiles].sort((a, b) => {
        const numA = parseInt(getBasename(a).match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(getBasename(b).match(/\d+/)?.[0] || '0', 10);
        return numA - numB || a.localeCompare(b);
      });
      setFiles(sorted);
      setMode('exr');
      setCurrentFrame(0);
      setIsPlaying(true);
      // HOOK: init loader, player, thumbnails here
    } else if (videoFiles.length === 1) {
      setFiles([videoFiles[0]]);
      setMode('video');
      setIsPlaying(true);
    }
  };

  const handleOpen = async () => {
    try {
      const selected = await window.api.openFiles();
      if (selected?.length) await loadSequence(selected);
    } catch {
      // fallback: use file input for browser demo
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); dragCounter.current = 0; setIsDragging(false);
    try {
      const dtFiles = Array.from(e.dataTransfer.files);
      const paths = await Promise.all(dtFiles.map(file => window.api.getPathForFile(file))).then(p => p.filter(Boolean) as string[]);
      await loadSequence(paths);
    } catch {
      // browser fallback
      const dtFiles = Array.from(e.dataTransfer.files);
      const imageExts = /\.(jpg|jpeg|png|webp|gif|bmp|tiff|exr|hdr)$/i;
      const imageFiles = dtFiles.filter(f => imageExts.test(f.name));
      if (imageFiles.length > 0) {
        const sorted = [...imageFiles].sort((a, b) => {
          const numA = parseInt(getBasename(a.name).match(/\d+/)?.[0] || '0', 10);
          const numB = parseInt(getBasename(b.name).match(/\d+/)?.[0] || '0', 10);
          return numA - numB || a.name.localeCompare(b.name);
        });
        setFiles(sorted.map(f => f.name));
        setMode('image');
        setCurrentFrame(0);
      }
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.pause();
      else playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stop = () => {
    playerRef.current?.stop();
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const handleScrub = (idx: number) => {
    setCurrentFrame(idx);
    playerRef.current?.seek(idx);
  };

  const handleExposureChange = (val: number) => {
    setExposure(val);
    playerRef.current?.setExposure(val);
  };

  const handleFpsChange = (val: number) => {
    setFps(val);
    playerRef.current?.setFps(val);
  };

  const handleFilterChange = (value: string) => {
    if (['all', 'exr', 'video', 'image'].includes(value)) setFileTypeFilter(value);
  };

  // HOOK: resetView — wire to gl.ts resetView()
  const resetView = () => {
    setExposure(0);
    playerRef.current?.setExposure(0);
  };

  return (
    <div className="viewer-root">
      <input ref={fileInputRef} type="file" multiple accept=".exr,image/*,video/*" className="hidden-input"
        onChange={(e) => {
          const paths = Array.from(e.target.files || []).map(f => (f as any).path || f.name);
          loadSequence(paths.filter(Boolean));
        }} />

      <Toolbar
        mode={mode} isPlaying={isPlaying} fps={fps} exposure={exposure}
        onOpen={handleOpen} onTogglePlay={togglePlay} onStop={stop}
        onFpsChange={handleFpsChange} onExposureChange={handleExposureChange}
        onResetView={resetView} fileTypeFilter={fileTypeFilter} onFilterChange={handleFilterChange}
      />

      <div className="viewer-body">
        {(mode === 'exr' || mode === 'image') && files.length > 0 && (
          <Gallery
            files={files.map(path => ({ name: getBasename(path) }))}
            thumbnails={thumbnails}
            currentIndex={currentFrame}
            onSelect={handleScrub}
          />
        )}

        <Viewport
          mode={mode} currentImageUrl={null}
          videoUrl={mode === 'video' ? `file://${files[0] || ''}` : null}
          onOpen={handleOpen} onDragOver={handleDragOver} onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave} onDrop={handleDrop} isDragging={isDragging}
          canvasRef={canvasRef} videoRef={videoRef}
        />

        <InfoPanel
          files={files} currentFrame={currentFrame} fps={fps} exposure={exposure} mode={mode}
        />
      </div>

      {(mode === 'exr' || mode === 'image') && files.length > 1 && (
        <Timeline totalFrames={files.length} currentFrame={currentFrame} onScrub={handleScrub} />
      )}

      <EditToolsBar activeTool={activeTool} onToolChange={setActiveTool} />
    </div>
  );
}
