import logger from '../logger';
import config from '../../config';
import bot from '../bot'
import util from 'util';
import { exec } from 'child_process';

export default () => {
  bot.cmd(/^.exec (.*)$/, async (m, e, reply) => {
    if(config.app.master === e.message.user.username) {
      exec(m[1], (err, stdout, stderr) => {
        reply([
          util.inspect(err),
          '===================',
          stdout,
          '===================',
          stderr
        ].join('\n'));
      })
    } else {
      reply('[exec] 请求已忽略');
    }
  });

  bot.cmd(/^.eval (.*)$/, (m, e, reply) => {
    if(config.app.master === e.message.user.username) {
      try {
        reply(eval(m[1]));
      } catch (error) {
        reply(util.inspect(error));
      }
    } else {
      reply('[exec] 请求已忽略');
    }
  })

  logger('EXEC').info('EXEC 启动完成');
}