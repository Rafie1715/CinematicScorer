import { defineConfig, loadEnv } from 'vite'
import { Buffer } from 'node:buffer'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const spotifyTokenProxy = (env) => ({
  name: 'spotify-token-proxy',
  configureServer(server) {
    server.middlewares.use('/api/spotify-token', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      const clientId = env.SPOTIFY_CLIENT_ID || env.VITE_SPOTIFY_CLIENT_ID
      const clientSecret = env.SPOTIFY_CLIENT_SECRET || env.VITE_SPOTIFY_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Spotify credentials are not configured on server' }))
        return
      }

      try {
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        })

        const data = await response.json()
        res.statusCode = response.status
        res.setHeader('Content-Type', 'application/json')

        if (!response.ok) {
          res.end(JSON.stringify({ error: 'Failed to request Spotify token', detail: data }))
          return
        }

        res.end(JSON.stringify({ access_token: data.access_token, expires_in: data.expires_in }))
      } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Unexpected token endpoint error', detail: String(error) }))
      }
    })
  },
})

const lyricsProxy = () => ({
  name: 'lyrics-proxy',
  configureServer(server) {
    const tryLyricsOvh = async (artist, title) => {
      const targetUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      const response = await fetch(targetUrl)

      if (!response.ok) return { ok: false, source: 'lyrics.ovh', lyrics: '' }

      const data = await response.json().catch(() => ({}))
      const lyrics = typeof data.lyrics === 'string' ? data.lyrics : ''
      return { ok: Boolean(lyrics.trim()), source: 'lyrics.ovh', lyrics }
    }

    const tryLrcLib = async (artist, title) => {
      const targetUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
      const response = await fetch(targetUrl)

      if (!response.ok) return { ok: false, source: 'lrclib', lyrics: '' }

      const data = await response.json().catch(() => ({}))
      const lyrics = typeof data.plainLyrics === 'string' ? data.plainLyrics : ''
      return { ok: Boolean(lyrics.trim()), source: 'lrclib', lyrics }
    }

    server.middlewares.use('/api/lyrics', async (req, res) => {
      if (req.method !== 'GET') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      const requestUrl = new URL(req.url || '', 'http://localhost')
      const artist = (requestUrl.searchParams.get('artist') || '').trim()
      const title = (requestUrl.searchParams.get('title') || '').trim()

      if (!artist || !title) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'artist and title query are required' }))
        return
      }

      try {
        res.setHeader('Content-Type', 'application/json')
        const ovhResult = await tryLyricsOvh(artist, title)
        if (ovhResult.ok) {
          res.statusCode = 200
          res.end(JSON.stringify({ status: 'found', lyrics: ovhResult.lyrics, source: ovhResult.source }))
          return
        }

        const lrcResult = await tryLrcLib(artist, title)
        if (lrcResult.ok) {
          res.statusCode = 200
          res.end(JSON.stringify({ status: 'found', lyrics: lrcResult.lyrics, source: lrcResult.source }))
          return
        }

        res.statusCode = 404
        res.end(JSON.stringify({ status: 'not_found', lyrics: '', source: 'multi-provider' }))
      } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ status: 'error', error: String(error), lyrics: '', source: 'multi-provider' }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), spotifyTokenProxy(env), lyricsProxy()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('recharts')) return 'charting'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('axios')) return 'network'
            if (id.includes('react')) return 'react-vendor'
            return 'vendor'
          },
        },
      },
    },
  }
})
