
const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

const recentMessages = {};

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const msg = event.message.text.toLowerCase().trim();
  const now = new Date();
  const hour = now.getHours();
  const isNight = hour >= 21 || hour < 7;

  const userId = event.source.userId;
  if (!recentMessages[userId]) recentMessages[userId] = [];
  recentMessages[userId].push(now);
  recentMessages[userId] = recentMessages[userId].filter(
    timestamp => now - timestamp < 15000
  );
  if (recentMessages[userId].length > 5) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'แอดมินขอความกรุณาอย่าส่งข้อความถี่เกินไปนะคะ 😊',
    });
  }

  const isPhone = /^0[689]\d{8}$/.test(msg.replace(/[^0-9]/g, ''));
  const isSlip = msg.includes('สลิป') || msg.includes('โอน') || msg.includes('หลักฐาน');

  let reply = '';

  if (msg.includes('เงินไม่เข้า')) {
    reply = `หากเงินยังไม่เข้าภายใน 3–5 นาที แนะนำให้ทักแอดมินหลักได้เลยค่ะ 💬\n👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ถอน') && msg.includes('ไม่เข้า')) {
    reply = `ถ้าถอนเงินแล้วยังไม่เข้า อาจใช้เวลา 3–5 นาทีค่ะ\nหากเกินกว่านั้น ทักแอดมินตรวจสอบได้เลยค่ะ 💬\n👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ลืมรหัส') || msg.includes('รีเซ็ต')) {
    reply = `หากลืมรหัสผ่าน รบกวนส่งข้อมูลต่อไปนี้ให้แอดมินได้เลยค่ะ 👇\n\n• ชื่อที่ใช้สมัคร\n• เบอร์โทร\n• ธนาคาร\n• เลขบัญชี\n\nหรือติดต่อแอดมินหลักที่นี่ค่ะ 👉 https://lin.ee/INWaq47`;
  } else if (msg.includes('ขั้นต่ำ') || msg.includes('เท่าไหร่')) {
    reply = '✅ ไม่มีขั้นต่ำเลยค่ะ จะฝาก–ถอนเท่าไหร่ก็ได้เลยนะคะ 😍';
  } else if (msg.includes('โปร') || msg.includes('โปรโมชั่น')) {
    reply = '🎉 โปรดี ๆ มีเพียบเลยค่า\nทักแอดมินหลักรับโปรที่นี่ได้เลย 👉 https://lin.ee/INWaq47';
  } else if (
    msg.includes('สมัคร') ||
    msg.includes('สมัครให้') ||
    msg.includes('ลิงก์สมัคร') ||
    msg.includes('ขอสมัคร')
  ) {
    reply =
`📌 หากคุณยังไม่ได้เป็นสมาชิก  
สามารถสมัครได้ทันทีผ่านลิงก์นี้เลยค่ะ 👇  
🔗 https://play.onedollar.bet/signup?ref=xtcqTA

✅ ระบบสมัครง่าย ไม่ถึง 1 นาที พร้อมเริ่มเล่นได้ทันที  
รองรับทุกธนาคาร + ทรูวอเล็ต

หากคุณสะดวกให้แอดมินช่วยสมัครให้  
กรุณาพิมพ์ข้อมูลดังต่อไปนี้:

• ชื่อเล่น  
• ธนาคารที่ใช้  
• เลขบัญชี / เบอร์ทรูวอเล็ต

📍 แนะนำสมัครเองจะรวดเร็วกว่า รอไม่ถึงนาทีค่ะ  
มั่นใจ ปลอดภัย พร้อมเข้าเล่นได้ทันที 💸`;
  } else if (msg.includes('ด่า') || msg.includes('โง่') || msg.includes('เหี้ย') || msg.includes('สัส')) {
    reply = 'ขออภัยหากระบบตอบไม่ตรงใจนะคะ แอดมินพร้อมช่วยเหลือเต็มที่เลยค่า 😊';
  } else if (isPhone) {
    reply = `ได้รับเบอร์เรียบร้อยแล้วนะคะ รอสักครู่ค่ะ เดี๋ยวแอดมินจะช่วยดำเนินการให้นะคะ 😊`;
  } else if (isSlip) {
    reply = `ได้รับสลิปแล้วนะคะ เดี๋ยวแอดมินจะตรวจสอบให้เร็วที่สุดเลยค่ะ 🙏`;
  } else {
    reply = isNight
      ? `ดึกแล้วแอดอาจตอบช้านิดนึงนะคะ 🥱\nแต่สมัครเองได้ทันทีเลยค่ะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA`
      : `หากสนใจสมัคร กดที่ลิงก์นี้ได้เลยนะคะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA\nหรือต้องการให้แอดมินสมัครให้ก็แจ้งข้อมูลเข้ามาได้เลยค่า 😊\n• ชื่อเล่น\n• เบอร์\n• ธนาคาร\n• เลขบัญชี`;
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
