import { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface LocalPhoto {
  id: string;
  url: string;
  name: string;
}

/**
 * Visual-only photo upload step. Accepts images, previews them locally.
 * No upload happens — backend will wire this to a real /reviews/:id/photos endpoint.
 */
export function PhotoUpload({
  value,
  onChange,
}: {
  value: LocalPhoto[];
  onChange: (next: LocalPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...value];
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 6 - value.length)
      .forEach((f) => {
        next.push({ id: `${Date.now()}-${f.name}`, url: URL.createObjectURL(f), name: f.name });
      });
    onChange(next);
  };

  const remove = (id: string) => {
    const p = value.find((x) => x.id === id);
    if (p) URL.revokeObjectURL(p.url);
    onChange(value.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="font-semibold text-navy">Add photos (optional)</div>
        <div className="text-sm text-ink-muted">
          Up to 6 photos. Helpful shots: the room, the view, the bathroom, amenities you
          used.
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={
          dragging
            ? 'border-2 border-dashed border-action bg-action-subtle rounded-lg p-6 text-center cursor-pointer transition-colors'
            : 'border-2 border-dashed border-divider hover:border-action hover:bg-action-subtle/40 rounded-lg p-6 text-center cursor-pointer transition-colors'
        }
      >
        <Camera size={24} className="mx-auto text-action" />
        <div className="mt-2 text-sm font-semibold text-navy">
          Drop photos here or click to browse
        </div>
        <div className="text-xs text-ink-muted">JPG, PNG, or HEIC · up to 10MB each</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square rounded-md overflow-hidden border border-divider group"
            >
              <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 text-navy flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white shadow-float"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - value.length) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-square rounded-md border border-dashed border-divider flex items-center justify-center text-ink-muted"
            >
              <ImageIcon size={18} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
