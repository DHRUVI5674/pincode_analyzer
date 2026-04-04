#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

const tests = [
  {
    name: '1. Get States',
    path: '/states',
    method: 'GET'
  },
  {
    name: '2. Get Districts (DELHI)',
    path: '/states/DELHI/districts',
    method: 'GET'
  },
  {
    name: '3. Get Taluks (DELHI/Central Delhi)',
    path: '/states/DELHI/districts/Central%20Delhi/taluks',
    method: 'GET'
  },
  {
    name: '4. Get Pincodes (filtered)',
    path: '/pincodes?state=DELHI&district=Central%20Delhi&taluk=Delhi&limit=5',
    method: 'GET'
  },
  {
    name: '5. Search API',
    path: '/search?q=Delhi',
    method: 'GET'
  },
  {
    name: '6. Get Dashboard Stats',
    path: '/stats',
    method: 'GET'
  },
  {
    name: '7. Get Nearby (sample)',
    path: '/nearby?latitude=28.6139&longitude=77.2090&radius=50',
    method: 'GET'
  },
  {
    name: '8. Get Stats by State',
    path: '/stats/bystate',
    method: 'GET'
  },
  {
    name: '9. Get Pincode Detail',
    path: '/pincode/110001',
    method: 'GET'
  }
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Running Feature Tests...\n');
  console.log('='.repeat(80));

  for (const test of tests) {
    try {
      console.log(`\n✓ ${test.name}`);
      const result = await makeRequest(test.path);
      
      if (result.status === 200) {
        let preview = '';
        if (typeof result.data === 'object') {
          if (Array.isArray(result.data)) {
            preview = `Array with ${result.data.length} items`;
            if (result.data.length > 0 && typeof result.data[0] === 'string') {
              preview += `: [${result.data.slice(0, 3).join(', ')}${result.data.length > 3 ? ', ...' : ''}]`;
            }
          } else if (result.data.data) {
            preview = `${result.data.data.length || 0} records found`;
          } else if (result.data.total !== undefined) {
            preview = `Total: ${result.data.total}`;
          } else {
            preview = JSON.stringify(result.data).substring(0, 100);
          }
        }
        console.log(`  Status: ${result.status} ${preview}`);
      } else {
        console.log(`  ❌ Status: ${result.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Test suite completed!\n');
}

runTests().catch(console.error);
