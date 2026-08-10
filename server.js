import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))

// SPA fallback: serve index.html for client-side routes
// (Express 5 / path-to-regexp v8 no longer accepts '*' routes)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(dist, 'index.html'))
  }
  next()
})

app.listen(PORT, () => {
  console.log(`Golosinas del Remate server running on port ${PORT}`)
})
