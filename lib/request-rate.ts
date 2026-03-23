import type { SupabaseClient } from '@supabase/supabase-js'

export async function consumeRateLimit(
  supabase: SupabaseClient,
  action: string,
  scopeKey: string,
  maxCount: number,
  windowMinutes: number
) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

  const { data, error } = await supabase
    .from('request_rate_limits')
    .select('*')
    .eq('action', action)
    .eq('scope_key', scopeKey)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from('request_rate_limits')
      .insert({
        action,
        scope_key: scopeKey,
        count: 1,
        window_start: now.toISOString(),
        updated_at: now.toISOString(),
      })

    if (insertError) {
      throw new Error(insertError.message)
    }

    return
  }

  const existingWindowStart = new Date(data.window_start)

  if (existingWindowStart < windowStart) {
    const { error: resetError } = await supabase
      .from('request_rate_limits')
      .update({
        count: 1,
        window_start: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', data.id)

    if (resetError) {
      throw new Error(resetError.message)
    }

    return
  }

  if (Number(data.count) >= maxCount) {
    throw new Error('RATE_LIMIT_EXCEEDED')
  }

  const { error: updateError } = await supabase
    .from('request_rate_limits')
    .update({
      count: Number(data.count) + 1,
      updated_at: now.toISOString(),
    })
    .eq('id', data.id)

  if (updateError) {
    throw new Error(updateError.message)
  }
}
