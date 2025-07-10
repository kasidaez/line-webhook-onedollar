const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// 🔒 ป้องกันฟลัดข้อความซ้ำภายใน 10 วินาที
const recentMessages = new Map();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message') return Promise.resolve(null);

  const userId = event.source.userId;
  const now = new Date();
const hour = (now.getUTCHours() + 7) % 24;
const isNight = hour >= 21 || hour < 7;


  // ตรวจจับสลิป (ภาพ)
  if (event.message.type === 'image') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '📸 ได้รับสลิปแล้วนะคะ หากเงินยังไม่เข้าออโต้ภายใน 3–5 นาที แนะนำให้ส่งสลิปให้แอดมินหลักเลยค่ะ 💬\n👉 https://lin.ee/INWaq47 💖',
    });
  }

  // เฉพาะข้อความ
  if (event.message.type !== 'text') return Promise.resolve(null);

  const msg = event.message.text.toLowerCase().trim();
  const isPhone = /^0[689]\d{8}$/.test(msg.replace(/[^0-9]/g, ''));

  // ป้องกันฟลัด
  if (recentMessages.has(userId)) {
    const { lastMsg, lastTime } = recentMessages.get(userId);
    if (lastMsg === msg && (Date.now() - lastTime < 10000)) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '⏳ ขออภัยนะคะ อย่าเพิ่งส่งซ้ำบ่อย ๆ น้า แอดมินเห็นแล้วค่า 💗',
      });
    }
  }
  recentMessages.set(userId, { lastMsg: msg, lastTime: Date.now() });

  // เริ่มตอบกลับตาม keyword
  let reply = '';

  if (msg.includes('เงินไม่เข้า')) {
    reply = `หากเงินยังไม่เข้าออโต้ภายใน 3–5 นาที แนะนำให้ส่งสลิปให้แอดมินหลักเลยค่ะ 💬\n👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ถอน') && msg.includes('ไม่เข้า')) {
    reply = `ถ้าถอนแล้วยังไม่เข้า อาจใช้เวลา 3–5 นาทีค่ะ\nหากเกินกว่านั้น ทักแอดมินหลักตรวจสอบให้ได้เลยค่า 💬\n👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ลืมรหัส') || msg.includes('รีเซ็ต')) {
    reply = `ถ้าลืมรหัสผ่าน แอดมินช่วยรีเซ็ตให้นะคะ 💬\nรบกวนส่งข้อมูลนี้มาค่า 👇\n• ชื่อที่ใช้สมัคร\n• เบอร์โทร\n• ธนาคาร\n• เลขบัญชี`;
  } else if (msg.includes('โปร') || msg.includes('โปรโมชั่น')) {
    reply = `🎉 ตอนนี้มีโปรดี ๆ เพียบเลยค่า\nสอบถามเพิ่มเติมกับแอดมินที่นี่นะคะ 👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ขั้นต่ำ') || msg.includes('ทำยอด') || msg.includes('เทิร์น')) {
    reply = '✅ ไม่มีขั้นต่ำ ไม่ต้องทำยอด ไม่ต้องทำเทิร์นเลยค่ะ 💸 เติมปุ๊บ เล่นได้ทันทีน้า 😍';
  } else if (
    msg.includes('สมัคร') ||
    msg.includes('สมัครให้') ||
    msg.includes('ขอสมัคร') ||
    msg.includes('ลิงก์สมัคร')
  ) {
    reply = `📌 หากคุณยังไม่ได้เป็นสมาชิก\nสามารถสมัครเองได้ทันทีผ่านลิงก์นี้ค่ะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA\n\n✅ สมัครเองง่าย ไม่ถึง 1 นาที พร้อมเข้าเล่นได้เลย\nหากต้องการให้แอดมินสมัครให้\nส่งข้อมูลมานะคะ 👇\n• ชื่อเล่น\n• เบอร์โทร\n• ธนาคาร\n• เลขบัญชี / วอเล็ต`;
  } else if (isPhone) {
    reply = '📲 ได้รับเบอร์แล้วนะคะ แอดมินจะรีบดำเนินการให้น้า 💖';
  } else {
    reply = isNight
      ? `ดึก ๆ แบบนี้แอดมินอาจตอบช้านิดนึงนะคะ 🥱\nแต่สามารถสมัครเองได้ทันทีที่นี่ค่ะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA`
      : `หากสนใจสมัคร กดที่ลิงก์นี้ได้เลยค่ะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA\nหรือต้องการให้แอดมินสมัครให้ก็แจ้งข้อมูลเข้ามาได้เลยค่า 💗`;
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