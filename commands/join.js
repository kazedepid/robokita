module.exports = {
  command: 'join',
  info: 'Joins the group with given link.',
  private: true,
  func: async (conn, m, text) => {
    let link = text !== '' ? text : m.replied.text ? m.replied.text : false;
    if (!link) return await m.reply({ text: '*Please enter or reply to any WhatsApp group link to join!*' });
    if (!/https:\/\/chat\.whatsapp\.com\/([^\/]+)/.test(link)) return await m.reply({ text: '*Invalid group link, Enter or reply to any valid group invitation link!*' });
    let id = await conn.groupAcceptInvite(
        link.match(/https:\/\/chat\.whatsapp\.com\/([^\/]+)/)[1]
    ).catch(async (e) => {
      return await m.reply({ text: '*I am restricted to join because I am removed from there.*' });
    });
    return await m.reply({ text: '*Successfully joined to:*\n```' + id + '```' });
  }
};
