const { enable, status, disable } = require('../helpers/database/toggle');

module.exports = {
  command: 'antilink',
  info: 'Enable/Disable antilink for the chat.',
  private: false,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in groups!*' });
    if (!(await m.isAdmin(m.sender)) && !m.fromBot) return await m.reply({ text: '*You are not an admin of this group!*' });
    if (!(await m.isAdmin(m.me))) return await m.reply({ text: '*I am not an admin of this group!*' });
    if (!text) return await m.reply({ text: '*Please enter an argument - \'on\' or \'off\'!*' });
    text = text.toLowerCase();
    let current = await status('antilink', m.chat);
    if (/on|enable/.test(text)) {
      if (current == true) return await m.reply({ text: '*Antilink is already turned on!*' });
      await enable('antilink', m.chat);
      return await m.reply({ text: '*Successfully turned on antilink for this chat!*' });
    } else if (/off|disable/.test(text)) {
      if (current == false) return await m.reply({ text: '*Antilink is already turned off!*' });
      await disable('antilink', m.chat);
      return await m.reply({ text: '*Successfully turned off antilink for this chat!*' });
    } else {
      return await m.reply({ text: '*Invalid argument, Please enter an argument - \'on\' or \'off\'!*' });
    }
  },
  event: async (conn, m) => {
    let antilink = await status('antilink', m.chat);
    if (antilink == true && m.isGroup && (/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/).test(m.text)) {
      if (!(await m.isAdmin(m.sender)) && (await m.isAdmin(m.me)) == true) {
        await m.reply({ text: '*Links are not allowed in this group!*' });
        await m.reply({ delete: m });
      }
    }
  }
};
