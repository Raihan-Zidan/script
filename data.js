export default {
  async fetch(request) {

    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/search")) {
      return await searchindex(request);
    } else {
      return mainpage(request);
    }
  },
};

async function searchindex(request) {
  const url = new URL(request.url)

    const query = url.searchParams.get('q') // Ambil parameter 'q' dari URL
    const tbm = url.searchParams.get('tbm') || '' // Ambil parameter 'tbm' dari URL (opsional)
    const hl = url.searchParams.get("hl")
    const gl = url.searchParams.get("gl")

    if (!query) {
      return new Response('Query parameter "q" is required', {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      })
    }

    const apikey=["AIzaSyCJ3RgcZOxOm_V1hq-UXCJwPsWquHggQrg","AIzaSyDuBTV5q0NAgfSY-2X9h5-ggbrX-a3EJBU","AIzaSyB7eZUGjFCrSPEEI9OlDmtRW5fRTQIKIus","AIzaSyC1etlk90G0YK1pNmblThRrIpYXWVCe8no","AIzaSyAeibL6090vetveJ2IxkZ0h8JpmCUAEFAU","AIzaSyBOETA8ym9-I5zMAq7IoEhQ1p4PajPvzHk","AIzaSyBeCeoUn9efByemCErnTfNOW85H6WhUU8Q","AIzaSyDJAlDofWRoODKtvr4gtDkHYNAHPZzSVX0","AIzaSyDYZQDK3--oAlN9P80kFbr5Ae81Xv4r4Ew","AIzaSyDBficXMaK97bS7ys4mAGvz5tLwwBSKbbg","AIzaSyBK7tP0QHWR0x4YUd71sN298A4raMfLqKY","AIzaSyD4KHQg1v9wFVlaKEVVVlZpiq8Y8L4UouI","AIzaSyBj7aEZNIwRQG2cjuHZyPfW1UNywqsMcNo","AIzaSyCmS3naxRClDgCH_ugTbn6dSqtArX0xj2o","AIzaSyBtnDuoWCx30xG2gmUgRdB_pqGUzdr7s-A","AIzaSyD69KZdQRASdg0QxpOA74adD4HeFRgHwx8","AIzaSyDKPUq-VyTWsEA6PTozWnMEwNes3fu3CSY","AIzaSyA-ZFRhlpU4PBS10Kp5Ipp6UD4xK--M-j8","AIzaSyBni04n3gqNYKqAvtzNSWhau9LOoNzRFj4","AIzaSyAB3o1QppoePI655jiTC3ArSBfQs_SuGyw","AIzaSyAIyON_dQEybmn0HVilGHnPG2Hz0kheatk","AIzaSyBIWWb7muhPm7yo4QPq1vcqi4XWaNtIJOY","AIzaSyBm9AN4slsELMKW8fL401ZNC6ahIzWHjuc","AIzaSyA8uJOYnA1ohf_7qIKJ15Evpyldq3CVl9M","AIzaSyDgDhEyznphPnYHWQzIqiVJfkgwrxo2-2A"],
    ytapikey=["AIzaSyDl_e_6hP6mKPXmzXbahlduZG3ErglkHSY","AIzaSyAqc7T67GDJ208Y8CvR8YaPrNZlzKa2XbE"];

    let googleSearchURL;
    if (tbm === "vid") {
      const YtAPIKey = ytapikey[Math.floor(Math.random() * ytapikey.length)];
      googleSearchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${YtAPIKey}`;
      
    } else {
      const googleAPIKey = apikey[Math.floor(Math.random() * apikey.length)];
      const googleCX = tbm === "nws" ? "f7113f6d71c8f48c8" : "435bdb05f0b5e47bb";
      googleSearchURL = `https://www.googleapis.com/customsearch/v1?key=${googleAPIKey}&cx=${googleCX}&q=${encodeURIComponent(query)}`;
      
      if (gl) googleSearchURL += `&gl=${gl}`;
      if (hl) googleSearchURL += `&hl=${hl}`;
    }

    try {
      const response = await fetch(googleSearchURL)

      // Periksa apakah respons dari API valid
      if (!response.ok) {
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          url: googleSearchURL
        }
        throw new Error(`API returned an error: ${JSON.stringify(errorDetails)}`)
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
      const q = query;
      const htmlResponse = sethtml(`

          ${data.items.map(item => `
  <div class="VtuHV Kj7VF tab-result eb8xCva"><div class="tab-link"  data-number=""><a href="${item.link}"><div class="top"><div class="favicon"><img src="https://datasearch.raihan-zidan2709.workers.dev/favicon?url=${item.link}"></div><div class="link-rw"><div class="link"></div><div class="link k">https://${item.displayLink}</div></div></div><div class="title">${item.title}</div></a></div><div class="btm-snpt"><div class="snippet">${item.snippet}</div></div></div>
  
          `).join('')}
      `, query)
            const responseClone = new Response(htmlResponse, { headers: { "Content-Type": "text/html" } });

      return new HTMLRewriter()
        .on(".search-item", new SearchItemHandler(tbm))
        .transform(responseClone);
      
    } catch (error) {
      // Tangani error dan tampilkan pesan error di halaman HTML
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error { color: red; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Error</h1>
          <div class="error">${error.message}</div>
          <p>Please check the API URL and try again.</p>
        </body>
        </html>
      `

      return new Response(errorHtml, {
        headers: { 'Content-Type': 'text/html' },
        status: 500
      })
    }
  

  // Jika pathname bukan /search, tampilkan halaman pencarian sederhana

}

function mainpage(request) {
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
        <input type="search" name="q" placeholder="Enter your search query" required>
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

function sethtml(html, query) {
  return `
          <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${query} - Search</title>
          <link rel="stylesheet" href="https://raihan-zidan.github.io/u3086.css" />
        </head>
        <body>
<div class="root" id="main-bx"><div class="kwuND KwbMG"><div class="cbKRN"></div></div><div class="xzBdP"></div><div class="hVhvp BbmqH"><div class="KArDf"><div class="header"><div class="search-box"><div class="search-field"><input type="search" id="sear_21829_input" value="${q}" name="q" class="search-input" autocorrect="off" autocomplete="off" autocapitalize="off" placeholder="Type to search..."><div role="button" class="search-toggle" id="inpbtun" name="toggle-submit"></div><div role="button" class="cleartext" id="inpbtun" name="rmvtex"></div></div></div><div class="search-menu"><div class="search-item"><a href="/search?q=${encodeURIComponent(q).replace(/\%20/g,'+')}" class="tab-wrapper" tab-id="all"><div class="label"><svg width="16" height="16" viewBox="0 0 16 16" fill="#6e7780" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 1C2.68629 1 0 3.68629 0 7C0 10.3137 2.68629 13 6 13C7.64669 13 9.13845 12.3366 10.2226 11.2626L14.7873 14.8403C15.1133 15.0959 15.5848 15.0387 15.8403 14.7127C16.0958 14.3867 16.0387 13.9153 15.7126 13.6597L11.1487 10.0826C11.6892 9.18164 12 8.12711 12 7C12 3.68629 9.31371 1 6 1ZM1.5 7C1.5 4.51472 3.51472 2.5 6 2.5C8.48528 2.5 10.5 4.51472 10.5 7C10.5 9.48528 8.48528 11.5 6 11.5C3.51472 11.5 1.5 9.48528 1.5 7Z"></path></svg><span>All</span></div></a></div><div class="search-item"><a href="/search?q=${encodeURIComponent(q).replace(/\%20/g,'+')}&tbm=isch" class="tab-wrapper" tab-id="images"><div class="label"><svg width="16" height="16" viewBox="0 0 16 16" fill="#6e7780" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 1C1.45507 1 0 2.45507 0 4.25V11.75C0 13.5449 1.45507 15 3.25 15H12.75C14.5449 15 16 13.5449 16 11.75V10.2593C16.0001 10.2531 16.0001 10.2469 16 10.2407V4.25C16 2.45507 14.5449 1 12.75 1H3.25ZM14.5 8.43928V4.25C14.5 3.2835 13.7165 2.5 12.75 2.5H3.25C2.2835 2.5 1.5 3.2835 1.5 4.25V11.75C1.5 11.9563 1.5357 12.1543 1.60126 12.3381L5.96967 7.96967C6.26256 7.67678 6.73744 7.67678 7.03033 7.96967L8.00003 8.93937L10.9697 5.96967C11.2626 5.67678 11.7375 5.67678 12.0304 5.96967L14.5 8.43928ZM9.06069 10L10.0303 10.9697C10.3232 11.2626 10.3232 11.7374 10.0303 12.0303C9.73744 12.3232 9.26256 12.3232 8.96967 12.0303L6.5 9.56066L2.66192 13.3987C2.84572 13.4643 3.04369 13.5 3.25 13.5H12.75C13.7165 13.5 14.5 12.7165 14.5 11.75V10.5606L11.5001 7.56066L9.06069 10Z"></path></svg><span>Images</span></div></a></div><div class="search-item"><a href="/search?q=${encodeURIComponent(q).replace(/\%20/g,'+')}&tbm=vid" class="tab-wrapper" tab-id="videos"><div class="label"><svg width="16" height="16" viewBox="0 0 16 16" fill="#6e7780" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.4887 5.55027C15.3801 6.63605 15.3801 9.36446 13.4887 10.4502L6.23148 14.6164C4.34816 15.6976 2 14.338 2 12.1664L2 3.83407C2 1.66248 4.34816 0.302917 6.23148 1.38408L13.4887 5.55027ZM12.7419 9.14937C13.629 8.64011 13.629 7.36041 12.7419 6.85115L5.48468 2.68496C4.60135 2.17787 3.5 2.81554 3.5 3.83407L3.5 12.1664C3.5 13.185 4.60135 13.8226 5.48468 13.3156L12.7419 9.14937Z"></path></svg><span>Videos</span></div></a></div><div class="search-item"><a href="/search?q=${encodeURIComponent(q).replace(/\%20/g,'+')}&tbm=nws" class="tab-wrapper" tab-id="news"><div class="label"><svg width="16" height="16" viewBox="0 0 22 22" fill="#6e7780"><path d="M12 11h6v2h-6v-2zm-6 6h12v-2H6v2zm0-4h4V7H6v6zm16-7.22v12.44c0 1.54-1.34 2.78-3 2.78H5c-1.64 0-3-1.25-3-2.78V5.78C2 4.26 3.36 3 5 3h14c1.64 0 3 1.25 3 2.78zM19.99 12V5.78c0-.42-.46-.78-1-.78H5c-.54 0-1 .36-1 .78v12.44c0 .42.46.78 1 .78h14c.54 0 1-.36 1-.78V12zM12 9h6V7h-6v2"></path></svg><span>News</span></div></a></div><div class="search-item"><a href="/maps?q=${encodeURIComponent(q).replace(/\%20/g,'+')}" class="tab-wrapper" tab-id="maps"><div class="label"><svg width="16" height="16" viewBox="0 0 16 16" fill="#6e7780" xmlns="http://www.w3.org/2000/svg"><path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C6.81332 0 5.65328 0.351894 4.66658 1.01118C3.67989 1.67047 2.91085 2.60754 2.45673 3.7039C2.0026 4.80026 1.88378 6.00666 2.11529 7.17054C2.35179 8.35952 2.99591 9.39906 3.73051 10.2144C5.0603 11.6902 5.95884 13.0319 6.52237 13.9981C6.80408 14.4812 7.00183 14.87 7.1277 15.1343C7.19062 15.2665 7.23554 15.3675 7.26398 15.4334C7.27819 15.4664 7.28829 15.4907 7.29444 15.5057L7.30075 15.5212L7.30129 15.5226L7.30168 15.5236C7.41829 15.8212 7.71074 16.0123 8.03018 15.9994C8.34937 15.9865 8.62531 15.7729 8.71783 15.4673L8.71818 15.4662L8.72264 15.4522C8.72711 15.4384 8.73473 15.4154 8.74578 15.3837C8.76791 15.3202 8.80379 15.2219 8.85585 15.0927C8.95997 14.8342 9.12867 14.452 9.38109 13.9769C9.88586 13.0267 10.7253 11.7051 12.0529 10.2568C12.7338 9.51391 13.6375 8.41354 13.8847 7.17054C14.1162 6.00666 13.9974 4.80026 13.5433 3.7039C13.0892 2.60754 12.3201 1.67047 11.3334 1.01118C10.3467 0.351894 9.18669 0 8 0ZM8.05642 13.2731C8.01989 13.3419 7.98488 13.409 7.95134 13.4745C7.90893 13.3994 7.86453 13.322 7.81811 13.2425C7.20975 12.1993 6.25213 10.7721 4.84488 9.21027C4.23085 8.5288 3.75511 7.72573 3.58647 6.87791C3.41284 6.00499 3.50195 5.10019 3.84254 4.27792C4.18314 3.45566 4.75992 2.75285 5.49994 2.25839C6.23996 1.76392 7.10999 1.5 8 1.5C8.89002 1.5 9.76005 1.76392 10.5001 2.25839C11.2401 2.75285 11.8169 3.45566 12.1575 4.27793C12.4981 5.10019 12.5872 6.00499 12.4135 6.87791C12.2556 7.67171 11.6276 8.50093 10.9471 9.24321C9.52471 10.7949 8.61414 12.2233 8.05642 13.2731Z"></path></svg><span>Maps</span></div></a></div></div></div></div><div class="QZjVU hWOQY"><div class="result-wrapper"><div class="main-result">
  ${html}
    </div></div></div></div></div>
        </body>
        </html>`
}

class SearchItemHandler {
  constructor(tbm) {
    this.tbm = tbm;
    this.index = 0;
  }

  element(element) {
    const selectedIndex = this.getSelectedIndex();
    if (this.index === selectedIndex) {
      element.setAttribute("class", "search-item selected");
    }
    this.index++;
  }

  getSelectedIndex() {
    if (this.tbm === "isch") return 1;
    if (this.tbm === "vid") return 2;
    if (this.tbm === "nws") return 3;
    return 0;
  }
}

function hasilpencarian(type, html) {

}
