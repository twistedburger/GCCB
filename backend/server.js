const express = require('express')
const app = express()
const db = require('./db')
const port = 3000

app.get('/', (req, res) => {
  res.send('Welcome to GCCB!')
})

app.get('/sample_query', (req, res) => {
  db.query('SELECT *', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
})

app.get('/api/events', (req, res) => {
  db.query('SELECT * FROM event', (error, results) => {
    if (error) {
      console.error('Error fetching events:', error)
      res.status(500).json({ error: 'Failed to fetch events' })
      return
    }
    console.log('Events fetched:', results.rows)
    res.status(200).json(results.rows)
  })
})

app.listen(port, () => {
  console.log(`GCCB Backend listening on port ${port}`)
})
