import { AdminPermission } from '@prisma/client'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'

export async function listRoles() {
  const roles = await prisma.adminRole.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { users: true } } },
  })
  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissions: r.permissions,
    isSystem: r.isSystem,
    usersCount: r._count.users,
    createdAt: r.createdAt,
  }))
}

export async function createRole(input: {
  name: string
  description?: string
  permissions: AdminPermission[]
}) {
  const existing = await prisma.adminRole.findUnique({ where: { name: input.name } })
  if (existing) throw new AppError(409, 'Role name already exists')

  return prisma.adminRole.create({
    data: {
      name: input.name,
      description: input.description,
      permissions: input.permissions,
    },
  })
}

export async function updateRole(
  id: string,
  input: Partial<{ name: string; description: string; permissions: AdminPermission[] }>
) {
  const role = await prisma.adminRole.findUnique({ where: { id } })
  if (!role) throw new AppError(404, 'Role not found')
  if (role.isSystem) throw new AppError(400, 'System roles cannot be modified')

  if (input.name && input.name !== role.name) {
    const existing = await prisma.adminRole.findUnique({ where: { name: input.name } })
    if (existing) throw new AppError(409, 'Role name already exists')
  }

  return prisma.adminRole.update({ where: { id }, data: input })
}

export async function deleteRole(id: string) {
  const role = await prisma.adminRole.findUnique({ where: { id } })
  if (!role) throw new AppError(404, 'Role not found')
  if (role.isSystem) throw new AppError(400, 'System roles cannot be deleted')

  await prisma.$transaction([
    prisma.user.updateMany({ where: { adminRoleId: id }, data: { adminRoleId: null } }),
    prisma.adminRole.delete({ where: { id } }),
  ])

  return { deleted: true }
}

export async function assignRoleToUser(userId: string, adminRoleId: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, 'User not found')
  if (user.role !== 'ADMIN') throw new AppError(400, 'Only admin users can be assigned roles')

  if (adminRoleId) {
    const role = await prisma.adminRole.findUnique({ where: { id: adminRoleId } })
    if (!role) throw new AppError(404, 'Role not found')
  }

  return prisma.user.update({
    where: { id: userId },
    data: { adminRoleId },
    select: { id: true, email: true, adminRoleId: true },
  })
}

export async function listAdminUsers() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    include: { adminRole: true },
    orderBy: { createdAt: 'asc' },
  })
  return admins.map((a) => ({
    id: a.id,
    email: a.email,
    isActive: a.isActive,
    role: a.adminRole
      ? { id: a.adminRole.id, name: a.adminRole.name, permissions: a.adminRole.permissions }
      : null,
    createdAt: a.createdAt,
  }))
}

export async function getPermissionsCatalog() {
  return Object.values(AdminPermission)
}
