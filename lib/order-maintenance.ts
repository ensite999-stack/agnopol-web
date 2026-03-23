import type { SupabaseClient } from '@supabase/supabase-js'
import { fiveMinutesAgoIso } from './time'

export async function expirePendingOrders(supabase: SupabaseClient) {
  const cutoff = fiveMinutesAgoIso()

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      public_note: '订单超过五分钟未支付，系统已自动取消。',
      updated_at: new Date().toISOString(),
    })
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff)

  if (error) {
    throw new Error(error.message)
  }
}
