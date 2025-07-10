const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// 🔒 ป้องกันฟลัด
const recentMessages = new Map();

// 🚫 คำหยาบ (ตัวอย่าง)
const badWords = ['ควาย', 'สัส', 'เหี้ย', 'ไอ้บ้า', 'อีบ้า', 'fuck', 'shit'];

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message') return Promise.resolve(null);

  const userId = event.source.userId;
  const now = new Date();
const hour = (now.getUTCHours() + 7) % 24;
const isNight = hour >= 21 || hour < 7;

  if (event.message.type === 'image') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `📸 ได้รับสลิปแล้วนะคะ แอดมินจะรีบตรวจสอบให้เร็วที่สุดเลยค่ะ 💖`,
    });
  }

  if (event.message.type !== 'text') return Promise.resolve(null);

  const msg = event.message.text.toLowerCase().trim();
  const isPhone = /^0[689]\d{8}$/.test(msg.replace(/[^0-9]/g, ''));

  // ฟลัดข้อความเดิมภายใน 10 วินาที
  if (recentMessages.has(userId)) {
    const { lastMsg, lastTime } = recentMessages.get(userId);
    if (lastMsg === msg && (Date.now() - lastTime < 10000)) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `⏳ แอดมินเห็นแล้วน้า ไม่ต้องส่งซ้ำนะคะ 💗`,
      });
    }
  }
  recentMessages.set(userId, { lastMsg: msg, lastTime: Date.now() });

  // ตรวจคำหยาบ
  if (badWords.some(word => msg.includes(word))) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `🛑 ขอความร่วมมือใช้ถ้อยคำสุภาพน้า แอดมินตั้งใจให้บริการสุด ๆ เลยค่ะ 💕`,
    });
  }

  let reply = '';

  if (msg.includes('เงินไม่เข้า')) {
    reply = `หากเงินยังไม่เข้าอัตโนมัติภายใน 3–5 นาที ส่งสลิปให้แอดมินตรวจสอบได้เลยค่ะ 💬
👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ถอน') && msg.includes('ไม่เข้า')) {
    reply = `หากถอนเงินแล้วยังไม่เข้า รอประมาณ 3–5 นาทีค่ะ
ถ้าเกินกว่านั้น ส่งสลิปให้แอดมินตรวจสอบได้เลยน้า 💬
👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ลืมรหัส') || msg.includes('รีเซ็ต')) {
    reply = `แอดมินช่วยรีเซ็ตให้ได้เลยค่ะ ✨
ขอข้อมูลดังนี้น้า 👇
• ชื่อที่ใช้สมัคร
• เบอร์โทร
• ธนาคาร
• เลขบัญชี`;
  } else if (msg.includes('โปร') || msg.includes('โปรโมชั่น')) {
    reply = `🎁 โปรดี ๆ มีเพียบเลยค่าา
สอบถามหรือขอรับโปรได้ที่แอดมินเลยนะคะ 💬 👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ขั้นต่ำ') || msg.includes('ทำยอด') || msg.includes('เทิร์น')) {
    reply = `✅ ไม่มีขั้นต่ำ ไม่ต้องทำยอด ไม่ต้องทำเทิร์นเลยค่ะ เติมปุ๊บ เล่นได้ทันที 💸`;
  } else if (
    msg.includes('สมัคร') ||
    msg.includes('สมัครให้') ||
    msg.includes('สมัครหน่อย') ||
    msg.includes('ขอสมัคร') ||
    msg.includes('ลิงก์สมัคร')
  ) {
    reply = `📌 สมัครง่ายมากเลยค่ะ 💖
🔗 สมัครเองได้เลยที่: https://play.onedollar.bet/signup?ref=xtcqTA

หากต้องการให้แอดมินสมัครให้ รบกวนส่งข้อมูลเหล่านี้ได้เลยค่ะ 👇
• ชื่อเล่น
• เบอร์โทร
• ธนาคาร
• เลขบัญชี / วอเล็ต`;
  } else if (
    msg.includes('เล่นอะไรดี') ||
    msg.includes('เกมไหนดี') ||
    msg.includes('เกมไหนแตก') ||
    msg.includes('แจก') ||
    msg.includes('เกม') ||
    msg.includes('เกมไหนแจก') 
  ) {
    reply = `🧨🧨 เกมทำเงินแนะนำช่วงนี้
⚽ แทงบอล – มีให้เล่นทุกคู่ ราคาน้ำดี จ่ายไว
🃏 บาคาร่า – อ่านเค้าไพ่แม่น ๆ มีลุ้นทุกไม้
🎰 สล็อต ค่าย No limit – ฟรีสปินเข้าไว ลุ้นโบนัสใหญ่ทุกวัน
เข้าเล่นเลย 👉 https://play.onedollar.bet`;
  } else if (
    /(ชื่อ|นามสกุล|เลขบัญชี|เบอร์|ทรูวอเล็ท|ทรูมันนี่)/.test(msg)
  ) {
    reply = `📥 ได้รับข้อมูลเรียบร้อยแล้วค่า แอดมินกำลังดำเนินการให้อยู่น้า รอสักครู่จ้า 💖`;
  } else if (isPhone) {
    reply = `📲 ขอบคุณสำหรับเบอร์นะคะ เดี๋ยวแอดมินติดต่อกลับเร็ว ๆ นี้เลยค่ะ 😊`;
  } else {
    reply = isNight
      ? `ถ้าดึก ๆ แบบนี้แอดมินอาจตอบช้านิดนึงน้า 🥱 แต่สมัครเองได้เลยจ้า 👇
🔗 https://play.onedollar.bet/signup?ref=xtcqTA`
      : `หากสนใจสมัคร กดลิงก์นี้ได้เลยน้า 👇
🔗 https://play.onedollar.bet/signup?ref=xtcqTA
หรือต้องการให้แอดมินสมัครให้ก็ส่งข้อมูลมาได้เลยค่า 😊`;
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: reply,
  });
}

app.get('/', (req, res) => {
  res.send('LINE Webhook Bot is running!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
