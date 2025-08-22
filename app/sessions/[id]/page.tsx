'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { sessionService } from '@/services/sessionService'
import { SessionWithDetails, Set } from '@/types/session'
import { Exercise } from '@/types/exercise'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SetForm } from '@/components/sessions/SetForm'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const { error, handleError, clearErrors } = useErrorHandler()
  
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddSetForm, setShowAddSetForm] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [editingSetId, setEditingSetId] = useState<string | null>(null)

  // Carregar sessão
  const loadSession = async () => {
    if (!user || !sessionId) return
    
    try {
      setLoading(true)
      clearErrors()
      const data = await sessionService.getSessionById(sessionId)
      setSession(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/sessions')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && sessionId) {
      loadSession()
    }
  }, [user, sessionId])

  // Handlers
  const handleAddSet = async (exerciseId: string) => {
    setSelectedExerciseId(exerciseId)
    setShowAddSetForm(true)
  }

  const handleSetSubmit = async (data: any) => {
    if (!session || !selectedExerciseId) return

    try {
      if (editingSetId) {
        await sessionService.updateSet(editingSetId, data)
      } else {
        await sessionService.addSetToSession(session.id, {
          exercise_id: selectedExerciseId,
          ...data
        })
      }
      
      await loadSession()
      setShowAddSetForm(false)
      setEditingSetId(null)
      setSelectedExerciseId(null)
    } catch (err) {
      handleError(err)
    }
  }

  const handleEditSet = (set: Set) => {
    setEditingSetId(set.id)
    setSelectedExerciseId(set.exercise_id)
    setShowAddSetForm(true)
  }

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta série?')) {
      return
    }

    try {
      await sessionService.removeSetFromSession(setId)
      await loadSession()
    } catch (err) {
      handleError(err)
    }
  }

  const handleCompleteSession = async () => {
    if (!session) return

    try {
      await sessionService.updateSession(session.id, {
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      await loadSession()
    } catch (err) {
      handleError(err)
    }
  }

  const handleContinueSession = () => {
    if (session?.workout_id) {
      router.push(`/workouts/${session.workout_id}/start?sessionId=${session.id}`)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Carregando sessão..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#121212] p-4">
        <div className="container mx-auto max-w-4xl">
          <ErrorDisplay error="Sessão não encontrada" />
        </div>
      </div>
    )
  }

  const groupedSets = session.sets?.reduce((acc, set) => {
    if (!acc[set.exercise_id]) {
      acc[set.exercise_id] = []
    }
    acc[set.exercise_id].push(set)
    return acc
  }, {} as Record<string, Set[]>) || {}

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => router.push('/sessions')}
              className="text-[#A3A3A3] border-[#2C2C2C] bg-[#1F1F1F] hover:bg-[#2C2C2C] hover:text-[#E5E5E5]"
            >
              ← Voltar para Sessões
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">
            {session.workout?.name || 'Sessão de Treino'}
          </h1>
          <p className="text-[#A3A3A3]">
            Iniciada {formatDistanceToNow(new Date(session.started_at || session.date), { addSuffix: true, locale: ptBR })}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Session Card */}
        <div className="mb-6">
          <SessionCard
            session={session}
            showActions={false}
          />
        </div>

        {/* Actions */}
        {session.status === 'active' && (
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleContinueSession}
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium px-6 py-2 rounded-lg"
            >
              Continuar Treino
            </Button>
            <Button
              onClick={handleCompleteSession}
              className="border-[#FF6B35] text-[#FF6B35] bg-transparent hover:bg-[#FF6B35] hover:text-white font-medium px-6 py-2 rounded-lg"
            >
              Finalizar Sessão
            </Button>
          </div>
        )}

        {/* Exercises and Sets */}
        <div className="space-y-6">
          {session.workout?.exercises?.map((workoutExercise) => {
            const exercise = workoutExercise.exercise
            const sets = groupedSets[exercise.id] || []
            
            return (
              <Card key={exercise.id} className="bg-[#1F1F1F] border-[#2C2C2C] rounded-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-[#E5E5E5]">{exercise.name}</CardTitle>
                      <p className="text-sm text-[#A3A3A3] mt-1">
                        {exercise.muscle_group} • {exercise.type}
                      </p>
                    </div>
                    {session.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleAddSet(exercise.id)}
                        className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium px-4 py-2 rounded-lg"
                      >
                        Adicionar Série
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {sets.length > 0 ? (
                    <div className="space-y-3">
                      <div className="hidden sm:grid grid-cols-4 gap-4 text-sm font-medium text-[#A3A3A3] pb-3 border-b border-[#2C2C2C]">
                        <span>Série</span>
                        <span>Peso (kg)</span>
                        <span>Reps</span>
                        <span>Ações</span>
                      </div>
                      {sets.map((set, index) => (
                        <div key={set.id} className="border-b border-[#2C2C2C] last:border-b-0">
                          <div className="hidden sm:grid grid-cols-4 gap-4 text-sm items-center py-3">
                            <span className="text-[#E5E5E5] font-medium">{index + 1}</span>
                            <span className="text-[#E5E5E5]">{set.weight}</span>
                            <span className="text-[#E5E5E5]">{set.reps}</span>
                            <div className="flex gap-2">
                              {session.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditSet(set)}
                                    className="text-xs px-3 py-1 text-[#FF6B35] border-[#FF6B35] bg-transparent hover:bg-[#FF6B35] hover:text-white rounded"
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeleteSet(set.id)}
                                    className="text-xs px-3 py-1 text-[#FF3D00] border-[#FF3D00] bg-transparent hover:bg-[#FF3D00] hover:text-white rounded"
                                  >
                                    Excluir
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="sm:hidden py-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#E5E5E5] font-medium text-sm">Série {index + 1}</span>
                              {session.status === 'active' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditSet(set)}
                                    className="text-xs px-2 py-1 text-[#FF6B35] border-[#FF6B35] bg-transparent hover:bg-[#FF6B35] hover:text-white rounded"
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeleteSet(set.id)}
                                    className="text-xs px-2 py-1 text-[#FF3D00] border-[#FF3D00] bg-transparent hover:bg-[#FF3D00] hover:text-white rounded"
                                  >
                                    Excluir
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between text-sm">
                              <div className="flex gap-4">
                                <span className="text-[#A3A3A3]">Peso:</span>
                                <span className="text-[#E5E5E5] font-medium">{set.weight} kg</span>
                              </div>
                              <div className="flex gap-4">
                                <span className="text-[#A3A3A3]">Reps:</span>
                                <span className="text-[#E5E5E5] font-medium">{set.reps}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#A3A3A3] mb-4">
                        Nenhuma série registrada para este exercício
                      </p>
                      {session.status === 'active' && (
                        <Button
                          onClick={() => handleAddSet(exercise.id)}
                          className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium px-4 py-2 rounded-lg"
                        >
                          Adicionar Primeira Série
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {showAddSetForm && selectedExerciseId && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1F1F1F] border border-[#2C2C2C] rounded-lg p-6 w-full max-w-md">
              <SetForm
                exercise={session.workout?.exercises?.find(we => we.exercise.id === selectedExerciseId)?.exercise as Exercise}
                onSubmit={handleSetSubmit}
                onCancel={() => {
                  setShowAddSetForm(false)
                  setEditingSetId(null)
                  setSelectedExerciseId(null)
                }}
                submitLabel={editingSetId ? 'Atualizar Série' : 'Adicionar Série'}
                isUpdate={!!editingSetId}
                initialData={editingSetId ? session.sets?.find(s => s.id === editingSetId) : undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}