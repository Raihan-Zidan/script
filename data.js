const GITHUB_REPO = "Raihan-Zidan/script";
const FILE_PATH = "data.json";
const SITE_TO_CRAWL = "https://kompas.com";

// Fungsi untuk mengambil HTML dari website
async function crawlWebsite() {
  const response = await fetch(SITE_TO_CRAWL);
  const html = await response.text();

  // Ekstrak link dari halaman
  const links = [...html.matchAll(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g)].map(m => m[1]);

  return { timestamp: new Date().toISOString(), links };
}

// Fungsi untuk mendapatkan SHA dari file di GitHub
async function getCurrentSHA(env) {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    });

    if (response.status === 404) {
      console.log("File belum ada, membuat baru...");
      return null; // Jika file belum ada, tidak perlu sha
    }

    const json = await response.json();
    return json.sha;
  } catch (error) {
    console.error("Error mendapatkan SHA:", error);
    return null;
  }
}

// Fungsi untuk memperbarui file di GitHub
async function updateGitHub(data, env) {
  try {
    const content = JSON.stringify(data, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    const sha = await getCurrentSHA(env); // Ambil SHA sebelum update

    // Commit perubahan ke GitHub
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { Authorization: `token ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Update data ${new Date().toISOString()}`,
        content: encodedContent,
        sha: sha || undefined, // Jika file belum ada, sha tidak dikirim
      }),
    });

    const json = await response.json();
    console.log("GitHub Update Response:", json);
  } catch (error) {
    console.error("Error mengupdate GitHub:", error);
  }
}

// Menangani permintaan HTTP
export default {
  async fetch(request, env) {
    console.log("Fetch request diterima");
    const data = await crawlWebsite();
    await updateGitHub(data, env);
    return new Response(JSON.stringify({ status: "success", data }), { headers: { "Content-Type": "application/json" } });
  },

  // Menangani event schedule dari Cloudflare Cron Triggers
  async scheduled(event, env) {
    console.log("Worker berjalan sesuai jadwal:", event.cron);
    const data = await crawlWebsite();
    await updateGitHub(data, env);
  },
};
      
