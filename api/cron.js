import crypto from 'node:crypto'
import webpush from 'web-push'
import { kv } from '@vercel/kv'

const isHabitPausedOnDate = (habit, date) => {
  if (!habit?.pausedUntil) return false
  const day = date.toISOString().split('T')[0]
  return habit.pausedUntil >= day
}

const getHabitDays = (habit) => habit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]

const isHabitScheduledOnDay = (habit, dayKey) => getHabitDays(habit).includes(dayKey)

const getLocalNow = (tzOffsetMinutes) => {
  const now = new Date()
  if (typeof tzOffsetMinutes !== 'number') return now
  return new Date(now.getTime() - tzOffsetMinutes * 60 * 1000)
}

const shouldFireNow = (habit, localNow) => {
  if (!habit) return false
  if (habit.allDay) return false

  const [endHour, endMin] = String(habit.endTime || '').split(':').map(Number)
  if (!Number.isFinite(endHour) || !Number.isFinite(endMin)) return false

  const isSameMinute = localNow.getHours() === endHour && localNow.getMinutes() === endMin
  if (!isSameMinute) return false

  const dayKey = localNow.getDay()
  if (!isHabitScheduledOnDay(habit, dayKey)) return false
  if (isHabitPausedOnDate(habit, localNow)) return false

  return true
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

  if (!vapidPublicKey || !vapidPrivateKey) {
    res.status(500).json({ error: 'missing_vapid_env' })
    return
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const now = new Date()
  const sent = []
  const failed = []

  try {
    const devices = await kv.hgetall('push:devices')
    const entries = devices ? Object.entries(devices) : []

    // De-dupe for safety (in case of weird KV values)
    const seen = new Set()

    for (const [id, value] of entries) {
      if (seen.has(id)) continue
      seen.add(id)

      let record
      try {
        record = JSON.parse(value)
      } catch (e) {
        continue
      }

      const sub = record?.subscription
      if (!sub?.endpoint) continue

      const localNow = getLocalNow(record.tzOffsetMinutes)

      const habits = Array.isArray(record.habits) ? record.habits : []
      const dueHabits = habits.filter((h) => shouldFireNow(h, localNow))
      if (dueHabits.length === 0) continue

      // Prevent double-send within the same minute
      const minuteKey = `${now.toISOString().slice(0, 16)}Z`

      for (const habit of dueHabits) {
        const dedupeKey = crypto
          .createHash('sha256')
          .update(`${id}:${habit.id}:${minuteKey}`)
          .digest('hex')

        const alreadySent = await kv.get(`push:sent:${dedupeKey}`)
        if (alreadySent) continue

        const payload = JSON.stringify({
          title: 'Habit Buddy',
          body: 'So.... Did you do it? :)',
          tag: `habit-end-${habit.id}`,
          data: { habitId: habit.id },
        })

        try {
          await webpush.sendNotification(sub, payload)
          await kv.set(`push:sent:${dedupeKey}`, '1', { ex: 60 * 10 })
          sent.push({ id, habitId: habit.id })
        } catch (e) {
          failed.push({ id, habitId: habit.id })
        }
      }
    }

    res.status(200).json({ ok: true, sent, failed })
  } catch (e) {
    res.status(500).json({ error: 'server_error' })
  }
}
