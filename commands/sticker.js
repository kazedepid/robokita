const { toSticker } = require('../helpers/sticker');

module.exports = {
  command: 'sticker',
  info: 'Converts image or video to sticker.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.replied || !m.replied.image && !m.replied.video) return await m.reply({ text: '*Please reply to any video or image!*' });
    let media = await m.load(m.replied.image ? m.replied.image : m.replied.video);
    await m.reply({ text: '*Converting to sticker...*' });
    let webp = await toSticker(
      m.replied.image ? 'image' : 'video',
      media, {
        packname: text?.split('/')[0]?.trim() || '',
        author: text?.split('/')[1]?.trim() || 'Leon'
      }
    );
    return await m.reply({ sticker: webp });
  }
};
