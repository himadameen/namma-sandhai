import { useTranslation } from 'react-i18next'
import { ShieldCheck, ShoppingBag, Sprout } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const DEMO_PASSWORD = 'Demo@2026'

const DEMO_ACCOUNTS = [
  {
    email: 'farmer@nammasandhai.demo',
    roleKey: 'demo.farmerRole',
    nameKey: 'demo.farmerName',
    icon: Sprout,
    tone: 'primary' as const,
  },
  {
    email: 'buyer@nammasandhai.demo',
    roleKey: 'demo.buyerRole',
    nameKey: 'demo.buyerName',
    icon: ShoppingBag,
    tone: 'secondary' as const,
  },
  {
    email: 'admin@nammasandhai.demo',
    roleKey: 'demo.adminRole',
    nameKey: 'demo.adminName',
    icon: ShieldCheck,
    tone: 'accent' as const,
  },
] as const

interface DemoAccountsCardProps {
  compact?: boolean
  selectable?: boolean
  selectedEmail?: string
  onSelect?: (email: string, password: string) => void
}

export function DemoAccountsCard({
  compact = false,
  selectable = false,
  selectedEmail,
  onSelect,
}: DemoAccountsCardProps) {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.06] via-background to-primary/[0.04] p-4 sm:p-5',
        compact && 'rounded-xl p-4'
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className={cn('text-sm font-bold text-primary', textClass)}>{t('demo.accountsTitle')}</p>
          <p className={cn('mt-0.5 text-xs leading-relaxed text-muted-foreground', textClass)}>
            {t('demo.accountsDesc')}
          </p>
        </div>
        <code className="w-fit shrink-0 rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-border">
          {DEMO_PASSWORD}
        </code>
      </div>

      <ul className={cn('mt-4 space-y-2', compact && 'mt-3')}>
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon
          const isSelected = selectedEmail === account.email
          const Wrapper = selectable ? 'button' : 'div'

          return (
            <li key={account.email}>
              <Wrapper
                type={selectable ? 'button' : undefined}
                onClick={selectable ? () => onSelect?.(account.email, DEMO_PASSWORD) : undefined}
                className={cn(
                  'cta-interactive flex w-full min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left sm:gap-3',
                  selectable && 'hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-sm',
                  isSelected
                    ? 'border-primary/40 bg-primary/[0.07] shadow-sm ring-1 ring-primary/15'
                    : 'border-border/60 bg-card/80'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    account.tone === 'primary' && 'bg-primary/10 text-primary',
                    account.tone === 'secondary' && 'bg-secondary/10 text-secondary',
                    account.tone === 'accent' && 'bg-accent/15 text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', textClass)}>{t(account.nameKey)}</p>
                  <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                </div>
                <Badge variant={isSelected ? 'default' : 'muted'} className="shrink-0 text-[10px]">
                  {selectable && isSelected ? t('auth.useAccount') : t(account.roleKey)}
                </Badge>
              </Wrapper>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
