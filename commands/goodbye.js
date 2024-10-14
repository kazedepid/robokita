const { setMessage, getMessage, deleteMessage } = require('../helpers/database/greetings');

module.exports = {
  command: 'goodbye',
  info: 'Sets or deletes goodbye message.',
  private: true,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in group!*' });
    let message = text !== '' ? text : m.replied.text ? m.replied.text : false
    let gtext = await getMessage('goodbye', m.chat);
    if (!message) return await m.reply({ text: '*Please enter or reply to any message to set as goodbye message!*' + (gtext == false ? '' : '\n*Goodbye message:*\n'+gtext+'\n\n_Type \'delete\' or \'remove\' along with the command to delete goodbye message!_') });
    if (message.toLowerCase() == 'delete' || message.toLowerCase() == 'remove') {
      await deleteMessage('goodbye', m.chat);
      return await m.reply({ text: '*Successfully deleted goodbye message from this chat!*' });
    }
    await setMessage('goodbye', m.chat, message);
    return await m.reply({ text: '*Successfully set goodbye message!*\n_Type \'delete\' or \'remove\' along with the command to delete the goodbye message._' });
  }
}
