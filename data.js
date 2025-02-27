export default {
    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === "/search") {
            return await handleSearch(request);
        }

        return new Response(generateHTML(), {
            headers: { "Content-Type": "text/html" }
        });
    }
};

async function handleSearch(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const hl = searchParams.get("hl") || "id";
    const tbm = searchParams.get("tbm") || ""; // Default pencarian web

    if (!q) {
        return new Response(generateHTML("Silakan masukkan kata kunci pencarian.", ""), {
            headers: { "Content-Type": "text/html" }
        });
    }

    // Buat URL API
    const apiUrl = `https://datasearch.raihan-zidan2709.workers.dev/api?q=${encodeURIComponent(q)}&hl=${hl}&tbm=${tbm}`;

    try {
        const response = await fetch(apiUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        console.log(response.status);
        if (!response.ok) {
            return new Response(generateHTML("Terjadi kesalahan dalam pencarian.", q), {
                headers: { "Content-Type": "text/html" }
            });
        }

        const results = await response.json();

        return new Response(generateHTML(results, q), {
            headers: { "Content-Type": "text/html" }
        });

    } catch (error) {
        return new Response(generateHTML("Gagal mengambil data dari API.", q), {
            headers: { "Content-Type": "text/html" }
        });
        console.log(error.message);
    }
}

// Fungsi untuk membuat HTML berdasarkan hasil pencarian
function generateHTML(results, query) {
    const title = query ? `${query} - Pencarian` : "Mesin Pencarian";

    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .search-box { display: flex; gap: 10px; }
            input[type="text"] { flex-grow: 1; padding: 10px; }
            button { padding: 10px; cursor: pointer; }
            .results { margin-top: 20px; }
            .result-item { margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .thumbnail { width: 100px; height: auto; display: block; margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Pencarian</h1>
            <form action="/search" method="GET" class="search-box">
                <input type="text" name="q" value="${query}" placeholder="Cari sesuatu...">
                <button type="submit">Cari</button>
            </form>

            ${results ? renderResults(results) : "<p>Silakan masukkan kata kunci untuk mencari.</p>"}
        </div>
    </body>
    </html>
    `;
}

// Fungsi untuk merender hasil pencarian dalam HTML
function renderResults(results) {
    return results;
    if (!results.items || results.items.length === 0) {
        return `<p>Tidak ada hasil ditemukan.</p>`;
    }

    return `
    <div class="results">
        ${results.items.map(item => `
            <div class="result-item">
                <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                <p>${item.snippet}</p>
                <small>${item.displayLink}</small>
                ${item.pagemap?.cse_thumbnail?.[0]?.src ? `<img class="thumbnail" src="${item.pagemap.cse_thumbnail[0].src}" alt="Thumbnail">` : ""}
            </div>
        `).join('')}
    </div>
    `;
        }

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  let logs = [];
  
  try {
    logs.push("Worker executed at: " + new Date().toISOString());
    
    // Simulasi error
    let error = new Error("Contoh error!");
    logs.push("Error: " + error.message);
    
    return new Response(logs.join("\n"), { status: 200 });
  } catch (err) {
    logs.push("Unhandled error: " + err.message);
    return new Response(logs.join("\n"), { status: 500 });
  }
}
