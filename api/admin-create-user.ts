import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const token = process.env.ADMIN_SETUP_TOKEN

  if (!url || !key) {
    res.status(500).json({ error: 'Missing env' })
    return
  }
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  if (!token || req.headers['x-setup-token'] !== token) {
    res.status(403).end()
    return
  }

  const { email, password } = req.body || {}
  if (!email || !password) {
    res.status(400).json({ error: 'Missing email/password' })
    return
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(200).json({ user_id: data.user?.id })
}