import { createClient } from '@supabase/supabase-js'

export async function obtenerToken(supabase: any) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || 'mock-token'
  } catch (error) {
    console.error('Error al obtener token:', error)
    return 'mock-token'
  }
}
