const { Users } = require('../main');

module.exports = {
  command: 'bc',
  info: 'Broadcasts replied message to all users.',
  private: true,
  func: async (conn, m, text) => {
    if (!m.replied) return await m.reply({ text: '*Please reply to any message!*' });
    let users = await Users.findAll();
    let replied = true;
    users.map(async (user) => {
      let mesaj = !m.replied.text ? await m.load(m.replied.image || m.replied.video || m.replied.audio || m.replied.sticker || m.replied.document) : m.replied.text;
      await new Promise(resolve => setTimeout(resolve, 3000));
      if (m.replied.image) {
        await conn.sendMessage(user.id, { image: mesaj, mimetype: m.replied.image.mimetype, caption: m.replied.image.caption });
      } else if (m.replied.video) {
        await conn.sendMessage(user.id, { video: mesaj, mimetype: m.replied.video.mimetype, caption: m.replied.video.caption });
      } else if (m.replied.audio) {
        await conn.sendMessage(user.id, { audio: mesaj, mimetype: m.replied.audio.mimetype, ptt: (text.toLowerCase() == 'ptt' || text.toLowerCase() == 'voice' || text.toLowerCase() == 'voicenote' || text.toLowerCase() == 'voice note') ? true : m.replied.audio.ptt });
      } else if (m.replied.sticker) {
        await conn.sendMessage(user.id, { sticker: mesaj, mimetype: m.replied.sticker.mimetype });
      } else if (m.replied.text) {
        await conn.sendMessage(user.id, { text: mesaj });
      } else {
        replied = false;
        return;
      }
    });
    if (!replied) {
      return await m.reply({ text: '*Replied message cannot be broadcasted!*' });
    } else {
      return await m.reply({ text: '*Successfully broadcasted replied message to ' + users.length + ' chats!*' });
    }
  }
};
