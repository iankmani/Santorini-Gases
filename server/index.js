// server/index.js
import express from "express"
import {config} from "dotenv"

const app = express();
const PORT = process.env.PORT || 3001;
config()

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});