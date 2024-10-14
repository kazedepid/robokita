const { setMessage, getMessage, deleteMessage } = require('../helpers/database/greetings');

module.exports = {
  command: 'welcome',
  info: 'Sets or deletes welcome message.',
  private: true,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    let message = text !== '' ? text : m.replied.text ? m.replied.text : false
    let wtext = await getMessage('welcome', m.chat);
    if (!message) return await m.reply({ text: '*Please enter or reply to any message to set as welcome message!*' + (wtext == false ? '' : '\n*Welcome message:*\n'+wtext+'\n\n_Type \'delete\' or \'remove\' along with the command to delete welcome message!_') });
    if (message.toLowerCase() == 'delete' || message.toLowerCase() == 'remove') {
      await deleteMessage('welcome', m.chat);
      return await m.reply({ text: '*Successfully deleted welcome message from this chat!*' });
    }
    await setMessage('welcome', m.chat, message);
    return await m.reply({ text: '*Successfully set welcome message!*\n_Type \'delete\' or \'remove\' along with the command to delete the welcome message._' });
  }
}
