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
  db.query(
    `SELECT 
              e.*,
              u.name as creator_name 
            FROM event e
            LEFT JOIN "user" u ON u.id = e.creator_id`,
    (error, results) => {
      if (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ error: 'Failed to fetch events' })
        return
      }
      console.log('Events fetched:', results.rows)
      res.status(200).json(results.rows)
    }
  )
})

app.get('/api/routes', (req, res) => {
  db.query(
    `SELECT 
      r.*, 
      COUNT(ur.user_id) as people_going 
    FROM route r
    LEFT JOIN user_route ur ON r.id = ur.route_id
    GROUP BY r.id`,
    (error, results) => {
      if (error) {
        console.error('Error fetching routes:', error)
        res.status(500).json({ error: 'Failed to fetch routes' })
        return
      }
      console.log('Routes fetched:', results.rows)
      res.status(200).json(results.rows)
    }
  )
})

app.listen(port, () => {
  console.log(`GCCB Backend listening on port ${port}`)
})
