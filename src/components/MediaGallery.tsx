import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  type: 'image' | 'video';
}

interface MediaGalleryProps {
  files: MediaFile[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ files, currentIndex, onSelect }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-56 border-r border-border bg-surface-overlay overflow-hidden flex flex-col shrink-0">
      <div className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border font-medium">
        Sequence • {files.length} frames
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="grid grid-cols-2 gap-1">
          {files.map((file, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`group relative aspect-square rounded overflow-hidden transition-all duration-150 ${
                currentIndex === i
                  ? 'thumbnail-active scale-[1.02]'
                  : 'opacity-60 hover:opacity-100 ring-1 ring-border hover:ring-muted-foreground'
              }`}
            >
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <ImageIcon size={16} className="text-muted-foreground" />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent px-1 py-0.5">
                <span className="text-[9px] font-mono text-foreground/70 truncate block">
                  {i + 1}
                </span>
              </div>
              <div className="absolute top-0 inset-x-0 px-1 py-0.5">
                <span className="text-[8px] font-mono text-foreground/50 truncate block">
                  {file.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
