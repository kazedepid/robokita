module.exports = {
  command: 'leave',
  info: 'Leave the WhatsApp group.',
  private: true,
  func: async (conn, m, text) => {
    if (!m.isGroup) return await m.reply({ text: '*This command can only be used in groups!*' });
    await m.reply({ text: '*Leaving...*' }).then(async () => {
     await conn.groupLeave(m.chat);
    });
  }
};
