import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cartRoutes from './routes/cart.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

app.use('/cart', cartRoutes);

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Cart endpoint: http://localhost:${PORT}/cart`);
});
