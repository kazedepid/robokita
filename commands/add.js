module.exports = {
  command: 'add',
  info: 'Adds user to group from entered number.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    if (!text && !m.replied) return await m.reply({ text: '*Please enter a number with +country code to add!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    let group = await conn.groupMetadata(m.chat);
    if (!(await m.isAdmin(m.sender)) && !group.memberAddMode) return await m.reply({ text: '*You are not an admin of this group!*' });
    if (m.replied) {
      let isPart = await m.isParticipant(m.replied.sender, m.chat);
      if (isPart) return await m.reply({ text: '*@' + m.replied.sender.split('@')[0] + ' is already a participant of this group!*' });
      await conn.groupParticipantsUpdate(m.chat, [m.replied.sender], 'add').then(async (_) => {
       return await m.reply({ text: '*Added @' + m.replied.sender.split('@')[0] + '!*' });
      }).catch(async (e) => {
       return await m.reply({ text: '*@' + m.replied.sender.split('@')[0] + ' cannot be added because of their privacy settings!*' });
      });
    } else if (text) {
      if (!text.startsWith('+')) return await m.reply({ text: '*Please enter a number with +country code!*\n\n*For Example:*\n*/add +62 xxxxx xxxxx*\n*/add +62 xxxxxxxxxx*\n*/add +62xxxxxxxxxx*' });
      text = (text.trim().replace('+', '').replace(/ /g, '')) + '@s.whatsapp.net';
      let isPart = await m.isParticipant(text, m.chat);
      if (isPart) return await m.reply({ text: '*@' + text.split('@')[0] + ' is already a participant of this group!*' });
      await conn.groupParticipantsUpdate(m.chat, [text], 'add').then(async (_) => {
       return await m.reply({ text: '*Added @' + text.split('@')[0] + '!*' });
      }).catch(async (e) => {
       return await m.reply({ text: '*@' + text.split('@')[0] + ' cannot be added because of their privacy settings!*' });
      });
    }
  }
};
