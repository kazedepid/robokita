module.exports = {
  command: 'revoke',
  info: 'Revokes group\'s invitation link.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!(await m.isAdmin(m.sender))) return await m.reply({ text: '*You are not an admin of this group!*' });
    await conn.groupRevokeInvite(m.chat);
    return await m.reply({ text: '*Group link revoked!*' });
  }
};
