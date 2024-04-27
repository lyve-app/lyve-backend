import express, { type Express } from 'express';
import cors from 'cors';
import config from './config/config';
import { createServer } from 'http';

const app: Express = express();
const server = createServer(app);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // origin is given a array if we want to have multiple origins later
    origin: String(config.cors.origin).split('|'),
    credentials: true,
  })
);

app.all('*', (_req, res) => {
  res.status(404).json({ error: '404 Not Found' });
});

export default server;
