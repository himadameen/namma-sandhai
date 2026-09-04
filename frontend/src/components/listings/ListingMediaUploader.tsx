import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import type { ListingMediaItem } from '@/utils/media'
import { resolveMediaUrl } from '@/utils/media'
import { ListingMediaImage } from '@/components/listings/ListingMediaImage'
import { ListingMediaVideo } from '@/components/listings/ListingMediaVideo'
import { listingsApi } from '@/api/listings'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ListingMediaUploaderProps {
  value: ListingMediaItem[]
  onChange: (media: ListingMediaItem[]) => void
  maxItems?: number
  labels: {
    title: string
    hint: string
    upload: string
    uploading: string
    remove: string
    image: string
    video: string
  }
  textClass?: string
}

export function ListingMediaUploader({
  value,
  onChange,
  maxItems = 8,
  labels,
  textClass,
}: ListingMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const remaining = maxItems - value.length

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || remaining <= 0) return

    setError('')
    setUploading(true)
    try {
      const selected = Array.from(files).slice(0, remaining)
      const uploaded = await listingsApi.uploadMedia(selected)
      onChange([...value, ...uploaded.media])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={cn('text-sm font-semibold leading-snug text-foreground', textClass)}>{labels.title}</p>
        <p className={cn('mt-1 text-xs leading-relaxed text-muted-foreground', textClass)}>{labels.hint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading || remaining <= 0}
          onClick={() => inputRef.current?.click()}
          className={textClass}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? labels.uploading : labels.upload}
        </Button>
        <span className="text-xs text-muted-foreground">
          {value.length}/{maxItems}
        </span>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex min-h-[8.5rem] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center transition hover:border-primary/30 hover:bg-primary/[0.03]"
        >
          <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className={cn('text-sm font-medium text-foreground', textClass)}>{labels.upload}</p>
          <p className={cn('mt-1 text-xs leading-relaxed text-muted-foreground', textClass)}>{labels.hint}</p>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((item) => {
            const mediaUrl = resolveMediaUrl(item.url)
            return (
              <div key={item.id} className="group relative overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                <div className="aspect-square">
                  {item.type === 'video' ? (
                    <ListingMediaVideo
                      src={mediaUrl}
                      compact
                      muted
                      preload="metadata"
                      placeholderLabel={labels.image}
                    />
                  ) : (
                    <ListingMediaImage
                      src={mediaUrl}
                      alt={item.name ?? labels.image}
                      compact
                      placeholderLabel={labels.image}
                    />
                  )}
                </div>
                <div className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {item.type === 'video' ? labels.video : labels.image}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={labels.remove}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
