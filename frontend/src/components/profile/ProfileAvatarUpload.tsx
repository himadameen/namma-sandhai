import { useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { resolveMediaUrl } from '@/utils/media'
import { cn } from '@/lib/utils'

interface ProfileAvatarUploadProps {
  name: string
  imageUrl?: string | null
  isUploading?: boolean
  onUpload: (file: File) => void
  uploadLabel: string
  changeLabel: string
  compact?: boolean
}

export function ProfileAvatarUpload({
  name,
  imageUrl,
  isUploading,
  onUpload,
  uploadLabel,
  changeLabel,
  compact = false,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const initials = name.trim().charAt(0).toUpperCase() || '?'
  const resolvedUrl = imageUrl ? resolveMediaUrl(imageUrl) : ''
  const actionLabel = resolvedUrl ? changeLabel : uploadLabel

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onUpload(file)
    event.target.value = ''
  }

  return (
    <div className={cn('shrink-0', compact ? '' : 'flex flex-col items-center gap-3 sm:items-start')}>
      <div className="group relative">
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/15 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-sm',
            compact ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-28 w-28',
            isUploading && 'opacity-70'
          )}
        >
          {resolvedUrl ? (
            <img src={resolvedUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary sm:text-4xl">{initials}</span>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-md transition-colors hover:bg-muted disabled:opacity-50 sm:h-9 sm:w-9"
          aria-label={actionLabel}
          title={actionLabel}
        >
          <Camera className="h-4 w-4" />
        </button>
        {compact && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-end justify-center rounded-2xl bg-gradient-to-t from-black/50 to-transparent pb-2 opacity-0 transition-opacity group-hover:opacity-100 disabled:pointer-events-none"
            aria-hidden
            tabIndex={-1}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white">
              {resolvedUrl ? changeLabel : uploadLabel}
            </span>
          </button>
        )}
      </div>

      {!compact && (
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-foreground">{actionLabel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG · max 5 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
