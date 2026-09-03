import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const DEMO_ACCOUNTS = [
  { email: 'farmer@nammasandhai.demo', roleKey: 'demo.farmerRole', nameKey: 'demo.farmerName' },
  { email: 'buyer@nammasandhai.demo', roleKey: 'demo.buyerRole', nameKey: 'demo.buyerName' },
  { email: 'admin@nammasandhai.demo', roleKey: 'demo.adminRole', nameKey: 'demo.adminName' },
] as const

export function DemoAccountsCard() {
  const { t } = useTranslation()

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="font-tamil text-base">{t('demo.accountsTitle')}</CardTitle>
        <CardDescription>{t('demo.accountsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="rounded-lg bg-background/80 px-3 py-2 text-sm font-medium">
          {t('demo.password')}: <code className="text-primary">Demo@2026</code>
        </p>
        <ul className="space-y-2 text-sm">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
            >
              <div>
                <p className="font-medium">{t(account.nameKey)}</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
              <Badge variant="muted">{t(account.roleKey)}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
