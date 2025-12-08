const { createServer } = require('https')
const { parse } = require('url')
const fs = require('fs')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, hostname: 'localhost', port: 3000 })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certs/localhost+2-key.pem'),
  cert: fs.readFileSync('./certs/localhost+2.pem'),
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, () => {
    console.log('HTTPS dev server ready: https://localhost:3000')
  })
})