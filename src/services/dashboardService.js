import { supabase } from './supabase'

export const getDashboardSnapshot = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    const { data, error } = await supabase
      .from('dashboard')
      .select('metrics,weekly_chart,recent_activity,refreshed_at,week_start,week_end')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    if (error?.code === 'PGRST116') {
      return null
    }
    throw error
  }
}

export const saveDashboardSnapshot = async (userId, snapshot) => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const payload = {
    user_id: userId,
    metrics: snapshot.metrics || {},
    weekly_chart: snapshot.weekly_chart || [],
    recent_activity: snapshot.recent_activity || [],
    week_start: snapshot.week_start || null,
    week_end: snapshot.week_end || null,
    refreshed_at: snapshot.refreshed_at || new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('dashboard')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}
