import bot from '../bot';
import logger from '../logger';
import got from 'got';

interface Items {
  itemId: string,
  name: string,
  description: string,
  rarity: number,
  iconId: string,
  overrideBkg: any,
  stackIconId: string,
  sortId: number,
  usage: string,
  obtainApproach: any,
  classifyType: string,
  itemType: string,
  stageDropList: {
    stageId: string,
    occPer: string
  }[],
  buildingProductList: {
    roomType: string,
    formulaId: number
  }[]
}

const getData = async (): Promise<Items[] | null> => {
  try {
    const result = await got('https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData@latest/zh_CN/gamedata/excel/item_table.json')
    const data = JSON.parse(result.body);
    const items: Items[] = []

    Object.values(data.items).forEach((e: any) => {
      items.push(e);
    });

    return items;
  } catch (error) {
    return null;
  }
}

const getItem = async (name: string): Promise<Items[] | null> => {
  const items = await getData();
  if(items) {
    let item: Items[] = [];
    items.forEach(e => {
      if(e.name.indexOf(name) !== -1) {
        item.push(e)
      }
    });
    return item;
  } else {
    return null;
  }
}

const request = async (path: string) => {
  try {
    const result = await got(`https://penguin-stats.cn/PenguinStats${path}`);
    
    if(result.statusCode === 200) return JSON.parse(result.body);
    return null;
  }catch(e) {
    return null;
  }
}

export const getStagesByID = async (id: string) => {
  const path = `/api/v2/stages/${id}`;
  const result = await request(path);
  if(result) {
    if(result.code == 404) return null;

    return result;
  }

  return null;
}

export const GetMatrix = async (item: string) => {
  const path = `/api/v2/result/matrix?itemFilter=${item}&server=CN`;
  const result = await request(path);
  if(result) return result.matrix;
  return null;
}

export default () => {
  bot.cmd(/^查物品(.*)$/, async (m, e, reply) => {
    const result = await getItem(m[1]);
    if(result) {
      const msg: string[] = [];
      result.forEach(e => {
        msg.push(`[${e.name}]\n ${e.usage.replace('\\n', '\n')} \n ${e.description.replace('\\n', '\n')}`);
      })
      reply(msg.join('\n\n==========================\n\n'));
    } else {
      reply('[Arknights] 未找到')
    }
  })
  
  bot.cmd(/^查掉落(.*)$/, async (m, e, reply) => {
    reply('[Arknights] 正在查询...')
    const stats = {
      query: 0,
      startAt: new Date().getTime()/1e3
    };
    const msg: string[] = [];
    const p1: any[] = [];
    const p2: any[] = [];
    // 查询物品id
    const result = await getItem(m[1]);
    stats.query++;
    if(result) {
      for(const index in result) {
        const item = result[index];
        // 查询物品掉落
        stats.query++;
        const tmp = GetMatrix(item.itemId);
        p1.push(tmp);
        tmp.then(matrix => {
          if(matrix) {
            for(const index in matrix) {
              const e = matrix[index];
              const rate = e.quantity/e.times;
              // 查询关卡信息
              stats.query++;
              const tmp = getStagesByID(e.stageId);
              p2.push(tmp);
              tmp.then(stage => {
                if(stage) {
                  const cost = Math.round((stage.apCost/rate)*1e2)/1e2;
                  msg.push(`[${item.name} - ${stage.code}] 掉落率: ${Math.round(rate*1e4)/1e2}%, 理智消耗: ${stage.apCost}, 平均单件消耗理智: ${cost}`);
                }
              })
            }
          }
        })
      }
  
      Promise.all(p1).then(e => {
        Promise.all(p2).then(e => {
          msg.push(`[Status] 请求次数: ${stats.query}`);
          msg.push(`[Status] 查询耗时: ${Math.round(((new Date().getTime()/1e3) - stats.startAt)*1e6)/1e6}s`);
          reply(msg.join('\n'));
        })
      })
    } else {
      reply('[Arknights] 未找到\n[Status] 请求次数: 1')
    }
  })

  logger('Arknights').info('Arknights 启动完成');
}