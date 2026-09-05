import { useRef } from 'react'
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Landmark,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'
import type { DocumentType, ProfileDocument } from '@/api/profile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DOCUMENT_ICONS: Record<DocumentType, typeof FileText> = {
  GOVT_ID: FileText,
  LAND_RECORD: Landmark,
  BANK_PROOF: Building2,
  GST_CERT: FileText,
}

interface KycDocumentCardProps {
  type: DocumentType
  title: string
  description: string
  document?: ProfileDocument
  isUploading?: boolean
  onUpload: (file: File, type: DocumentType) => void
  uploadLabel: string
  replaceLabel: string
  pendingLabel: string
  approvedLabel: string
  rejectedLabel: string
  formatsHint: string
}

export function KycDocumentCard({
  type,
  title,
  description,
  document,
  isUploading,
  onUpload,
  uploadLabel,
  replaceLabel,
  pendingLabel,
  approvedLabel,
  rejectedLabel,
  formatsHint,
}: KycDocumentCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const Icon = DOCUMENT_ICONS[type]

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onUpload(file, type)
    event.target.value = ''
  }

  const statusBadge = () => {
    if (!document) return null
    if (document.status === 'APPROVED') {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {approvedLabel}
        </Badge>
      )
    }
    if (document.status === 'REJECTED') {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {rejectedLabel}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        {pendingLabel}
      </Badge>
    )
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border p-4 transition-colors sm:p-5',
        document ? 'border-border/80 bg-card' : 'border-dashed border-primary/30 bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            document ? 'bg-muted text-primary' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {statusBadge()}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          {document && (
            <p className="mt-2 truncate text-xs text-muted-foreground">{document.fileName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={document ? 'outline' : 'default'}
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {document ? replaceLabel : uploadLabel}
        </Button>
        <span className="text-xs text-muted-foreground">{formatsHint}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </article>
  )
}

interface KycDocumentsSectionProps {
  documentTypes: DocumentType[]
  documents: ProfileDocument[]
  uploadingType?: DocumentType | null
  onUpload: (file: File, type: DocumentType) => void
  title: string
  subtitle: string
  infoMessage: string
  labels: {
    upload: string
    replace: string
    pending: string
    approved: string
    rejected: string
    formatsHint: string
    docTitles: Record<DocumentType, string>
    docDescriptions: Record<DocumentType, string>
  }
}

export function KycDocumentsSection({
  documentTypes,
  documents,
  uploadingType,
  onUpload,
  title,
  subtitle,
  infoMessage,
  labels,
}: KycDocumentsSectionProps) {
  const documentMap = new Map(documents.map((doc) => [doc.type, doc]))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {infoMessage}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {documentTypes.map((type) => (
          <KycDocumentCard
            key={type}
            type={type}
            title={labels.docTitles[type]}
            description={labels.docDescriptions[type]}
            document={documentMap.get(type)}
            isUploading={uploadingType === type}
            onUpload={onUpload}
            uploadLabel={labels.upload}
            replaceLabel={labels.replace}
            pendingLabel={labels.pending}
            approvedLabel={labels.approved}
            rejectedLabel={labels.rejected}
            formatsHint={labels.formatsHint}
          />
        ))}
      </div>
    </div>
  )
}
