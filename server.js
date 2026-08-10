import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))

// SPA fallback: serve index.html for client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Golosinas del Remate server running on port ${PORT}`)
})
