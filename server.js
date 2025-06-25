require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const generateFlow = require('./generate_flow');

const app = express();
app.use(bodyParser.json());

app.post('/generate_flow', generateFlow);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
