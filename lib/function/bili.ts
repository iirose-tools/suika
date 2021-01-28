import bot from '../bot';
import logger from '../logger';
import got from 'got';
import NodeCache from 'node-cache';

const cache: NodeCache = new NodeCache();

const bili = {
  video_aid: async (aid: string) => {
    const key = `video_${aid}`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`http://api.bilibili.com/x/web-interface/view?aid=${aid}`);
    const e = JSON.parse(r.body);
    
    if(e.code === 0){
      cache.set(key, JSON.stringify(e.data), 3600*12);
      return e.data;
    }
    
    return null;
  },
  video_bvid: async (bvid: string) => {
    const key = `video_${bvid}`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`http://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    const e = JSON.parse(r.body);
    
    if(e.code === 0){
      cache.set(key, JSON.stringify(e.data), 3600*12);
      return e.data;
    }
    
    return null;
  },
  audio: async (sid: string) => {
    const key = `audio${sid}`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${sid}`);
    const e = JSON.parse(r.body);

    if(e.code === 0){
      cache.set(key, JSON.stringify(e.data), 3600*12);
      return e.data;
    }
    
    return null;
  },
  hotword: async () => {
    const key = `hotword`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`http://s.search.bilibili.com/main/hotword`);
    const e = JSON.parse(r.body);

    if(e.code === 0){
      cache.set(key, JSON.stringify(e.list), 3600);
      return e.list;
    }
    
    return null;
  },
  bangumi: {
    timeline: async () => {
      const key = `bangumi_timeline`;
      const c: string | undefined = cache.get(key);

      if(c) return JSON.parse(c)

      const r = await got(`https://bangumi.bilibili.com/web_api/timeline_global`);
      const e = JSON.parse(r.body);

      if(e.code === 0){
        cache.set(key, JSON.stringify(e.result), 3600);
        return e.result;
      }
      
      return null;
    },
    today: async () => {
      const result = await bili.bangumi.timeline();
      if(result) {
        const date = new Date();
        const today = `${date.getMonth() + 1}-${date.getDate()}`;

        let data = null;

        Object.values(result).forEach((e: any) => {
          if(e.date === today) {
            data = e;
          }
        });
        
        return data;
      } else {
        return null;
      }
    }
  }
}

export default () => {
  bot.cmd(/(a|A)(v|V)(\d+)/gm, async (m, e, reply) => {
    const aid = m[3];
    const data = await bili.video_aid(aid);
    if(!data) return;
    const t = [];
    
    t.push(`[Bilibili]`)
    t.push(`[av${data.aid}]`);
    t.push(`[${data.bvid}]`);
    t.push(`https://b23.tv/${data.bvid}`);
    t.push(data.pic);
    t.push(`标题: ${data.title}`);
    t.push(`简介: ${data.desc}`);
    t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`);
    t.push(`投稿时间: ${new Date(data.pubdate*1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
    t.push(`分区: ${data.tname}`);
    t.push(`获赞数: ${data.stat.like}`);
    t.push(`投币数: ${data.stat.coin}`);
    reply(t.join('\n'));
  })
  
  bot.cmd(/BV(\w{10})/gm, async (m, e, reply) => {
    const bvid = m[1];
    const data = await bili.video_bvid(bvid);
    const t = [];
    
    t.push(`[Bilibili]`)
    t.push(`[av${data.aid}]`);
    t.push(`[${data.bvid}]`);
    t.push(`https://b23.tv/${data.bvid}`);
    t.push(data.pic);
    t.push(`标题: ${data.title}`);
    t.push(`简介: ${data.desc}`);
    t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`);
    t.push(`投稿时间: ${new Date(data.pubdate*1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
    t.push(`分区: ${data.tname}`);
    t.push(`获赞数: ${data.stat.like}`);
    t.push(`投币数: ${data.stat.coin}`);
    reply(t.join('\n'));
  })
  
  bot.cmd(/^B站热搜$/gm, async (m, e, reply) => {
    const data = await bili.hotword();

    if(!data){
      reply(`[Bilibili] 查询失败`);
    }else{
      const t: string[] = [];
      data.forEach(async (e: any, i: number) => {
        const icon = e.icon.length === 0 ? 'http://i0.hdslb.com/bfs/feed-admin/e9e7a2d8497d4063421b685e72680bf1cfb99a0d.png' : e.icon;
        t.push(`[${icon}@16w_16h?a.jpg] ${i + 1}. ${e.keyword}`);
      });
      reply(t.join('\n'));
    }
  })
  
  bot.cmd(/^今日新番$/gm, async (m, e, reply) => {
    const data: any = await bili.bangumi.today();
    const mapping: any = {
      1: '一',
      2: '二',
      3: '三',
      4: '四',
      5: '五',
      6: '六',
      7: '日'
    };
  
    if(data) {
      const week: string = mapping[data.day_of_week] || data.day_of_week;
      const msg: string[] = [];
  
      msg.push(`今天是 星期${week}, 将有 ${Object.keys(data.seasons).length} 部新番放送！`)
  
      Object.values(data.seasons).forEach((e: any) => {
        msg.push(`《${e.title}》将于 ${e.pub_time} 更新 ${e.pub_index}`)
      });
  
      reply(msg.join('\n'));
    } else {
      reply('[Bilibili] 读取失败');
    }
  })

  logger('Bilibili').info('Bilibili 启动完成');
}