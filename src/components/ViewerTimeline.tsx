import React from 'react';

interface ViewerTimelineProps {
  totalFrames: number;
  currentFrame: number;
  onScrub: (frame: number) => void;
}

const ViewerTimeline: React.FC<ViewerTimelineProps> = ({
  totalFrames,
  currentFrame,
  onScrub,
}) => {
  if (totalFrames <= 1) return null;

  return (
    <div className="h-14 border-t border-border timeline-glass flex items-center px-5 gap-4 shrink-0">
      {/* Mini timeline markers */}
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max={totalFrames - 1}
          value={currentFrame}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))}
          step="1"
          className="w-full"
        />
        {/* Frame markers below the slider */}
        <div className="flex justify-between mt-0.5 px-1">
          {totalFrames <= 20 ? (
            Array.from({ length: totalFrames }).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all ${
                  i === currentFrame
                    ? 'h-2 bg-primary'
                    : 'h-1 bg-muted-foreground/20'
                }`}
              />
            ))
          ) : (
            <>
              <span className="text-[9px] font-mono text-muted-foreground">0</span>
              <span className="text-[9px] font-mono text-muted-foreground">
                {Math.floor(totalFrames / 2)}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground">
                {totalFrames - 1}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="font-mono text-xs text-muted-foreground tabular-nums min-w-[100px] text-right">
        <span className="text-foreground">{String(currentFrame + 1).padStart(4, '0')}</span>
        <span className="mx-1">/</span>
        <span>{totalFrames}</span>
      </div>
    </div>
  );
};

export default ViewerTimeline;
