import logger from '../logger';
import bot from '../bot'

export default () => {
  bot.bot.on(bot.event.PublicMessageEvent, e => {
    if(e.message.content.substr(0, 1) === '/') {
      const m = e.message.content.substr(1).split(' ');
      const ref = e.message.referredMessages.pop();
      if(ref) {
        if(m[1]) {
          bot.bot.createMessage({
            content: ` [*${e.message.user.username}*]  ${m[0]}  [*${ref.username}*]  ${m[1]} !`,
            color: '66ccff'
          })
        } else {
          bot.bot.createMessage({
            content: ` [*${e.message.user.username}*]  ${m[0]}了  [*${ref.username}*]  !`,
            color: '66ccff'
          })
        }
      }
    }
  })

  logger('Fun').info('Fun 启动完成');
}