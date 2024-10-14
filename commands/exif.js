const { toSticker, addExif, getExif } = require('../helpers/sticker');

module.exports = {
  command: 'exif',
  info: 'Set exif to a sticker.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.replied || !m.replied.sticker && !m.replied.image && !m.replied.video) return await m.reply({ text: '*Please reply to any sticker!*' });
    let [packname, author] = text.split('/');
    let sticker = null;
    if (m.replied.image || m.replied.video) {
      sticker = await toSticker(
        m.replied.image ? 'image' : 'video',
        await m.load(m.replied.image ? m.replied.image : m.replied.video),
        { packname, author }
      );
      return await m.reply({ sticker: sticker });
    } else if (m.replied.sticker) {
      let media = await m.load(m.replied.sticker);
      if (!packname && !author) {
        let exif = await getExif(media);
        return await m.reply({ text: '_Sticker Packname_ : *' + exif.packname + '*\n_Sticker Author_ : *' + exif.author + '*\n\n*Please enter packname and author name along with replying to a sticker to change its exif.*' });
      } else {
        let sticker = await addExif(media, { packname, author });
        return await m.reply({ sticker: sticker });
      }
    }
  }
};
