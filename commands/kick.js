module.exports = {
  command: 'kick',
  info: 'Removes replied or mentioned user from group.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in groups!*' });
    if (!text && !m.replied) return await m.reply({ text: '*Please reply or mention any user!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!(await m.isAdmin(m.sender))) return await m.reply({ text: '*You are not an admin of this group!*' });
    if (m.replied) {
      let isPart = await m.isParticipant(m.replied.sender, m.chat);
      if (!isPart) return await m.reply({ text: '*@' + m.replied.sender.split('@')[0] + ' is already not a participant of this group.*' });
      await conn.groupParticipantsUpdate(m.chat, [m.replied.sender], 'remove');
      return await m.reply({ text: '*Kicked out @' + m.replied.sender.split('@')[0] + '!*' });
    } else if (m.mentions) {
      m.mentions.map(async (user) => {
        let isPart = await m.isParticipant(user, m.chat);
        if (!isPart) return await m.reply({ text: '*@' + user.split('@')[0] + ' is already not a participant of this group.*' });
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      });
      return await m.reply({ text: '*Kicked out:*\n' + m.mentions.map((user) => '@' + user.split('@')[0]).join('\n') });
    }
  }
};
