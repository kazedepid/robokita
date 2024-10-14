const { Users } = require('../main');

module.exports = {
  command: 'status',
  info: 'Updates status with replied media.',
  private: true,
  func: async (conn, m, text) => {
    if (!text && !m.replied) return await m.reply({ text: '*Please enter some text or reply to any image, audio or video to update status!*' });
    let users = await Users.findAll();
    let ids = users.map((user) => user.id);
    if (text || m.replied.text) {
      await conn.sendStatus({ text: text || m.replied.text, statusJidList: ids });
    } else if (m.replied.image) {
      let image = await m.load(m.replied.image);
      await conn.sendStatus({ image: image, caption: m.replied.image?.caption || '', statusJidList: ids });
    } else if (m.replied.video) {
      let video = await m.load(m.replied.video);
      await conn.sendStatus({ video: video, caption: m.replied.video?.caption || '', statusJidList: ids });
    } else if (m.replied.audio) {
      let audio = await m.load(m.replied.audio);
      await conn.sendStatus({ audio: audio, statusJidList: ids });
    } else {
      return await m.reply({ text: '*❌ Unsupported media, reply to any image, video or audio!*' });
    }
    return await m.reply({ text: '*Successfully updated status!*' });
  }
};
