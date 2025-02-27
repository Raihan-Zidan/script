const GITHUB_TOKEN = "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"; // Ganti dengan token GitHub Anda
const GITHUB_REPO = "Raihan-Zidan/script";
const FILE_PATH = "data.json";
const SITE_TO_CRAWL = "https://kompas.com";

async function crawlWebsite() {
  const response = await fetch(SITE_TO_CRAWL);
  const html = await response.text();

  // Ekstrak data dari halaman (contoh: daftar link)
  const links = [...html.matchAll(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g)].map(m => m[1]);

  return { timestamp: new Date().toISOString(), links };
}

async function updateGitHub(data) {
  const content = JSON.stringify(data, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  // Cek apakah file sudah ada di GitHub
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
  });

  const json = await res.json();
  const sha = json.sha; // SHA diperlukan untuk update file

  // Commit perubahan ke GitHub
  await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify({
      message: `Update data ${new Date().toISOString()}`,
      content: encodedContent,
      sha,
    }),
  });
}

// Menangani permintaan HTTP biasa
export default {
  async fetch(request) {
    const data = await crawlWebsite();
    await updateGitHub(data);
    return new Response(JSON.stringify({ status: "success", data }), { headers: { "Content-Type": "application/json" } });
  },

  // Menangani event schedule dari Cloudflare Cron Triggers
  async scheduled(event) {
    console.log("Worker berjalan sesuai jadwal:", event.cron);
    const data = await crawlWebsite();
    await updateGitHub(data);
  },
};
