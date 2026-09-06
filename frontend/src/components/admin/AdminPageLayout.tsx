import type { ReactNode } from 'react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useLocaleText } from '@/hooks/useLocaleText'

interface AdminPageLayoutProps {
  titleKey: string
  descriptionKey?: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminPageLayout({ titleKey, descriptionKey, actions, children }: AdminPageLayoutProps) {
  const { t } = useLocaleText()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(titleKey)}
        description={descriptionKey ? t(descriptionKey) : undefined}
        actions={actions}
      />
      {children}
    </div>
  )
}
