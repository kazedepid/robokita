module.exports = {
  command: 'approve',
  info: 'Approves join request of given user.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    let group = await conn.groupMetadata(m.chat);
    if (!group.joinApprovalMode) return await m.reply({ text: '*Approval mode is not enabled in this group!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!(await m.isAdmin(m.sender))) return await m.reply({ text: '*You are not an admin of this group!*' });
    if (!text || !text.startsWith('+')) return await m.reply({ text: '*Please enter the number of user with +countrycode for approving!*' });
    let list = [];
    let lis = await conn.groupRequestParticipantsList(m.chat);
    lis.map((l) => list.push('+' + l.jid.split('@')[0]));
    if (!list.includes(text)) return await m.reply({ text: '*This user didn\'t sent join request to this group!*' });
    await conn.groupRequestParticipantsUpdate(m.chat, [text.replace('+', '') + '@s.whatsapp.net'], 'approve');
    return await m.reply({ text: '*Approved @' + text.replace('+', '') + '\'s join request!*' });
  }
};
