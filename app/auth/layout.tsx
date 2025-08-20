import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticação - Forge',
  description: 'Entre ou cadastre-se no Forge para gerenciar seus treinos',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}