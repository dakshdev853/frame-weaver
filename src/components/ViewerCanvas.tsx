import React from 'react';
import { Film, Upload, Image as ImageIcon, Video } from 'lucide-react';

interface ViewerCanvasProps {
  mode: 'idle' | 'exr' | 'image' | 'video';
  currentImageUrl: string | null;
  videoUrl: string | null;
  onOpen: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const ViewerCanvas: React.FC<ViewerCanvasProps> = ({
  mode,
  currentImageUrl,
  videoUrl,
  onOpen,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  isDragging,
  canvasRef,
  videoRef,
}) => {
  return (
    <div
      className="flex-1 relative bg-background overflow-hidden"
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg m-4 flex items-center justify-center animate-scale-in">
          <div className="text-center">
            <Upload size={48} className="mx-auto mb-3 text-primary animate-pulse-glow" />
            <p className="text-lg font-medium text-primary">Drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">EXR sequences or video files</p>
          </div>
        </div>
      )}

      {/* Idle state */}
      {mode === 'idle' && !isDragging && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 animate-fade-in">
          <div className="relative">
            <Film size={72} className="text-muted-foreground/30" />
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
              <ImageIcon size={14} className="text-primary-foreground" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">EXR Sequence Viewer</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Drop files here or click to open
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={onOpen}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Upload size={18} />
              Open Files
            </button>
          </div>
          <div className="flex gap-6 mt-6 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <ImageIcon size={12} /> EXR
            </span>
            <span className="flex items-center gap-1.5">
              <Video size={12} /> Videos
            </span>
            <span className="flex items-center gap-1.5">
              <Film size={12} /> Sequences
            </span>
          </div>
        </div>
      )}

      {/* EXR viewer – WebGL canvas */}
      {mode === 'exr' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}

      {/* Image viewer fallback (if no canvasRef) */}
      {mode !== 'exr' && mode !== 'video' && mode !== 'idle' && currentImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={currentImageUrl}
            alt="Current frame"
            className="max-w-full max-h-full object-contain viewer-glow rounded"
            style={{ imageRendering: 'auto' }}
          />
        </div>
      )}

      {/* Video viewer */}
      {mode === 'video' && videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-w-full max-h-full object-contain viewer-glow rounded"
            controls
            autoPlay
          />
        </div>
      )}
    </div>
  );
};

export default ViewerCanvas;
