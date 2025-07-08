// Updated logic goes here
console.log('LINE bot ready');
require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

// LINE config
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// create LINE client
const client = new line.Client(config);

// ป้องกันฟลัดเบื้องต้น (กัน spam)
const messageLog = new Map();

// Middleware: LINE Webhook Parser
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;

    // ตรวจจับถ้าไม่ใช่ข้อความ
    const filteredEvents = events.filter(event => event.type === 'message' && event.message.type === 'text');

    // ตอบแต่เฉพาะข้อความ
    const results = await Promise.all(filteredEvents.map(async event => {
      const userId = event.source.userId;
      const messageText = event.message.text.trim();

      // ตรวจฟลัด
      const now = Date.now();
      const last = messageLog.get(userId) || 0;
      if (now - last < 3000) return null; // 3 วิ

      messageLog.set(userId, now);

      // คำตอบอัตโนมัติ
      let reply = '';

      if (/สมัคร/.test(messageText)) {
        reply = 'คลิกลิงก์เพื่อสมัครได้เลยครับ 👇\nhttps://your-signup-link.com';
      } else if (/ลืมรหัส|เข้าไม่ได้/.test(messageText)) {
        reply = 'หากลืมรหัสผ่าน กรุณากด "ลืมรหัสผ่าน" ที่หน้าเว็บ หรือทักแอดมินเพิ่มเติมได้เลยครับ';
      } else if (/ทำเทิร์น|ทำยอด|ฝากขั้นต่ำ/.test(messageText)) {
        reply = 'ระบบของเรา ❌ไม่ต้องทำเทิร์น และ ✅ไม่มีขั้นต่ำครับ\nฝากเท่าไหร่ก็เล่นได้ทันทีเลยครับ 😊';
      } else {
        reply = 'หากสนใจสมัครใช้งาน คลิกเลย 👇\nhttps://your-signup-link.com\nหากให้แอดมินสมัครให้ กรุณาส่ง:\n- ชื่อจริง\n- เบอร์โทร\n- ยูสเซอร์ที่ต้องการ';
      }

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: reply
      });
    }));

    res.status(200).end();
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).end();
  }
});

app.get('/', (req, res) => res.send('LINE bot ready'));
app.listen(port, () => console.log('Server running on port', port));
