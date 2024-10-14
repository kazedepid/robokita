module.exports = {
  command: 'link',
  info: 'Fetches group\'s invitation link.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!(await m.isAdmin(m.sender))) return await m.reply({ text: '*You are not an admin of this group!*' });
    return await m.reply({
      text: 'https://chat.whatsapp.com/' + (await conn.groupInviteCode(m.chat))
    });
  }
};
