const TOKEN_KEY = 'namma-sandhai-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'FARMER':
      return '/farmer/dashboard'
    case 'BUYER':
      return '/buyer/dashboard'
    case 'ADMIN':
      return '/admin'
    default:
      return '/'
  }
}
