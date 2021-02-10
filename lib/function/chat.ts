import bot from '../bot';
import logger from '../logger';
import got from 'got';
import config from '../../config';
import util from 'util';

export default () => {
  bot.bot.on(bot.event.PublicMessageEvent, async e => {
    if(e.message.user.isBot()) return;    // 不响应BOT的消息
    if(e.message.user.username === config.account.username) return;     // 不响应自己发送的消息

    const reply = (msg: string, color: string = '66ccff') => {
      const data = `${e.message.content} (_hr) ${e.message.user.username}_${Math.round(new Date().getTime()/1e3)} (hr_) ${msg}`;
      bot.bot.createMessage({
        color: color,
        content: data
      })
    }

    if(e.message.content.indexOf(`[*${config.account.username}*]`) !== -1 || e.message.content.indexOf(config.app.nickname) !== -1 ) {
      const msg = e.message.content.replace(`[*${config.account.username}*]`, '').replace(config.app.nickname, '').trim();
      
      if(msg.length === 0) {
        reply('阁下有什么事吗?')
      } else {
        try {
          const result = JSON.parse((await got(encodeURI(`http://api.qingyunke.com/api.php?key=free&appid=0&msg=${msg}`))).body);
          reply(result.content.split('{br}').join('\n').replace(/菲菲/gm, config.app.nickname).replace(/妈咪/gm, '阁下'));
        } catch (error) {
          reply([
            '出现了意料之外的错误',
            'ERROR:',
            util.inspect(error)
          ].join('\n'))
        }
      }
    }
  })

  logger('Chat').info('Chat 启动完成');
}