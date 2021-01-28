import logger from '../logger';
import bot from '../bot'

export default () => {
  bot.cmd(/^(帮助|help)$/, async (m, e, reply) => {
    reply([
      '====== Pixiv ======',
      '搜图+关键词        搜图',
      '====== 明日方舟 ======',
      `查掉落+关键词      查询素材掉落`,
      `查物品+关键词      查询物品信息`,
      '====== Bangumi ======',
      `用户名+在看啥      看看这位小伙伴在看什么番`,
      '====== 跑团骰子 ======',
      '骰子 数字+d+数字   扔一个跑团骰子',
      '====== Core ======',
      `帮助              查看帮助信息`,
      `help             查看帮助信息`
    ].join('\n'))
  });

  logger('Help').info('Help 启动完成');
}