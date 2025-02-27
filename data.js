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
    const tbm = searchParams.get("tbm") || "web"; // Default pencarian web

    if (!q) {
        return new Response(generateHTML("Silakan masukkan kata kunci pencarian.", ""), {
            headers: { "Content-Type": "text/html" }
        });
    }

    // Buat URL API
    const apiUrl = `https://datasearch.raihan-zidan2709.workers.dev/api?q=${encodeURIComponent(q)}&hl=${hl}&tbm=${tbm}`;

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "User-Agent": "Cloudflare-Worker"
            }
        });

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
    }
}

// Fungsi untuk membuat HTML berdasarkan hasil pencarian
function generateHTML(results = null, query = "") {
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
