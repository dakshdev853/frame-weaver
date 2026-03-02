import React from 'react';
import { Play, Pause, Square, Upload, RotateCcw, Sun, Gauge } from 'lucide-react';

interface ViewerToolbarProps {
  mode: 'idle' | 'exr' | 'image' | 'video';
  isPlaying: boolean;
  fps: number;
  exposure: number;
  onOpen: () => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onFpsChange: (fps: number) => void;
  onExposureChange: (exposure: number) => void;
  onResetView: () => void;
}

const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  mode,
  isPlaying,
  fps,
  exposure,
  onOpen,
  onTogglePlay,
  onStop,
  onFpsChange,
  onExposureChange,
  onResetView,
}) => {
  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-4 toolbar-glass shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/90 hover:bg-primary text-primary-foreground rounded-md transition-colors text-sm font-medium"
        >
          <Upload size={15} />
          Open
        </button>

        {(mode === 'exr' || mode === 'image') && (
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={onTogglePlay}
              className="p-1.5 hover:bg-secondary rounded-md transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={onStop}
              className="p-1.5 hover:bg-secondary rounded-md transition-colors"
              title="Stop"
            >
              <Square size={18} />
            </button>

            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-border">
              <Gauge size={14} className="text-muted-foreground" />
              <input
                type="number"
                value={fps}
                onChange={(e) => onFpsChange(parseInt(e.target.value) || 24)}
                className="w-12 bg-secondary border border-border rounded px-1.5 py-0.5 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">fps</span>
            </div>
          </div>
        )}
      </div>

      {(mode === 'exr' || mode === 'image') && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-muted-foreground" />
            <input
              type="range"
              min="-8"
              max="8"
              step="0.1"
              value={exposure}
              onChange={(e) => onExposureChange(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-xs font-mono w-10 text-right text-muted-foreground">
              {exposure.toFixed(1)}
            </span>
          </div>
          <button
            onClick={onResetView}
            className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewerToolbar;
