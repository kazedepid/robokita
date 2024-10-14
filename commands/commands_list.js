const command = require('../helpers/database/commands');

module.exports = {
  command: 'commands',
  info: 'Shows installed external commands list.',
  private: true,
  func: async (conn, m, text) => {
    let list = '*Installed external commands are:*\n\n';
    let l = await command.list();
    if (l.length < 1) return await m.reply({ text: '*There is no external command installed!*' });
    const commandList = await Promise.all(
      l.map(async (command) => `*${command.name}* : ${command.url}`)
    );
    list += commandList.join('\n\n');
    return await m.reply({ text: list });
  }
};
