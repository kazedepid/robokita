const util = require('util');
const { exec } = require('child_process');

const handleSwicth = async (conn, m, commands) => {
    switch (commands) {
    
        case 'tes':
            await m.reply("okey")
            break;
            
        default:
        
// Source: https://github.com/DikaArdnt/readsw/blob/61582aeb4295e78ad0ca13d78a32f6e0945629a8/message.js#L359 - 376
            // eval
            if (['>', 'eval', '=>'].some(a => m.command.toLowerCase().startsWith(a)) && m.isOwner) {
                let evalCmd = '';
                try {
                    evalCmd = /await/i.test(m.text) ? eval('(async() => { ' + m.text + ' })()') : eval(m.text);
                } catch (e) {
                    evalCmd = e;
                }
                new Promise((resolve, reject) => {
                    try {
                        resolve(evalCmd);
                    } catch (err) {
                        reject(err);
                    }
                })
                    ?.then(res => m.reply(util.format(res)))
                    ?.catch(err => m.reply(util.format(err)));
            }

// Source: https://github.com/DikaArdnt/readsw/blob/61582aeb4295e78ad0ca13d78a32f6e0945629a8/message.js#L378 - 388
            // exec
            if (['$', 'exec'].some(a => m.command.toLowerCase().startsWith(a)) && m.isOwner) {
                try {
                    exec(m.text, async (err, stdout) => {
                        if (err) return m.reply(util.format(err));
                        if (stdout) return m.reply(util.format(stdout));
                    });
                } catch (e) {
                    await m.reply(util.format(e));
                }
            }

            await conn.sendMessage(m.chat, { text: 'Command not recognized.' });
            break;
    }
};

module.exports = { handleSwicth };