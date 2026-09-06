import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Loader2, Plus, Shield, Trash2 } from 'lucide-react'
import { adminApi, type AdminPermission } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminSectionCard, EmptyState } from './shared'

const PERMISSION_LABELS: Record<AdminPermission, string> = {
  USERS_MANAGE: 'Users',
  KYC_REVIEW: 'KYC',
  LISTINGS_MANAGE: 'Listings',
  TRANSACTIONS_VIEW: 'Transactions',
  ENQUIRIES_MANAGE: 'Enquiries',
  REPORTS_VIEW: 'Reports',
  REPORTS_EXPORT: 'Export',
  ROLES_MANAGE: 'Roles',
  ANALYTICS_VIEW: 'Analytics',
}

export function AdminRoles() {
  const { t } = useLocaleText()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<AdminPermission[]>([])

  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminApi.getRoles,
  })

  const { data: permissions } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: adminApi.getPermissions,
  })

  const createRole = useMutation({
    mutationFn: () => adminApi.createRole({ name, description, permissions: selectedPerms }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      setName('')
      setDescription('')
      setSelectedPerms([])
    },
  })

  const deleteRole = useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
  })

  const togglePerm = (perm: AdminPermission) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard title={t('admin.createRole')} description={t('admin.createRoleDesc')}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder={t('admin.roleName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={t('admin.roleDescription')} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(permissions ?? []).map((perm) => (
            <button
              key={perm}
              type="button"
              onClick={() => togglePerm(perm)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedPerms.includes(perm)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              {PERMISSION_LABELS[perm] ?? perm}
            </button>
          ))}
        </div>
        <Button
          className="mt-4 gap-2"
          disabled={!name.trim() || selectedPerms.length === 0 || createRole.isPending}
          onClick={() => createRole.mutate()}
        >
          {createRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t('admin.createRoleBtn')}
        </Button>
      </AdminSectionCard>

      <AdminSectionCard title={t('admin.existingRoles')} description={t('admin.existingRolesDesc')}>
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : !roles?.length ? (
          <EmptyState message={t('admin.noRoles')} />
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/80 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="font-semibold">{role.name}</p>
                    {role.isSystem ? <Badge variant="secondary">{t('admin.systemRole')}</Badge> : null}
                  </div>
                  {role.description ? <p className="mt-1 text-sm text-muted-foreground">{role.description}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {role.permissions.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px]">
                        {PERMISSION_LABELS[p] ?? p}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('admin.usersAssigned', { count: role.usersCount })}
                  </p>
                </div>
                {!role.isSystem ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleteRole.isPending}
                    onClick={() => deleteRole.mutate(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>
    </div>
  )
}
