import logger from '../logger';
import bot from '../bot'

const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

export default () => {
  bot.cmd(/^骰子 (\d+)(D|d)(\d+)$/, async (m, e, reply) => {
    const count = Number(m[1]);
    const max = Number(m[3]);

    const dice = [];
    const msg = [];
    
    let total = 0;
    
    for(let i = 0; i < count; i++) {
      const n = getRandomInt(1, max);
      dice.push(n);
      msg.push(`${i + 1}. ${n}`);
      total += n;
    };
    
    msg.push('');
    msg.push(`${dice.join('+')}=${total}`);

    reply(msg.join('\n'))
  });

  logger('Dice').info('Dice 启动完成');
}