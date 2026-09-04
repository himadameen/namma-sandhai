import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMemo, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShoppingBag, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { DemoAccountsCard } from '@/components/auth/DemoAccountsCard'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerBaseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().min(10),
  district: z.string().optional(),
  organization: z.string().optional(),
  role: z.enum(['FARMER', 'BUYER']),
})

type RegisterForm = z.infer<typeof registerBaseSchema>
type LoginForm = z.infer<typeof loginSchema>

function AuthField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-foreground/90">{label}</label>
      {children}
    </div>
  )
}

function AuthInput({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: typeof Mail }) {
  return (
    <div className="relative min-w-0">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn('h-11 min-w-0 pl-10', className)} {...props} />
    </div>
  )
}

function PasswordInput({
  showLabel,
  hideLabel,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative min-w-0">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('h-11 min-w-0 pl-10 pr-11', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const selectedEmail = watch('email')

  const fillDemoAccount = (email: string, password: string) => {
    setValue('email', email, { shouldDirty: true, shouldValidate: true })
    setValue('password', password, { shouldDirty: true, shouldValidate: true })
    setError('')
  }

  const onSubmit = async (data: LoginForm) => {
    setError('')
    try {
      const path = await login(data)
      navigate(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6 sm:py-5 lg:hidden">
          <h2 className={cn('text-xl font-bold text-primary', textClass)}>{t('auth.loginTitle')}</h2>
          <p className={cn('mt-1 text-sm leading-relaxed text-muted-foreground', textClass)}>
            {t('authPanel.loginSubtitle')}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <div className="mx-auto w-full min-w-0 max-w-md">
            <div className="mb-7 hidden lg:block">
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {t('nav.login')}
              </span>
              <h2 className={cn('mt-4 text-2xl font-bold text-primary', textClass)}>{t('auth.loginTitle')}</h2>
              <p className={cn('mt-2 text-sm leading-relaxed text-muted-foreground', textClass)}>
                {t('authPanel.loginSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <AuthField label={t('auth.email')}>
                <AuthInput
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  {...register('email')}
                />
              </AuthField>
              <AuthField label={t('auth.password')}>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  showLabel={t('auth.showPassword')}
                  hideLabel={t('auth.hidePassword')}
                  {...register('password')}
                />
              </AuthField>

              {error && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button className={cn('h-12 w-full text-base shadow-card', textClass)} type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('auth.loginButton')}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center">
                <span className={cn('bg-card px-3 text-xs font-medium text-muted-foreground', textClass)}>
                  {t('auth.orTryDemo')}
                </span>
              </div>
            </div>

            <DemoAccountsCard
              compact
              selectable
              selectedEmail={selectedEmail}
              onSelect={fillDemoAccount}
            />
          </div>
        </div>

        <div className="border-t border-border/60 bg-muted/15 px-4 py-4 sm:px-8">
          <p className={cn('text-center text-sm text-muted-foreground', textClass)}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

function RoleCard({
  active,
  label,
  icon: Icon,
  tone,
  onClick,
  textClass,
}: {
  active: boolean
  label: string
  icon: typeof Sprout
  tone: 'primary' | 'secondary'
  onClick: () => void
  textClass: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cta-interactive flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4',
        active
          ? tone === 'primary'
            ? 'border-primary bg-primary/[0.08] shadow-sm'
            : 'border-secondary bg-secondary/[0.08] shadow-sm'
          : 'border-border bg-background hover:border-primary/20 hover:shadow-sm'
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          active
            ? tone === 'primary'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className={cn('text-sm font-semibold', active ? 'text-foreground' : 'text-muted-foreground', textClass)}>
        {label}
      </span>
    </button>
  )
}

export function RegisterPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState('')
  const isTamil = i18n.language?.startsWith('ta')
  const textClass = isTamil ? 'font-tamil' : 'font-sans'

  const defaultRole = searchParams.get('role') === 'buyer' ? 'BUYER' : 'FARMER'

  const registerSchema = useMemo(
    () =>
      registerBaseSchema.superRefine((data, ctx) => {
        if (data.role === 'BUYER' && !data.organization) {
          ctx.addIssue({
            code: 'custom',
            message: t('auth.organizationRequired'),
            path: ['organization'],
          })
        }
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      district: '',
      organization: '',
      role: defaultRole,
    },
  })

  const role = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    setError('')
    try {
      const path = await registerUser({
        ...data,
        language: i18n.language?.startsWith('ta') ? 'ta' : 'en',
      })
      navigate(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    }
  }

  return (
    <AuthLayout mode="register">
      <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6 sm:py-5 lg:hidden">
        <h2 className={cn('text-xl font-bold text-primary', textClass)}>{t('auth.registerTitle')}</h2>
        <p className={cn('mt-1 text-sm leading-relaxed text-muted-foreground', textClass)}>
          {t('authPanel.registerSubtitle')}
        </p>
      </div>

      <div className="min-w-0 px-4 py-5 sm:px-8 sm:py-8">
        <div className="mb-6 hidden lg:block">
          <h2 className={cn('text-2xl font-bold text-primary', textClass)}>{t('auth.registerTitle')}</h2>
          <p className={cn('mt-1.5 text-sm text-muted-foreground', textClass)}>{t('authPanel.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={role === 'FARMER'}
              label={t('landing.iAmFarmer')}
              icon={Sprout}
              tone="primary"
              onClick={() => setValue('role', 'FARMER')}
              textClass={textClass}
            />
            <RoleCard
              active={role === 'BUYER'}
              label={t('landing.iAmBuyer')}
              icon={ShoppingBag}
              tone="secondary"
              onClick={() => setValue('role', 'BUYER')}
              textClass={textClass}
            />
          </div>
          <input type="hidden" {...register('role')} />

          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField label={t('profile.name')} className="sm:col-span-2 lg:col-span-1">
              <Input placeholder={t('auth.namePlaceholder')} className="h-11" {...register('name')} />
            </AuthField>
            <AuthField label={t('profile.phone')} className="sm:col-span-2 lg:col-span-1">
              <Input placeholder={t('auth.phonePlaceholder')} className="h-11" {...register('phone')} />
            </AuthField>
            <AuthField label={t('auth.email')} className="sm:col-span-2 lg:col-span-1">
              <Input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className="h-11"
                {...register('email')}
              />
            </AuthField>
            <AuthField label={t('auth.password')} className="sm:col-span-2 lg:col-span-1">
              <Input
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                className="h-11"
                {...register('password')}
              />
            </AuthField>
          </div>

          {role === 'BUYER' && (
            <AuthField label={t('profile.organization')}>
              <Input
                placeholder={t('auth.organizationPlaceholder')}
                className="h-11"
                {...register('organization')}
              />
            </AuthField>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button className={cn('h-11 w-full text-base', textClass)} type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('auth.registerButton')}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <p className={cn('text-center text-sm text-muted-foreground', textClass)}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t('nav.login')}
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
