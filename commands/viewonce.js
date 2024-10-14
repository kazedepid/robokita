module.exports = {
  command: 'viewonce',
  info: 'Converts view once media to standard media for unrestricted viewing and sharing.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.replied.viewonce) return await m.reply({ text: '*Please reply to any viewonce message!*' });
    if (m.replied.image) {
      let image = await m.load(m.replied.image);
      return await m.reply({ image: image, mimetype: m.replied.image.mimetype, caption: m.replied.image?.caption || '' });
    } else if (m.replied.video) {
      let video = await m.load(m.replied.video);
      return await m.reply({ video: video, mimetype: m.replied.video.mimetype, caption: m.replied.video?.caption || '' });
    } else if (m.replied.audio) {
      let audio = await m.load(m.replied.audio);
      return await m.reply({ audio: audio, mimetype: m.replied.audio.mimetype, ptt: m.replied.audio?.ptt || false });
    } else {
      return await m.reply({ text: '*❌ Unsupported media, reply to any viewonce image, video or audio!*' });
    }
  }
};
