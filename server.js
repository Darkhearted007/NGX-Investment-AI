#!/usr/bin/env node

/**
 * NGX Investment AI - Production Server
 * Serves built Vite application with proper routing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'production';
const distPath = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8'
};

// Cache control policies
const cacheControl = {
  immutable: 'public, immutable, max-age=31536000',
  assets: 'public, max-age=31536000',
  html: 'public, max-age=0, must-revalidate',
  api: 'private, no-cache, no-store, must-revalidate'
};

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Get cache control header
 */
function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Immutable assets (with hash in filename)
  if (/\.[a-f0-9]{8}\.(js|css)$/i.test(filePath)) {
    return cacheControl.immutable;
  }
  
  // HTML files
  if (ext === '.html') {
    return cacheControl.html;
  }
  
  // Other assets
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
    return cacheControl.assets;
  }
  
  return cacheControl.html;
}

/**
 * Send file response
 */
function sendFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      send404(res);
      return;
    }

    const mimeType = getMimeType(filePath);
    const cacheControlHeader = getCacheControl(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const responseHeaders = {
      'Content-Type': mimeType,
      'Cache-Control': cacheControlHeader
    };

    // Check if client accepts gzip
    const acceptEncoding = res.req?.headers['accept-encoding'] || '';
    const shouldGzip = acceptEncoding.includes('gzip') && 
                      ['.js', '.css', '.json', '.html', '.svg'].includes(ext);

    if (shouldGzip) {
      responseHeaders['Content-Encoding'] = 'gzip';
    }

    res.writeHead(200, responseHeaders);

    const fileStream = fs.createReadStream(filePath);

    if (shouldGzip) {
      fileStream.pipe(zlib.createGzip()).pipe(res);
    } else {
      fileStream.pipe(res);
    }

    fileStream.on('error', () => {
      res.writeHead(500);
      res.end('Internal Server Error');
    });
  });
}

/**
 * Send 404 response
 */
function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404 - Not Found</h1>');
}

/**
 * Send JSON response
 */
function sendJSON(data, statusCode = 200, res) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json)
  });
  res.end(json);
}

/**
 * Request handler
 */
const server = http.createServer((req, res) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Health check endpoint
  if (req.url === '/health') {
    sendJSON({ status: 'ok', environment: ENV }, 200, res);
    return;
  }

  // Normalize URL
  let pathname = req.url.split('?')[0];
  
  // Remove trailing slashes except for root
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Resolve file path
  let filePath = path.join(distPath, pathname);

  // Check if it's a directory and try index.html
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Fall back to index.html for SPA routing
        const indexPath = path.join(distPath, 'index.html');
        fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
          if (indexErr) {
            send404(res);
          } else {
            sendFile(indexPath, res);
          }
        });
        return;
      }

      sendFile(filePath, res);
    });
  });
});

/**
 * Error handler
 */
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

/**
 * Start server
 */
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║      NGX Investment AI - Production Server             ║
╚════════════════════════════════════════════════════════╝

✓ Server running on http://localhost:${PORT}
✓ Environment: ${ENV}
✓ Serving from: ${distPath}
✓ Health check: http://localhost:${PORT}/health

  `);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
