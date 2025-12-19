self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    try {
      data = { body: event.data ? event.data.text() : '' }
    } catch (e2) {
      data = {}
    }
  }

  const title = data.title || 'Habit Buddy'
  const options = {
    body: data.body || 'So.... Did you do it? :)',
    tag: data.tag || 'habit-buddy',
    renotify: false,
    data: data.data || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const urlToOpen = '/'
      const hadWindow = clientsArr.some((client) => {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          client.focus()
          return true
        }
        return false
      })

      if (!hadWindow && self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
      return undefined
    })
  )
})
