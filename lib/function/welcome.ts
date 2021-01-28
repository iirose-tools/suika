import logger from '../logger';
import bot from '../bot';

const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

const sentences = [
  [
    // 早上
    '{at} 早上好，阁下昨晚睡的怎样？今天也要元气满满哦~',
    '{at} 早上好，一日之计在于晨，早起是个好习惯！',
    '{at} 早上好阁下，新的一天开始啦，不要忘记吃早饭哦~',
    '{at} 阁下早上好，一起来拥抱世界吧~',
    '{at} 早上好，阁下是刚醒还是没睡?'
  ],
  [
    // 中午
    '{at} 阁下中午好，要睡个午觉嘛？',
    '{at} 午安阁下，来打个盹吧~',
    '{at} 中午了中午了！午餐铃响了没？记得按时吃饭~',
    '{at} 干饭人，干饭魂，不干板就没精神！阁下中午记得要好好吃饭哦~',
    '{at} 吃饱喝足，最适合睡午觉啦！阁下要不要休息一下养养膘~'
  ],
  [
    // 下午
    '{at} 下午好, 愿我的问候如清冷的早晨般滋养阁下！',
    '{at} 有没有睡午觉呀？下午是非常容易犯困的时段，阁下要加油哦！',
    '{at} 下午好下午好！阁下要不要来杯下午茶？',
    '{at} 下午好呀~不知道阁下有没有好好午休呢！午休过后会更有精神哦~',
    '{at} 阁下下午好！一天的时间已经过去大半啦~'
  ],
  [
    // 晚上
    '{at} 晚好，我正通过最亮的星为阁下许愿呢~',
    '{at} 晚上好~ 累了一天，记得要早点休息哟~',
    '{at} 无论天气如何，心里都要装着小星星哦~阁下晚上好！',
    '{at} 晚上好呀~累了一天辛苦啦！栗子酱一直都在阁下身旁，加油！',
    '{at} 阁下晚上好~今晚也要记得早点休息，栗子酱提前祝您晚安好梦~'
  ],
  [
    // 半夜
    '欢迎光临，现在是凌晨，阁下{at}的头发还好吗？',
    '{at} 萤火虫都去歇息了，阁下怎么还不睡觉？',
    '{at} 月亮不睡我不睡，阁下先请~',
    '{at} 让我看看是哪个不听话的孩子还没有乖乖睡觉！【气fufu】',
    '{at} 已经很晚啦，阁下也要早点休息，晚安~'
  ],
  [
    // 特殊
    '{at} 欢迎回来，kokodayo~',
    '{at} 欢迎光临，祝您十连五个金，不过运气谁都有，谁先用完谁先走',
    '{at} 欢迎光临，哼、哼、啊啊啊啊啊啊啊啊',
    '{at} 欢迎回来, https://d0.static.imoe.xyz/share/%E6%AD%8C%E6%9B%B2/damedane.mp3'
  ]
];

const sp = {
  'bh3': {
    // 崩坏三周三和周日概率触发
    'week_3or7': '欢迎回来，今晚深渊结算，关底大盾四路泰坦，{at}打不过，你充钱也打不过'
  }
};

export default () => {
  const users: { [index: string]: boolean } = {}

  bot.bot.on(bot.event.UserJoinEvent, e => {
    if(e.user.isBot()) return;
    if(users[e.user.id]) return;

    users[e.user.id] = true;

    setTimeout(() => {
      delete users[e.user.id]
    }, 1e4);

    const username = ` [*${e.user.username}*] `;const t = new Date().getHours();
    const week = new Date().getDay();
    let welcome = '欢迎回来~';

    if(t >= 5 && t <= 10) {
      // 5:00 ~ 10:00
      const len = sentences[0].length;
      welcome = sentences[0][random(0, len - 1)];
    } else if (t >= 11 && t <= 13) {
      // 11:00 ~ 13:00
      const len = sentences[1].length;
      welcome = sentences[1][random(0, len - 1)];
    } else if (t >= 14 && t <= 19) {
      // 14:00 ~ 19:00
      const len = sentences[2].length;
      welcome = sentences[2][random(0, len - 1)];
    } else if (t >= 20 && t <= 23) {
      // 20:00 ~ 23:00
      const len = sentences[3].length;
      welcome = sentences[3][random(0, len - 1)];
    } else if (t <= 4 || t >= 24) {
      // 24:00 ~ 28:00
      const len = sentences[4].length;
      welcome = sentences[4][random(0, len - 1)];
    }
    
    // 特殊
    if(random(1, 10) <= 1) {
      const len = sentences[5].length;
      welcome = sentences[5][random(0, len - 1)];
    }

    // 周三和周日，1%概率触发
    if((week === 3 || week === 7) && ( t >= 14 && t <= 19 ) && random(1, 100) === 1) welcome = sp.bh3.week_3or7;

    bot.bot.createMessage({
      content: `${welcome.replace(`{at}`, username)}`,
      color: '66ccff'
    });
  })

  logger('Welcome').info('Welcome 启动完成');
}