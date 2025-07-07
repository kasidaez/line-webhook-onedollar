const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');
const bodyParser = require('body-parser');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new Client(config);
const app = express();
app.use(bodyParser.json());
app.post('/webhook', middleware(config), async (req, res) => {
  const events = req.body.events;
  const results = await Promise.all(events.map(handleEvent));
  res.json(results);
});

function isPhoneNumber(text) {
  return /^\d{9,12}$/.test(text);
}

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text.trim().toLowerCase();
  const replyToken = event.replyToken;

  const responses = [];

  if (text.includes("สมัคร")) {
    responses.push({
      type: "text",
      text: `หากยังไม่ได้สมัครสมาชิก กดที่นี่ได้เลยค่ะ 👇\n🔗 https://play.onedollar.bet/signup?ref=xtcqTA\n\nหรือหากต้องการให้แอดมินสมัครให้ ส่งข้อมูลเพิ่มดังนี้นะคะ:\n- ชื่อเล่น\n- ธนาคาร\n- เลขบัญชี\n\nระบบแนะนำว่าสมัครเองจะเร็วสุดเลยค่าา 🚀`
    });
  } else if (text.includes("โปรโมชั่น")) {
    responses.push({ type: "text", text: "📢 โปรดี ๆ มีทุกวัน! สนใจสอบถามเพิ่มเติมได้ที่แอดมินหลักเลยนะคะ 👉 https://lin.ee/INWaq47" });
  } else if (text.includes("ลืมรหัส")) {
    responses.push({ type: "text", text: "หากลืมรหัสผ่าน รบกวนส่งข้อมูลเบอร์โทร + ธนาคาร มารอแอดมินตัวจริงช่วยดูให้นะคะ 🙏" });
  } else if (isPhoneNumber(text)) {
    responses.push({ type: "text", text: `ขอบคุณสำหรับเบอร์นะคะ 😊 \nหากยังไม่ได้สมัครสมาชิก กดที่นี่ได้เลย 👇 https://play.onedollar.bet/signup?ref=xtcqTA` });
  } else {
    responses.push({ type: "text", text: `สอบถามเพิ่มเติม ทักแอดมินหลักที่นี่ได้เลยค่ะ 👉 https://lin.ee/INWaq47` });
  }

  return client.replyMessage(replyToken, responses);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
