const express = require('express');
const path = require('path');

const app = express();

// Angular build ligger i 'dist/myapp-frontend/browser'
const DIST_DIR = path.resolve(__dirname, 'dist', 'myapp-frontend', 'browser');
console.log('Serving Angular from:', DIST_DIR);

// Serve static files
app.use(express.static(DIST_DIR));

// SPA fallback
app.get('*', (req, res) => {
  const indexFile = path.join(DIST_DIR, 'index.html');
  console.log('Sending file:', indexFile);
  res.sendFile(indexFile);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Frontend running on port ${port}`));
