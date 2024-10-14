const fs = require('fs');
const { parseJson } = require('../helpers/utils');
const { install } = require('../helpers/database/commands');
const { allCommands } = require('../main');

module.exports = {
  command: 'install',
  info: 'Installs an external command from raw url.',
  private: true,
  func: async (conn, m, text) => {
    if (!text) return await m.reply({ text: '*Please enter a raw url of command to install command!*' });
    try {
      new URL(text);
    } catch {
      return await m.reply({ text: '*Invalid url, enter a valid raw url of command to install command!*' });
    }
    text = text.includes('raw') ? text : (text.endsWith('/') ? (text+'raw') : (text+'/raw'));
    let name = '', content = '';
    try {
     content = await parseJson(text);
     if (!/module|exports|command|func|(conn|m|text)/.test(content)) {
      return await m.reply({ text: '*The command must follow the syntax!*' });
     }
     name = content.match(/command:\s*'([^']+)'/)[1];
    } catch (e) {
     console.log(e);
     return await m.reply({ text: '*Invalid url, enter a valid raw url of command to install command!*' });
    }
    allCommands().map(async (cmd) => {
      if (cmd.name == name) return await m.reply({ text: '*A command already exists with this name!*' });
    });
    fs.writeFileSync(__dirname + '/' + name + '.js', content)
    try {
      require(__dirname + '/' + name);
    } catch (e) {
      await m.reply({ text: '*Unable to install command, an error occurred:*\n```' + e + '```' });
      return fs.unlinkSync(__dirname + '/' + name + '.js');
    }
    await install(name, text);
    return await m.reply({ text: '*Successfully installed ' + name + '!*' });
  }
};
