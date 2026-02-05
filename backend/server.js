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

app.listen(port, () => {
  console.log(`GCCB Backend listening on port ${port}`)
})
