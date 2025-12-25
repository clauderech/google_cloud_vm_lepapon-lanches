// Import Express.js
import express, { json } from 'express';
import dotenv from 'dotenv';
dotenv.config();

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(json());

// Set port and verify_token
const port = process.env.PORT;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
console.log(`Using verify token: ${verifyToken}`);
// Route for GET requests
app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log(`WEBHOOK VERIFICATION FAILED: ${token} does not match ${verifyToken}`);
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/webhook', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});