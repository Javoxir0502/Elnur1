// Click to‘lov uchun link generatsiyasi (demo)
app.post('/api/click-pay', (req, res) => {
  const { amount, phone } = req.body;
  // Click to‘lov sahifasiga yo‘naltiruvchi link (demo)
  // Real integratsiya uchun Click API hujjatiga qarang
  const clickUrl = `https://my.click.uz/services/pay?service_id=YOUR_SERVICE_ID&amount=${amount}&merchant_id=YOUR_MERCHANT_ID&phone=${phone}`;
  res.json({ url: clickUrl });
});
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const fs = require('fs');
const path = require('path');

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { name, password } = req.body;
  if (password === 'Elnur13') {
    res.json({ success: true, name });
  } else {
    res.status(401).json({ success: false, message: 'Parol noto‘g‘ri' });
  }
});

// Xizmat qo‘shish
app.post('/api/services', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Ma'lumot yetarli emas" });
  const file = path.join(__dirname, 'services.json');
  const services = JSON.parse(fs.readFileSync(file));
  services.push({ name, price });
  fs.writeFileSync(file, JSON.stringify(services, null, 2));
  res.json({ success: true });
});

// Xizmatlar ro‘yxati
app.get('/api/services', (req, res) => {
  const file = path.join(__dirname, 'services.json');
  const services = JSON.parse(fs.readFileSync(file));
  res.json(services);
});

// Telegram xabar yuborish
const TELEGRAM_BOT_TOKEN = 'TOKENNI_BU_YERGA_QOYING';
const TELEGRAM_CHAT_ID = 'CHAT_ID_BU_YERGA_QOYING';
const sendTelegram = async (text) => {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });
  } catch (e) {}
};

// Buyurtma qo‘shish
app.post('/api/orders', async (req, res) => {
  const { name, phone, address, service, time } = req.body;
  if (!name || !phone || !address || !service || !time) return res.status(400).json({ error: "Ma'lumot yetarli emas" });
  const file = path.join(__dirname, 'orders.json');
  const orders = JSON.parse(fs.readFileSync(file));
  orders.push({ name, phone, address, service, time, created: Date.now() });
  fs.writeFileSync(file, JSON.stringify(orders, null, 2));
  // Telegramga xabar
  await sendTelegram(`Yangi buyurtma:\nIsm: ${name}\nTel: ${phone}\nManzil: ${address}\nXizmat: ${service}\nVaqt: ${time}`);
  res.json({ success: true });
});

// Buyurtmalar ro‘yxati (admin uchun)
app.get('/api/orders', (req, res) => {
  const file = path.join(__dirname, 'orders.json');
  const orders = JSON.parse(fs.readFileSync(file));
  res.json(orders);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
});
