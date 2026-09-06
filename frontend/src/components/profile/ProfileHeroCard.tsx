import { Calendar, CalendarClock, CheckCircle2, MapPin, Phone, Shield } from 'lucide-react'
import { ProfileAvatarUpload } from '@/components/profile/ProfileAvatarUpload'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProfileHeroCardProps {
  name: string
  email: string
  phone?: string
  district?: string
  profileImageUrl?: string | null
  isVerified?: boolean
  infoMessage: string
  subtitle?: string
  textClass?: string
  isUploadingAvatar?: boolean
  onUploadAvatar: (file: File) => void
  labels: {
    verified: string
    uploadPhoto: string
    changePhoto: string
    memberSinceText: string
    lastUpdatedText: string
    photoFormats: string
  }
}

export function ProfileHeroCard({
  name,
  email,
  phone,
  district,
  profileImageUrl,
  isVerified = false,
  infoMessage,
  subtitle,
  textClass,
  isUploadingAvatar,
  onUploadAvatar,
  labels,
}: ProfileHeroCardProps) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-card">
      <div className="h-1 bg-gradient-to-r from-primary via-secondary/80 to-primary/30" />
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:flex-row sm:items-start">
            <ProfileAvatarUpload
              name={name}
              imageUrl={profileImageUrl}
              isUploading={isUploadingAvatar}
              onUpload={onUploadAvatar}
              uploadLabel={labels.uploadPhoto}
              changeLabel={labels.changePhoto}
              compact
            />

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className={cn('text-xl font-bold text-foreground sm:text-2xl', textClass)}>
                  {name}
                </h2>
                {isVerified && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {labels.verified}
                  </Badge>
                )}
              </div>

              <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
              {subtitle && (
                <p className="mt-0.5 text-sm font-medium text-foreground/80">{subtitle}</p>
              )}

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {phone ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-sm text-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {phone}
                  </span>
                ) : null}
                {district ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-sm text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {district}
                  </span>
                ) : null}
              </div>

              <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {labels.memberSinceText}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-medium text-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-secondary" />
                  {labels.lastUpdatedText}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{labels.photoFormats}</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3 text-sm leading-relaxed text-muted-foreground lg:w-64 lg:shrink-0">
            <p className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {infoMessage}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
