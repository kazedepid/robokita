const { convertTimestamp } = require('../helpers/utils');

module.exports = {
  command: 'list',
  info: 'Shows group\'s participant request list.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    let group = await conn.groupMetadata(m.chat);
    if (!group.joinApprovalMode) return await m.reply({ text: '*Approval mode is not enabled in this group!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!(await m.isAdmin(m.sender))) return await m.reply({ text: '*You are not an admin of this group!*' });
    let list = await conn.groupRequestParticipantsList(m.chat);
    if (list.length < 1) return await m.reply({ text: '*There is no join requests!*' });
    let listText = '*Group join requests:*\n';
    list.map(async (info, index) => {/*
      if (index % 10 === 0) {
        await m.reply({ text: listText });
        listText = '';
      } */
      let t = convertTimestamp(info.request_time);
      listText += `_User_ : *${'@' + info.jid.split('@')[0]} ( ${info.jid} )*\n_Number_ : *${'+' + info.jid.split('@')[0]}*\n_Requested method_ : ${info.request_method == 'invite_link' ? '*Invitation link*' : '*Added by @' + info.requestor.split('@')[0] + '*'}\n_Requested Time_ : *${t.day + ', ' + t.date + ' ' + t.month + ', ' + t.year + ' ' + t.time}*\n\n`;
    });
    // if (listText !== '')
    return await m.reply({ text: listText });
  }
};
