const http = require('http');
const fetch = global.fetch || require('node-fetch');
const urls = [
  'http://127.0.0.1:5000/api/pincodes?state=MAHARASHTRA',
  'http://127.0.0.1:5000/api/pincodes?state=Maharashtra',
  'http://127.0.0.1:5000/api/pincodes?district=Mumbai',
  'http://127.0.0.1:5000/api/pincodes?district=MUMBAI'
];
(async () => {
  for (const url of urls) {
    const res = await fetch(url);
    const data = await res.json();
    console.log(url, '=> total', data.total, 'dataLen', Array.isArray(data.data) ? data.data.length : 'n/a');
  }
})();
