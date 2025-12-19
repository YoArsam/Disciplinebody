import crypto from 'node:crypto'
import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  try {
    const { subscription, habits, tzOffsetMinutes } = req.body || {}

    if (!subscription?.endpoint) {
      res.status(400).json({ error: 'missing_subscription' })
      return
    }

    const endpointHash = crypto.createHash('sha256').update(subscription.endpoint).digest('hex')
    const record = {
      subscription,
      habits: Array.isArray(habits) ? habits : [],
      tzOffsetMinutes: typeof tzOffsetMinutes === 'number' ? tzOffsetMinutes : null,
      updatedAt: Date.now(),
    }

    await kv.hset('push:devices', { [endpointHash]: JSON.stringify(record) })

    res.status(200).json({ ok: true, id: endpointHash })
  } catch (e) {
    res.status(500).json({ error: 'server_error' })
  }
}
