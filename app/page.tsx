'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  const { user, loading, signOut } = useAuth()

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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#FF6B35]">
              Forge 🏋️‍♂️
            </CardTitle>
            <CardDescription>
              Seu companheiro para treinos de academia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login" className="block">
              <Button className="w-full">
                Fazer Login
              </Button>
            </Link>
            <Link href="/auth/register" className="block">
              <Button variant="secondary" className="w-full">
                Criar Conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#FF6B35]">
            Forge 🏋️‍♂️
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-[#A3A3A3]">
              Olá, {user.email}
            </span>
            <Button 
              variant="secondary" 
              onClick={signOut}
            >
              Sair
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/exercises">
            <Card className="hover:border-[#FF6B35] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-[#FF6B35]">Exercícios</CardTitle>
                <CardDescription>
                  Gerencie seus exercícios
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/workouts">
            <Card className="hover:border-[#FF6B35] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-[#FF6B35]">Treinos</CardTitle>
                <CardDescription>
                  Crie e edite treinos
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/sessions">
            <Card className="hover:border-[#FF6B35] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-[#FF6B35]">Sessões</CardTitle>
                <CardDescription>
                  Registre seus treinos
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="hover:border-[#FF6B35] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-[#FF6B35]">Histórico</CardTitle>
                <CardDescription>
                  Veja seu progresso
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
