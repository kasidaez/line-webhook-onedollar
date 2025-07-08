const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// Flood protection: store user message timestamps
const userLastMessage = {};

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;
  const now = Date.now();

  // ป้องกัน flood: ถ้าผู้ใช้ส่งข้อความซ้ำภายใน 8 วินาทีจะไม่ตอบ
  if (userLastMessage[userId] && now - userLastMessage[userId] < 8000) {
    return Promise.resolve(null);
  }
  userLastMessage[userId] = now;

  const msg = event.message.text.toLowerCase().trim();
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 7;
  const isPhone = /^0[689]\d{8}$/.test(msg.replace(/[^0-9]/g, ''));

  let reply = '';

  if (msg.includes('เงินไม่เข้า') || msg.includes('เติมแล้ว')) {
    reply = '📌 ถ้าเติมเงินแล้วยังไม่เข้าภายใน 3–5 นาที\nแนะนำให้ทักแอดมินด่วน ๆ ที่นี่เลยค่ะ 💬\n👉 https://lin.ee/INWaq47';
  } else if ((msg.includes('ถอน') && msg.includes('ไม่เข้า')) || msg.includes('ถอนเงิน')) {
    reply = '📤 หากถอนเงินแล้วไม่เข้า อาจใช้เวลา 3–5 นาทีค่ะ\nหากนานเกินกว่านั้น ทักแอดมินให้ช่วยดูให้นะคะ 💬\n👉 https://lin.ee/INWaq47';
  } else if (msg.includes('ลืมรหัส') || msg.includes('รีเซ็ต')) {
    reply = '🔐 ลืมรหัสผ่านใช่ไหมคะ?\nแอดมินยินดีรีเซ็ตให้เลยค่า\nแค่ส่งข้อมูลตามนี้มาได้เลยค่ะ 👇\n• ชื่อที่ใช้สมัคร\n• เบอร์โทร\n• ธนาคาร\n• เลขบัญชี';
  } else if (msg.includes('โปร') || msg.includes('โปรโมชั่น') || msg.includes('ขอโปร')) {
    reply = '🎁 โปรเด็ดวันนี้! ฝากแรกของวันรับโบนัสทันที 🔥\nสนใจรับโปร ทักแอดมินตรงนี้เลยค่ะ 👇\n💬 https://lin.ee/INWaq47';
  } else if (msg.includes('เท่าไหร่') || msg.includes('ขั้นต่ำ') || msg.includes('ทำยอด')) {
    reply = '✅ เว็บนี้ “ไม่มีขั้นต่ำ” และ “ไม่ต้องทำยอด” เลยค่ะ\nจะฝาก 1 บาท หรือถอน 5 บาทก็ทำได้หมด 😍\nสะดวก ง่าย ปลอดภัย 💸';
  } else if (
    msg.includes('สมัคร') || msg.includes('ลิงก์สมัคร') ||
    msg.includes('ขอสมัคร') || msg.includes('สมัครให้หน่อย')
  ) {
    reply =
`📌 หากคุณยังไม่ได้เป็นสมาชิก\nสามารถสมัครเองได้ทันทีผ่านลิงก์นี้เลยค่ะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA

หรือถ้าสะดวกให้แอดมินสมัครให้ 💬\nพิมพ์ข้อมูลตามนี้ได้เลยค่า:\n• ชื่อเล่น\n• เบอร์โทร\n• ธนาคารที่ใช้\n• เลขบัญชี / เบอร์วอลเล็ต

📍 สมัครเองเร็วกว่า ไม่ถึง 1 นาที พร้อมเข้าเล่นทันทีเลยค่ะ 💸`;
  } else if (
    msg.includes('เกมไหนดี') || msg.includes('เล่นอะไรดี') ||
    msg.includes('เกมไหนแตก') || msg.includes('เกมไหนแจก')
  ) {
    reply =
`🎮 แอดแนะนำแนวนี้เลยค่ะ 🔥

🃏 ป๊อกเด้ง – ได้ไวมาก!\n🎰 สล็อต – ลุ้นมันส์ โบนัสแตกบ่อย\n🥊 มวยสด – แทงสดลุ้นแบบเรียลไทม์\n💵 บอล – มีครบทุกลีก ได้เสียง่าย

อยากได้แนวไหน แอดจัดให้ค่า 😘`;
  } else if (isPhone) {
    reply = '📲 ได้รับเบอร์แล้วค่า รอสักครู่ เดี๋ยวแอดมินจะช่วยดูให้อย่างไวเลยค่ะ 😊';
  } else if (msg.includes('ขอสลิป') || msg.includes('สลิป')) {
    reply = '📎 ถ้าส่งสลิปแล้วไม่ต้องส่งซ้ำนะคะ\nแอดมินจะตรวจเช็กให้อย่างเร็วที่สุดเลยค่ะ 💕';
  } else {
    reply = isNight
      ? 'ถ้าดึก ๆ แบบนี้แอดมินอาจตอบช้านิดนึงนะคะ 🥱\nแต่สมัครเองได้เลยที่นี่จ้า 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA'
      : 'หากสนใจสมัคร กดที่ลิงก์นี้ได้เลยนะคะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA\nหรือต้องการให้แอดมินสมัครให้ก็แจ้งข้อมูลเข้ามาได้เลยค่า 😊';
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
