const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('dist'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
