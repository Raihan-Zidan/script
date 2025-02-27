addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Hanya izinkan akses dari domain tertentu
    const allowedOrigin = "https://raihan-zidan.github.io"; // Ganti dengan domain Anda

    const referer = request.headers.get("Referer") || "";
    
    // Cek apakah request berasal dari halaman yang diizinkan
    if (!referer.startsWith(allowedOrigin)) {
        return new Response("Unauthorized", { status: 403 });
    }
    
    let url = new URL(request.url);
    let skrip = url.searchParams.get("g");

    if (!skrip) {
        return new Response("Parameter tidak valid", { status: 400 });
    }

    // Mapping file yang boleh diakses
    const fileMap = {
        "main": "https://raihan-zidan.github.io/script.js",
        // Tambahkan file lain jika diperlukan
    };

    let targetURL = fileMap[skrip];
    if (!targetURL) {
        return new Response("File tidak ditemukan", { status: 404 });
    }

    let response = await fetch(targetURL);
    let newHeaders = new Headers(response.headers);

    // Mengatur CORS agar hanya bisa diakses dari domain tertentu
    newHeaders.set("Access-Control-Allow-Origin", allowedOrigin);

    return new Response(await response.text(), {
        status: response.status,
        headers: {
            "Content-Type": "application/javascript",
            "Access-Control-Allow-Origin": allowedOrigin, 
            "Cache-Control": "no-store"
        }
    });
}
