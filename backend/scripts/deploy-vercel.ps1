#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') {
    Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
  }
}

$env:DATABASE_URL | npx vercel@latest env add DATABASE_URL production --force
$env:JWT_SECRET | npx vercel@latest env add JWT_SECRET production --force
npx vercel@latest deploy --prod --yes
