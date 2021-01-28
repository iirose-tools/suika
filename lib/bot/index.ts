import * as iirose from 'iirose-bot';
import config from '../../config';
import logger from '../logger';
import fs from 'fs';
import path from 'path';

const bot = new iirose.IIRoseBot(config.account)

bot.start().then(e => {
  logger('BOT').info('启动成功');
}).catch(e => {
  logger('BOT').fatal('启动失败');
})

fs.mkdir(path.join(process.cwd(), 'data'), () => {});

export default {
  bot: bot,
  event: iirose,
  app: {
    root: process.cwd(),
    data: path.join(process.cwd(), 'data')
  },
  cmd: (cmd: RegExp, callback: (m: RegExpExecArray, e: iirose.PublicMessageEventOptions, reply: (text: string) => void) => void) => {
    bot.on(iirose.PublicMessageEvent, e => {
      if(e.message.user.isBot()) return;
      if(e.message.user.username === e.message.bot.username) return;

      cmd.lastIndex = 0;
      if(cmd.test(e.message.content)) {

        logger('Command').info(`${e.message.user.username}(${e.message.user.id}) 触发了 ${cmd} 命令: ${e.message.content}`)

        cmd.lastIndex = 0;
        //@ts-ignore
        const m: RegExpExecArray = cmd.exec(e.message.content);

        const reply = (message: string) => {
          bot.createMessage({
            content: message,
            color: '66ccff'
          })
        }

        callback(m, e, reply);
      }
    })
  }
}