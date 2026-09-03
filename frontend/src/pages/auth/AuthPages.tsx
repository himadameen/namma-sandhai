import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoAccountsCard } from '@/components/auth/DemoAccountsCard'
import { useAuth } from '@/store/auth'

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

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-tamil text-2xl">{t('auth.loginTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('auth.email')}</label>
                <Input
                  type="email"
                  placeholder="farmer@nammasandhai.demo"
                  {...register('email')}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('auth.password')}</label>
                <Input type="password" placeholder="Demo@2026" {...register('password')} />
              </div>
              {error && (
                <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
              )}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('auth.loginButton')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  {t('nav.register')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        <DemoAccountsCard />
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState('')

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
        language: data.role === 'FARMER' ? 'ta' : 'en',
      })
      navigate(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-tamil text-2xl">{t('auth.registerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={role === 'FARMER' ? 'default' : 'outline'}
                className="font-tamil"
                onClick={() => setValue('role', 'FARMER')}
              >
                {t('landing.iAmFarmer')}
              </Button>
              <Button
                type="button"
                variant={role === 'BUYER' ? 'secondary' : 'outline'}
                className="font-tamil"
                onClick={() => setValue('role', 'BUYER')}
              >
                {t('landing.iAmBuyer')}
              </Button>
            </div>
            <input type="hidden" {...register('role')} />

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('auth.email')}</label>
              <Input type="email" {...register('email')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('auth.password')}</label>
              <Input type="password" {...register('password')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.name')}</label>
              <Input {...register('name')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.phone')}</label>
              <Input {...register('phone')} />
            </div>
            {role === 'BUYER' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.organization')}</label>
                <Input {...register('organization')} />
              </div>
            )}
            {error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('auth.registerButton')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                {t('nav.login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
