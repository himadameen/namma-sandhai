import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-3 text-muted-foreground">
            {description ?? t('placeholder.pageUnderConstruction')}
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">{t('placeholder.backToHome')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
