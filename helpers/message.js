/**

   * Tidak ada apa apa di sini
   * Hanya serialize

*/

const { getContentType, generateWAMessageContent, generateForwardMessageContent, waUploadToServer, downloadContentFromMessage, jidDecode } = require('@whiskeyconnets/baileys');
const fs = require('fs');

/**
 * The main function that handles incoming messages.
 * @param {Object} m - Received message.
 * @param {Object} conn - WhatsApp connection.
 * @param {Object} store - Data store.
 */
module.exports = async (m, conn, store) => {
  if (m.key) {
    m.me = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id;
    m.chat = m.key.remoteJid;
    m.id = m.key.id;
    m.fromMe = m.key.fromMe;
    m.isGroupChat = m.isGroup = m.key.remoteJid.endsWith('g.us');
    m.isPrivateChat = m.isPrivate = m.key.remoteJid.endsWith('.net');
    m.sender = m.from = m.fromMe ? m.me : m.isGroupChat ? m.key.participant : m.chat;
    m.fromBot = m.isBaileys = m.sender === m.me;
    if (m.isGroupChat) m.participant = m.key.participant;
  }

  if (m.message) {
    m.mtype = getContentType(m.message);
    m.text = (m.mtype === 'conversation') ? m.message.conversation :
              (m.mtype === 'imageMessage') ? m.message.imageMessage.caption :
              (m.mtype === 'videoMessage') ? m.message.videoMessage.caption :
              (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
              (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
              (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
              (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
              (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.msg) : '';


    m.msg = (m.mtype === 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
    m.replied = m.msg?.contextInfo ? m.m.contextInfo.quotedMessage : false;
    m.mentions = m.msg?.contextInfo ? m.m.contextInfo.mentionedJid : [];
    m.command = (m.text.includes(' ') ? m.text.split(' ')[0] : m.text).replace(m.text.charAt(0), '');


    if (m.replied) {
      m.replied.id = m.m.contextInfo.stanzaId || false;
      m.replied.chat = m.m.contextInfo.remoteJid || m.chat;
      m.replied.fromBot = m.replied.isBaileys = m.replied.id ? m.replied.id.startsWith('BAE5') && m.replied.id.length === 16 : false;
      m.replied.sender = m.replied.from = m.m.contextInfo.participant || false;
      m.replied.mentions = m.m.contextInfo ? m.m.contextInfo.mentionedJid : [];
      m.replied.fromMe = m.replied.me = m.replied.sender === m.me;
      m.replied.mtype = getContentType(m.replied);
      m.replied.viewonce = m.replied?.viewOnceMessage?.message || m.replied?.viewOnceMessageV2?.message || m.replied?.viewOnceMessageV2Extension?.message || false;
      m.replied.text = m.replied.text || m.replied.caption || m.replied.conversation || m.replied.contentText || m.replied.selectedDisplayText || m.replied.title || false;
      m.replied.image = m.replied.viewonce?.imageMessage || m.replied.imageMessage || false;
      m.replied.video = m.replied.viewonce?.videoMessage || m.replied.videoMessage || false;
      m.replied.audio = m.replied.viewonce?.audioMessage || m.replied.audioMessage || false;
      m.replied.sticker = m.replied.stickerMessage || false;
      m.replied.document = m.replied.documentMessage || false;
    }
  }


  m.isOwner = m.sender === m.me;

  /**
   * @typedef {Object} awaitMessageOptions
   * @property {Number} [timeout] - Time in milliseconds to wait for the message
   * @property {String} sender - The sender to wait for
   * @property {String} chatJid - The chat to wait for
   * @property {(message: Baileys.proto.IWebMessageInfo) => Boolean} [filter] - Filter used
   */
  /**
   * Function to wait for specific messages based on options.
   * @param {awaitMessageOptions} options 
   * @returns {Promise<Baileys.proto.IWebMessageInfo>}
   */
  conn.awaitMessage = async (options = {}) => {
    return new Promise((resolve, reject) => {
      if (typeof options !== 'object') reject(new Error('Options must be an object'));
      if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
      if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
      if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
      if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));

      const timeout = options?.timeout || undefined;
      const filter = options?.filter || (() => true);
      let interval = undefined;

      /**
       * Listener to handle incoming messages.
       * @param {{messages: Baileys.proto.IWebMessageInfo[], type: Baileys.MessageUpsertType}} data 
       */
      let listener = (data) => {
        let { type, messages } = data;
        if (type === 'notify') {
          for (let message of messages) {
            const fromMe = message.key.fromMe;
            const chatId = message.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            const isStatus = chatId === 'status@broadcast';

            const sender = fromMe ? conn.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
            if (sender === options.sender && chatId === options.chatJid && filter(message)) {
              conn.ev.off('messages.upsert', listener);
              clearTimeout(interval);
              resolve(message);
            }
          }
        }
      };

      conn.ev.on('messages.upsert', listener);
      
      if (timeout) {
        interval = setTimeout(() => {
          conn.ev.off('messages.upsert', listener);
          reject(new Error('Timeout'));
        }, timeout);
      }
    });
  }

  // Function untuk membalas pesan
  m.reply = async (message, options, jid = m.chat) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (message.hasOwnProperty('text')) {
      return await conn.sendMessage(jid, { text: message.text, mentions: (await m.getMentions(message.text)), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('image')) {
      return await conn.sendMessage(jid, { image: message.image, caption: (message?.caption || ''), mimetype: (message?.mimetype || 'image/png'), thumbnail: Buffer.alloc(0), mentions: (await m.getMentions(message?.caption)), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('video')) {
      return await conn.sendMessage(jid, { video: message.video, caption: (message?.caption || ''), mimetype: (message?.mimetype || 'video/mp4'), thumbnail: Buffer.alloc(0), mentions: (await m.getMentions(message?.caption)), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('audio')) {
      return await conn.sendMessage(jid, { audio: message.audio, ptt: (message?.ptt || false), mimetype: (message?.mimetype || 'audio/mpeg'), waveform: Array(40).fill().map(() => Math.floor(Math.random() * 99)), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('document')) {
      return await conn.sendMessage(jid, { document: message.document, caption: (message?.caption || ''), mimetype: (message?.mimetype || 'application/pdf'), mentions: (await m.getMentions(message?.caption)), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('sticker')) {
      return await conn.sendMessage(jid, { sticker: message.sticker, mimetype: (message?.mimetype || 'image/webp'), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('poll')) {
      return await conn.sendMessage(jid, { poll: { name: message.poll.title, values: message.poll.options }, mentions: (await m.getMentions(message.title + '\n' + String(message.poll.options))), ...message }, { quoted: msg, ...options });
    } else if (message.hasOwnProperty('delete')) {
      return await conn.sendMessage(jid, { delete: message.delete.key });
    } else if (message.hasOwnProperty('edit')) {
      return await conn.relayMessage(jid, { protocolMessage: { key: message.edit.key, type: 14, editedMessage: { conversation: message.edit.text, mentions: (await m.getMentions(message.edit.text)) } }, }, {});
    }
  }

  // Function cek pengirim adalah admin
  m.isAdmin = async (who) => {
    let group = await conn.groupMetadata(m.chat);
    let participant = group.participants.filter(p => p.id == who);
    if (participant.length != 0) return (participant[0].admin === 'superadmin' || participant[0].admin === 'admin') ? true : false;   
    else return false;
  }

  // Function cek seseorang adalah peserta grup
  m.isParticipant = async (who, chat = m.chat) => {
    let group = await conn.groupMetadata(chat);
    let participant = group.participants.filter(p => p.id == who);
    if (participant.length == 0) return false;
    return true;
  }

  // Function untuk mendapatkan mention dari pesan
  m.getMentions = async (message) => {
    let mentions = [];
    try { 
      mentions = [...message.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    } catch {
      mentions = [];
    }
    return mentions;
  }

  // Function untuk memuat isi pesan
  m.load = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    let stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await(let chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  }

  // Function untuk mengirim status
  conn.sendStatus = async (message) => {
    let bg_colours = ["#FF69B4", "#33CCFF", "#CCFF33", "#FFFF66", "#FF9900", "#CC66CC", "#3366FF", "#66CCCC", "#FF99CC", "#33FF66", "#9999FF", "#FF6666", "#33CCCC", "#FFFFCC", "#CCFFCC", "#6666FF", "#99CCFF", "#FFCC66", "#33FFCC", "#CC99FF", "#66FF66", "#FF33CC", "#33CC99", "#FFFF99", "#CC66FF", "#99FFCC", "#6666CC", "#FF99FF", "#33FF99", "#CCFF99", "#66CCCC", "#FF66CC", "#33CC66", "#FFFF33", "#CC99CC", "#66FFCC", "#9999CC"];
    if (message.hasOwnProperty('text')) {
      return await conn.sendMessage('status@broadcast', {
        text: message.text
      }, {
        backgroundColor: bg_colours[Math.floor(Math.random() * bg_colours.length)],
        statusJidList: message.statusJidList
      });
    } else if (message.hasOwnProperty('image')) {
      await conn.sendMessage('status@broadcast', {
        image: message.image,
        mimetype: message?.mimetype || 'image/png',
        caption: message?.caption || ''
      }, {
        statusJidList: message.statusJidList
      });
    } else if (message.hasOwnProperty('video')) {
      await conn.sendMessage('status@broadcast', {
        video: message.video,
        mimetype: message?.mimetype || 'video/mp4',
        caption: message?.caption || ''
      }, {
        statusJidList: message.statusJidList
      });
    } else if (message.hasOwnProperty('audio')) {
      await conn.sendMessage('status@broadcast', {
        audio: message.audio,
        mimetype: message?.mimetype || 'audio/mp4',
        ptt: true
      }, {
        backgroundColor: bg_colours[Math.floor(Math.random() * bg_colours.length)],
        statusJidList: message.statusJidList
      });
    }
  }

  // Function untuk mendapatkan nama dari ID
  conn.getName = async (id) => {
    id = id.toString();
    if (id.endsWith('net')) {
      if (id == conn.user.id) return conn.user.name;
      let s = store.contacts[id];
      try { s = s.name } catch { s = '+' + id.split('@')[0]; }
      return s;
    } else {
      return id;
    }
  }

  return msg;
}