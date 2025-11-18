/**
 * SITEMAP TESTING SCRIPT
 * 
 * Tests the dynamic sitemap generation locally and validates output
 * 
 * Usage:
 *   npm run test:sitemap
 * 
 * Requirements:
 *   - Dev server must be running on http://localhost:5173
 *   - Run: npm run dev (in separate terminal)
 */

import http from 'http';
import https from 'https';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Fetch sitemap from local server
 * @param {string} url - URL to fetch
 * @returns {Promise<{statusCode: number, headers: object, body: string}>}
 */
function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract URLs from sitemap XML
 * @param {string} xml - Sitemap XML string
 * @returns {Array<string>} Array of URLs
 */
function extractUrls(xml) {
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;
  
  while ((match = urlRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Main test function
 */
async function testSitemap() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   SITEMAP TESTING - MIND MHIRC                 ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  const testUrl = 'http://localhost:5173/sitemap.xml';
  let hasErrors = false;

  try {
    console.log(`${colors.blue}📡 Fetching sitemap from: ${testUrl}${colors.reset}\n`);
    
    const response = await fetchSitemap(testUrl);
    
    // Test 1: Status Code
    console.log(`${colors.yellow}TEST 1: HTTP Status Code${colors.reset}`);
    if (response.statusCode === 200) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Status: ${response.statusCode}\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Status: ${response.statusCode} (expected 200)\n`);
      hasErrors = true;
    }
    
    // Test 2: Content-Type
    console.log(`${colors.yellow}TEST 2: Content-Type Header${colors.reset}`);
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('xml')) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Content-Type: ${contentType}\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Content-Type: ${contentType} (expected application/xml)\n`);
      hasErrors = true;
    }
    
    // Test 3: XML Declaration
    console.log(`${colors.yellow}TEST 3: XML Declaration${colors.reset}`);
    if (response.body.startsWith('<?xml version=')) {
      console.log(`${colors.green}✓ PASS${colors.reset} - XML declaration found\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - XML declaration missing\n`);
      hasErrors = true;
    }
    
    // Test 4: Sitemap Namespace
    console.log(`${colors.yellow}TEST 4: Sitemap Namespace${colors.reset}`);
    if (response.body.includes('<urlset xmlns=')) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Namespace declaration found\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Namespace declaration missing\n`);
      hasErrors = true;
    }
    
    // Test 5: Extract and validate URLs
    console.log(`${colors.yellow}TEST 5: URL Count & Validation${colors.reset}`);
    const urls = extractUrls(response.body);
    
    if (urls.length >= 19) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Found ${urls.length} URLs (minimum 19 required)\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Found ${urls.length} URLs (minimum 19 required)\n`);
      hasErrors = true;
    }
    
    // Test 6: Validate URL domains
    console.log(`${colors.yellow}TEST 6: URL Domain Validation${colors.reset}`);
    const allowedDomains = ['https://mind-mhirc.my.id', 'http://localhost'];
    const invalidUrls = urls.filter(url => {
      return !allowedDomains.some(domain => url.startsWith(domain));
    });
    
    if (invalidUrls.length === 0) {
      console.log(`${colors.green}✓ PASS${colors.reset} - All URLs use correct domain\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Found ${invalidUrls.length} URLs with invalid domains:\n`);
      invalidUrls.forEach(url => {
        console.log(`  ${colors.red}✗ ${url}${colors.reset}`);
      });
      console.log('');
      hasErrors = true;
    }
    
    // Test 7: Check for old domains
    console.log(`${colors.yellow}TEST 7: No Old Domain References${colors.reset}`);
    const oldDomains = ['mentalstatus.zone.id', 'vercel.app'];
    const hasOldDomain = oldDomains.some(domain => response.body.includes(domain));
    
    if (!hasOldDomain) {
      console.log(`${colors.green}✓ PASS${colors.reset} - No old domain references found\n`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Old domain references found (mentalstatus.zone.id or vercel.app)\n`);
      hasErrors = true;
    }
    
    // Display discovered URLs
    console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║   DISCOVERED URLS (${urls.length} total)                     ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
    
    urls.forEach((url, index) => {
      console.log(`${colors.blue}${(index + 1).toString().padStart(2, ' ')}.${colors.reset} ${url}`);
    });
    console.log('');
    
    // Final result
    console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
    if (hasErrors) {
      console.log(`${colors.cyan}║   ${colors.red}❌ TESTS FAILED${colors.cyan}                              ║${colors.reset}`);
      console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${colors.cyan}║   ${colors.green}✅ ALL TESTS PASSED${colors.cyan}                         ║${colors.reset}`);
      console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
      process.exit(0);
    }
    
  } catch (error) {
    console.log(`\n${colors.red}╔════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}║   ❌ ERROR: Cannot connect to dev server       ║${colors.reset}`);
    console.log(`${colors.red}╚════════════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.red}Error details:${colors.reset} ${error.message}\n`);
    console.log(`${colors.yellow}Make sure dev server is running:${colors.reset}`);
    console.log(`  ${colors.cyan}npm run dev${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
testSitemap();
