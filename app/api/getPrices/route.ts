import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .single()

  if (error) {
    return Response.json({ error: error.message })
  }

  return Response.json(data)
}
