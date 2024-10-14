/**
   *
   * Base di buat oleh Kaze.
   * Jika ingin di jual minimal untuk menambah fitur atau code.
   * 

*/

'use strict';
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, getContentType, jidNormalizedUser, generateForwardMessageContent, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const { Sequelize, DataTypes } = require('sequelize');
const { list, uninstall } = require('./helpers/database/commands');
const { parseJson } = require('./helpers/utils');
const { database } = require('./helpers/database.js');
const Greetings = require('./helpers/database/greetings');
const axios = require('axios');
const pino = require('pino');
const colors = require('colors');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { handleSwicth } = require('./case'); 

if (PLATFORM == 'koyeb') {
  require('http')
   .createServer(async (req, res) => {})
   .listen(process.env?.PORT || 8080, () => true);
}

const Users = database.define('Users', {
    name: {
        primaryKey: true,
        unique: false,
        type: DataTypes.STRING,
        allowNull: false
    },
    id: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

async function Connect() {
    try {
        let store = makeInMemoryStore({
            logger: pino().child({ level: 'silent', stream: 'store' })
        });

        if (SESSION !== false && !fs.existsSync(`./${sessionName}/creds.json`)) {
         try {
          let auth = Buffer.from(SESSION, 'base64').toString();
          fs.writeFileSync(__dirname + `/${sessionName}/creds.json'`, auth);
          console.log('[ - ] Membuat session file...');
         } catch (e) {
          console.error(e);
          throw new Error('[ ! ] Harap masukkan id sesi yang valid');
         }
        }

        let { state, saveCreds } = await useMultiFileAuthState(`./${sessionName}`);
        let conn = makeWASocket({
            logger: pino({ level: DEBUG === true ? 'debug' : 'silent' }),
            printQRInTerminal: false,
            markOnlineOnConnect: false,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            auth: state,
            version: [2, 3000, 1015901307],
            patchMessageBeforeSending: (message) => {
              let requiresPatch = !!(message.buttonsMessage || message.listMessage || message.templateMessage);
              if (requiresPatch) {
                message = {
                  viewOnceMessage: {
                    message: {
                      messageContextInfo: {
                       deviceListMetadata: {},
                       deviceListMetadataVersion: 2,
                      },
                      ...message,
                    },
                  },
                }
              }
              return message;
            },
            getMessage: async (key) => {
              let jid = jidNormalizedUser(key.remoteJid);
              let m = await store.loadMessage(jid, key.id);
              return m?.message || "";
            }
        });
        store.bind(conn.ev);

        conn.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'close') {
                console.log(colors.red('[ ! ] Koneksi Tertutup: Menghubungkan kembali...'));
                await Connect();
            } else if (connection === 'open') {
                console.log(colors.green('[ + ] Terhubung!'));
            }
        });

        let extCommands = await list();
        extCommands.forEach(async (cmd) => {
         if (!fs.existsSync('./commands/' + cmd.name + '.js')) {
          try {
           let content = await parseJson(cmd.url);
           fs.writeFileSync('./commands/' + cmd.name + '.js', content);
           require('./commands/' + cmd.name);
          } catch (e) {
           console.log('[ ! ] ' + cmd.name + ' command crashed.');
           console.error(e);
           try {
            fs.unlinkSync('./commands/' + cmd.name + '.js');
           } catch {}
           await uninstall(cmd.name);
           console.log('[ + ] ' + cmd.name + ' command has been removed!');
          }
         }
        });
        if (extCommands.length > 0) {
         console.log('[ + ] Memuat commands eksternal.');
        }

        conn.ev.on('group-participants.update', async (info) => {
           let gc = await conn.groupMetadata(info.id);
           let subject = gc.title, size = gc.size, owner = gc.owner;
           if (info.action == 'add') {
            let wtext = await Greetings.getMessage('welcome', info.id);
            if (wtext !== false) await conn.sendMessage(info.id, {
             text: wtext.replace(/{subject}/g, subject).replace(/{version}/g, require('./package.json').version).replace(/{size}/g, size).replace(/{owner}/g, '@'+owner.split('@')[0]),
             mentions: [owner]
            });
           } else if (info.action == 'remove') {
            let gtext = await Greetings.getMessage('goodbye', info.id);
            if (gtext !== false) await conn.sendMessage(info.id, {
             text: gtext.replace(/{subject}/g, subject).replace(/{version}/g, require('./package.json').version).replace(/{size}/g, size).replace(/{owner}/g, '@'+owner.split('@')[0]),
             mentions: [owner]
            });
           }
        });
 
        conn.ev.on('messages.upsert', async (m) => {
            m = m.messages[0];
            if (!m.message) return;
            m = await require('./helpers/message')(m, conn, store);
            if (m.chat === 'status@broadcast') return;

            try {
                if (m.text.startsWith(PREFIX)) {
                    const commands = m.text.replace(PREFIX, '').trim();
                    await handleSwicth(conn, m, commands);
                }

                if (allCommands(m.command) || m.isPrivate) {
                    let user = await Users.findAll({ where: { id: m.isPrivate ? m.chat : m.sender } });
                    if (user.length < 1) {
                        await Users.create({ name: m.pushName, id: m.isPrivate ? m.chat : m.sender });
                    } else {
                        await Users[0]?.update({ name: m.pushName });
                    }
                }
            } catch {}

            let admins = ADMINS !== false ? (ADMINS?.includes(',') ? ADMINS?.split(',').map(admin => admin.trim() + '@s.whatsapp.net') : [ADMINS?.trim() + '@s.whatsapp.net']) : [];
            allCommands().forEach(async (command) => {
                if (command.event) await command.event(conn, m, m.text);
                try {
                    if ((MODE === 'private' && (m.fromMe || admins.includes(m.sender))) ||
                        (MODE === 'public' && (!command.private || (m.fromMe || admins.includes(m.sender))))) {
                        let text = m.text?.replace(PREFIX + command.command, '').trim();
                        if (m.text.startsWith(PREFIX + command.command)) {
                            await command.func(conn, m, text);
                        }
                    }
                } catch (e) {
                    console.log(e);
                    await conn.sendMessage(conn.user.id, {
                        text: '*ERROR OCCURRED*\n\n_An error occurred while using ' + m.command + ' command._\n_Please open an issue at https://github.com/kazedepid/robokita/issues for an instant support._\n\n*Error:*\n*' + e.message + '*'
                    });
                }
            });
        });
 
        conn.ev.on('presence.update', () => {});
        conn.ev.on('contacts.upsert', async (contact) => store.bind(contact));
        conn.ev.on('creds.update', saveCreds);
    } catch (e) {
        console.log(e.stack);
        Connect();
    }
}

function allCommands(command) {
 let commands = [];
 fs.readdirSync('./commands').forEach(file => {
  if (file.endsWith('.js')) {
   let command = require('./commands/' + file);
   if (command.event) {
     commands.push({ command: command.command, info: command.info, private: command.private, func: command.func, event: command.event });
   } else {
     commands.push({ command: command.command, info: command.info, private: command.private, func: command.func });
   }
  }
 });
 if (command) {
  return commands.includes(command);
 } else {
  return commands;
 }
}

Connect();

module.exports = {
 Users,
 Connect,
 allCommands
};