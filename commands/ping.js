module.exports = {
  command: 'ping',
  info: 'Measures the ping.',
  private: false,
  func: async (conn, m, text) => {
    let then = Date.now();
    let message = await m.reply({
      text: '```Ping!```'
    });
    await m.reply({
      delete: message
    });
    let now = Date.now();
    return await m.reply({
      text: '*Ping!*\n```' + (now - then) + 'ms```'
    });
  }
}
