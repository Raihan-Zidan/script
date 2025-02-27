addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Jika pathname adalah /search, tampilkan hasil pencarian
  if (url.pathname === '/search') {
    const query = url.searchParams.get('q') // Ambil parameter 'q' dari URL
    const tbm = url.searchParams.get('tbm') || '' // Ambil parameter 'tbm' dari URL (opsional)

    if (!query) {
      return new Response('Query parameter "q" is required', {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      })
    }

    const apiUrl = `https://datasearch.raihan-zidan2709.workers.dev/api?q=${encodeURIComponent(query)}&tbm=${encodeURIComponent(tbm)}`

    try {
      const response = await fetch(apiUrl)

      // Periksa apakah respons dari API valid
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`)
      }

      // Coba parsing respons sebagai JSON
      let data
      try {
        data = await response.json()
      } catch (error) {
        // Jika parsing JSON gagal, tampilkan respons mentah dari API
        const rawResponse = await response.text()
        throw new Error(`API response is not valid JSON. Raw response: ${rawResponse}`)
      }

      // Membuat HTML untuk menampilkan hasil pencarian
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Search Results for "${query}"</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .result { margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: bold; }
            .link { color: #1a0dab; text-decoration: none; }
            .snippet { color: #4d5156; }
          </style>
        </head>
        <body>
          <h1>Search Results for "${query}"</h1>
          ${data.results.map(result => `
            <div class="result">
              <div class="title"><a href="${result.link}" class="link">${result.title}</a></div>
              <div class="snippet">${result.snippet}</div>
            </div>
          `).join('')}
        </body>
        </html>
      `

      return new Response(htmlResponse, {
        headers: { 'Content-Type': 'text/html' }
      })
    } catch (error) {
      // Tangani error dan tampilkan pesan error yang informatif
      return new Response(`Failed to fetch search results: ${error.message}`, {
        headers: { 'Content-Type': 'text/html' },
        status: 500
      })
    }
  }

  // Jika pathname bukan /search, tampilkan halaman pencarian sederhana
  const htmlForm = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Search Engine</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        form { display: flex; flex-direction: column; max-width: 400px; margin: 0 auto; }
        input { margin-bottom: 10px; padding: 10px; font-size: 16px; }
        button { padding: 10px; font-size: 16px; background-color: #1a0dab; color: white; border: none; cursor: pointer; }
        button:hover { background-color: #0b5ed7; }
      </style>
    </head>
    <body>
      <h1>My Search Engine</h1>
      <form action="/search" method="GET">
        <input type="text" name="q" placeholder="Enter your search query" required>
        <input type="text" name="tbm" placeholder="Search type (optional)">
        <button type="submit">Search</button>
      </form>
    </body>
    </html>
  `

  return new Response(htmlForm, {
    headers: { 'Content-Type': 'text/html' }
  })
          }
