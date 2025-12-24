const express = require('express');
const whatsappRoutes = require('./google_cloud_vm_lepapon-lanches/routes/whatsappRoutes');

const app = express();

app.use(express.json());
app.use('/webhook', whatsappRoutes);

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});