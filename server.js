import express, { json } from 'express';
import router from './routes/whatsappRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// Rotas
app.use('/webhook', router);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor WhatsApp rodando na porta ${PORT}`);
});