const { allCommands } = require('../main');

module.exports = {
  command: 'menu',
  info: '',
  private: false,
  func: async (conn, m, text) => {
    let cmd = '';
    allCommands().forEach(async (cm) => {
       if (cm.command !== 'menu') cmd += '*' + PREFIX + cm.command + '* -\n_' + cm.info + '_\n\n';
    });
    return await m.reply({ text: cmd });
  }
}
