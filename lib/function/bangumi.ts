import got from 'got';
import logger from '../logger';
import bot from '../bot'

interface UserInfo {
  id: number
  url: string
  username: string
  nickname: string
  avatar: {
    large: string
    medium: string
    small: string
  },
  sign: string,
  usergroup: number
}

interface CollectionItem {
  "name": string
  "subject_id": number
  "ep_status": number
  "vol_status": number
  "lasttouch": number
  "subject": {
    "id": number
    "url": string
    "type": number
    "name": string
    "name_cn": string
    "summary": string
    "eps": number
    "eps_count": number
    "air_date": string
    "air_weekday": number
    "images": {
      "large": string
      "common": string
      "medium": string
      "small": string
      "grid": string
    },
    "collection": {
      "doing": number
    }
  }
}

export const user = {
  userInfo: async (username: string): Promise<UserInfo | null> => {
    try {
      const result = JSON.parse((await got(`https://api.bgm.tv/user/${username}`)).body);
      if(result.error) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  },
  userCollection: async (username: string, cat: ('watching' | 'all_watching'), ids?: number[], responseGroup?: ('medium' | 'small')): Promise<CollectionItem[] | null> => {
    try {
      const url = `https://api.bgm.tv/user/${username}/collection?cat=${cat}&responseGroup=${responseGroup || ''}&ids=${ids ? ids.join(',') : ''}`;
      const result = JSON.parse((await got(url)).body);
      if(result.error) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  },
  userCollectionsStatus: async (username: string) => {
    try {
      const result = JSON.parse((await got(`https://api.bgm.tv/user/${username}/collections/status?app_id=bgm1741600d4a496bed5`)).body);
      if(result.error) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  }
}

export default () => {
  bot.cmd(/^(.*)在看啥$/, async (m, e, reply) => {
    const username: string = m[1];
    const userInfo = await user.userInfo(username);
    const collection = await user.userCollection(username, 'watching');
  
    const msg: string[] = [];
  
    if(userInfo && collection) {
      msg.push(`=====${userInfo.nickname} 在看的番剧=====`);
      Object.values(collection).forEach(e => {
        msg.push(`${e.subject.name_cn || e.subject.name}: ${e.ep_status}/${e.subject.eps_count || e.subject.eps || 'unknown'}`);
      })
    } else {
      msg.push(`[Bangumi] 查询失败`);
    }
  
    reply(msg.join('\n'));
  });

  logger('Bangumi').info('Bangumi 启动完成');
}