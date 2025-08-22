'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#FF6B35] text-lg font-medium">
          Carregando...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1F1F1F] border-[#2C2C2C]">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#FF6B35]">
              Forge
            </CardTitle>
            <CardDescription className="text-[#A3A3A3]">
              Seu companheiro para treinos de academia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-[#FF6B35] hover:bg-[#FF3D00] text-white">
                Fazer Login
              </Button>
            </Link>
            <Link href="/auth/register" className="block">
              <Button variant="secondary" className="w-full bg-[#2C2C2C] text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35] hover:text-white">
                Criar Conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se chegou aqui, está redirecionando
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-[#FF6B35] text-lg font-medium">
        Redirecionando...
      </div>
    </div>
  )
}
