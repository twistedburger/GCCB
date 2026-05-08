const { serverStrings } = require('../../locales/en/serverLocales')
const { getUserNotifications } = require('./NotificationQueries')
const { selectUser } = require('./UserUtils')

const handleNotifications = (req, res) => async notifications => {
  const usersToNotify = notifications.map(notification => notification.user_id)
  try {
    const user = await selectUser(req)

    if (usersToNotify.includes(user.id)) {
      const notifications = await getUserNotifications(user.id)
      res.write(`data: ${JSON.stringify({ notifications })}\n\n`)
    }
  } catch {
    res.write(
      `data: ${JSON.stringify({ error: serverStrings.errors.generic })}\n\n`
    )
  }
}

module.exports = { handleNotifications }
