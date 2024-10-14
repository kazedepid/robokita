module.exports = {
  command: 'tagall',
  info: 'Tags or mentions all participants of the group.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in groups!*' });
    if (m.sender !== m.me && (!(await m.isAdmin(m.sender)))) return await m.reply({ text: '*You are not an admin!*' });
    let group = await conn.groupMetadata(m.chat);
    let mentions = group.participants.map((user) => user.id);
    if (text || m.replied.text) {
     return await m.reply({
       text: text || m.replied.text,
       mentions
     });
    } else if (m.replied && m.replied.image) {
     let img = await m.load(m.replied.image);
     return await m.reply({
       image: img,
       caption: m.replied.image?.caption || '',
       mentions
     });
    } else if (m.replied && m.replied.video) {
     let vid = await m.load(m.replied.video);
     return await m.reply({
       video: vid,
       caption: m.replied.video?.caption || '',
       mentions
     });
    } else if (m.replied && m.replied.audio) {
     let aud = await m.load(m.replied.audio);
     return await m.reply({
       audio: aud,
       ptt: m.replied.audio?.ptt || false,
       mentions
     });
    } else if (m.replied && m.replied.document) {
     let doc = await m.load(m.replied.document);
     return await m.reply({
       document: doc,
       caption: m.replied.document?.caption || '',
       mimetype: m.replied.document.mimetype,
       mentions
     });
    } else {
     return await m.reply({
       text: '```@' + mentions.join('\n@').replace(/@s.whatsapp.net/g, '') + '```',
       mentions: mentions
     });
    }
  }
}
