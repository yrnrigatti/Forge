'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      console.log('Tentando registrar usuário:', email)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Primeiro, teste a conexão
      const { data: testData, error: testError } = await supabase.auth.getSession()
      console.log('Teste de conexão:', { testData, testError })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Resposta completa do Supabase:', { data, error })

      if (error) {
        console.error('Erro detalhado:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        })
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Database error')) {
          setError('Erro no banco de dados. Verifique as configurações do Supabase.')
        } else if (error.message.includes('Invalid email')) {
          setError('Email inválido. Verifique o formato.')
        } else {
          setError(`Erro: ${error.message}`)
        }
      } else {
        console.log('Usuário registrado com sucesso:', data)
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Erro na requisição:', err)
      setError('Erro interno do servidor. Verifique as configurações do Supabase.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#FF6B35]">
            Cadastro Realizado! ✅
          </CardTitle>
          <CardDescription>
            Verifique seu email para confirmar a conta.
            Redirecionando para o login...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-[#FF6B35]">
          Forge 🏋️‍♂️
        </CardTitle>
        <CardDescription>
          Crie sua conta para começar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="text-sm text-[#FF3D00] text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#A3A3A3]">
            Já tem uma conta?{' '}
            <Link
              href="/auth/login"
              className="text-[#FF6B35] hover:underline font-medium"
            >
              Faça login
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}