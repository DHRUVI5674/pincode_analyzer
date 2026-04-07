/**
 * PIN Code API Testing Script
 * Run commands in browser console to test all endpoints
 */

// ============================================
// 1. TEST STATES ENDPOINT
// ============================================
console.log('%c=== Testing States Endpoint ===', 'color: blue; font-size: 14px; font-weight: bold;');
fetch('http://localhost:5000/api/states')
  .then(r => r.json())
  .then(data => {
    console.log('✓ States loaded:', data);
    console.log(`Found ${data.length} states`);
  })
  .catch(e => console.error('✗ Error fetching states:', e));

// ============================================
// 2. TEST DISTRICTS FOR SPECIFIC STATE
// ============================================
setTimeout(() => {
  console.log('%c=== Testing Districts for GUJARAT ===', 'color: blue; font-size: 14px; font-weight: bold;');
  fetch('http://localhost:5000/api/states/GUJARAT/districts')
    .then(r => r.json())
    .then(data => {
      console.log('✓ Districts for GUJARAT:', data);
      console.log(`Found ${data.length} districts:`, data.slice(0, 5));
    })
    .catch(e => console.error('✗ Error fetching districts:', e));
}, 1000);

// ============================================
// 3. TEST TALUKS FOR SPECIFIC STATE & DISTRICT
// ============================================
setTimeout(() => {
  console.log('%c=== Testing Taluks for GUJARAT/AHMEDABAD ===', 'color: blue; font-size: 14px; font-weight: bold;');
  fetch('http://localhost:5000/api/states/GUJARAT/districts/AHMEDABAD/taluks')
    .then(r => r.json())
    .then(data => {
      console.log('✓ Taluks for AHMEDABAD:', data);
      console.log(`Found ${data.length} taluks:`, data.slice(0, 5));
    })
    .catch(e => console.error('✗ Error fetching taluks:', e));
}, 2000);

// ============================================
// 4. TEST PIN CODES WITH PAGINATION
// ============================================
setTimeout(() => {
  console.log('%c=== Testing PIN Codes with Pagination ===', 'color: blue; font-size: 14px; font-weight: bold;');
  fetch('http://localhost:5000/api/pincodes?state=GUJARAT&district=AHMEDABAD&page=1&limit=5')
    .then(r => r.json())
    .then(data => {
      console.log('✓ PIN Codes response:', data);
      console.log(`Total: ${data.total}, Page: ${data.page}, Limit: ${data.limit}, Pages: ${data.totalPages}`);
      console.log('First 3 records:', data.data.slice(0, 3));
    })
    .catch(e => console.error('✗ Error fetching PIN codes:', e));
}, 3000);

// ============================================
// 5. TEST SEARCH/AUTOCOMPLETE
// ============================================
setTimeout(() => {
  console.log('%c=== Testing Search/Autocomplete ===', 'color: blue; font-size: 14px; font-weight: bold;');
  fetch('http://localhost:5000/api/search?q=3800')
    .then(r => r.json())
    .then(data => {
      console.log('✓ Search results for "3800":', data);
    })
    .catch(e => console.error('✗ Error searching:', e));
}, 4000);

// ============================================
// 6. TEST DIFFERENT STATES
// ============================================
const statesToTest = ['MAHARASHTRA', 'TAMIL NADU', 'DELHI', 'KARNATAKA'];

statesToTest.forEach((state, index) => {
  setTimeout(() => {
    console.log(`%c=== Testing Districts for ${state} ===`, 'color: green; font-size: 12px;');
    fetch(`http://localhost:5000/api/states/${state}/districts`)
      .then(r => r.json())
      .then(data => {
        console.log(`✓ ${state}: Found ${data.length} districts`, data.slice(0, 3));
      })
      .catch(e => console.error(`✗ Error for ${state}:`, e));
  }, 5000 + (index * 1000));
});

console.log('%c📝 All tests scheduled!', 'color: purple; font-size: 14px; font-weight: bold;');
console.log('Check console for results in the next 10 seconds...');

// ============================================
// HELPER: Test specific endpoint
// ============================================
console.log('%c📌 Available Helper Functions:', 'color: orange; font-size: 12px; font-weight: bold;');
console.log('testStates() - Test states endpoint');
console.log('testDistricts(state) - Test districts for state');
console.log('testTaluks(state, district) - Test taluks');
console.log('testPincodes(state, district) - Test PIN codes');

window.testStates = () => {
  fetch('http://localhost:5000/api/states')
    .then(r => r.json())
    .then(data => {
      console.log('States:', data);
      return data;
    })
    .catch(e => console.error('Error:', e));
};

window.testDistricts = (state = 'GUJARAT') => {
  fetch(`http://localhost:5000/api/states/${state}/districts`)
    .then(r => r.json())
    .then(data => {
      console.log(`Districts for ${state}:`, data);
      return data;
    })
    .catch(e => console.error('Error:', e));
};

window.testTaluks = (state = 'GUJARAT', district = 'AHMEDABAD') => {
  fetch(`http://localhost:5000/api/states/${state}/districts/${district}/taluks`)
    .then(r => r.json())
    .then(data => {
      console.log(`Taluks for ${state}/${district}:`, data);
      return data;
    })
    .catch(e => console.error('Error:', e));
};

window.testPincodes = (state = 'GUJARAT', district = 'AHMEDABAD', page = 1, limit = 10) => {
  fetch(`http://localhost:5000/api/pincodes?state=${state}&district=${district}&page=${page}&limit=${limit}`)
    .then(r => r.json())
    .then(data => {
      console.log(`PIN codes for ${state}/${district}:`, data);
      return data;
    })
    .catch(e => console.error('Error:', e));
};

console.log('%c✓ You can now use: testStates(), testDistricts("STATE"), testTaluks("STATE", "DISTRICT"), testPincodes("STATE", "DISTRICT")', 'color: green; font-size: 12px;');
