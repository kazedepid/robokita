module.exports = {
  command: 'promote',
  info: 'Gives admin authority to replied or mentioned user.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in groups!*' });
    if (!text && !m.replied) return await m.reply({ text: '*Please reply or mention any user!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!(await m.isAdmin(m.sender))) return await m.reply({ text: '*You are not an admin of this group!*' });
    if (m.replied) {
      let isPart = await m.isParticipant(m.replied.sender, m.chat);
      if (!isPart) return await m.reply({ text: '*@' + m.replied.sender.split('@')[0] + ' is not a participant of this group.*' });
      await conn.groupParticipantsUpdate(m.chat, [m.replied.sender], 'promote');
      return await m.reply({ text: '*Promoted @' + m.replied.sender.split('@')[0] + '!*' });
    } else if (m.mentions) {
      m.mentions.map(async (user) => {
        let isPart = await m.isParticipant(user, m.chat);
        if (!isPart) return await m.reply({ text: '*@' + user.split('@')[0] + ' is not a participant of this group.*' });
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
      });
      return await m.reply({ text: '*Promoted:*\n' + m.mentions.map((user) => '@' + user.split('@')[0]).join('\n') });
    }
  }
};
