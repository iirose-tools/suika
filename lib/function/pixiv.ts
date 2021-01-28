import got from 'got';
import logger from '../logger';
import bot from '../bot'

interface SearchResult {
  id: Number
  title: string
  
  image_urls: {
    square_medium: string
    medium: string
    large: string
  }
  
  meta_single_page: {
    original_image_url: string
  }

  meta_pages: {
    image_urls: {
      square_medium: string
      medium: string
      large: string
      original: string
    }
  }[]

  tags: {
    name: string
    translated_name: string
  }[]
}

const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

const pixiv = {
  search: async (keyword: string): Promise<SearchResult | null> => {
    try {
      const result = await got(`http://api.peer.ink/api/v1/pixiv/search/popular?keyword=${encodeURIComponent(keyword)}`);
      const body = JSON.parse(result.body);
  
      if (body.code === 200) {
        const imgs = body.result;
        const max = Object.keys(imgs).length;
        
        let id = getRandomInt(0, max);
        let i = 0;
        while(imgs[id].sanity_level >= 4) {
          id = getRandomInt(0, max);
  
          if(i >= 5){
            id = -1;
            break;
          }
        }
  
        if(id === -1) return null;
        return imgs[id];
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
}

export default () => {
  bot.cmd(/^搜图(.*)$/, async (m, e, reply) => {
    const keyword = m[1];
    try {
      const result = await pixiv.search(keyword);
      if(!result) {
        return reply('[Pixiv] 没有搜索到任何结果');
      }

      const urls: string[] = [];
      
      const tags: Array<string> = [];

      result.tags.forEach(e => {
        tags.push(`#${e.name}`);
      });

      if(result.meta_single_page) {
        urls.push(`[${result.meta_single_page.original_image_url.replace('i.pximg.net', 'i.pixiv.cat')}#e]`)
      } else {
        result.meta_pages.forEach(e => {
          urls.push(`[${e.image_urls.original.replace('i.pximg.net', 'i.pixiv.cat')}#e]`)
        })
      }

      reply([
        `${urls.join('\n')}`,
        '',
        result.title,
        '',
        tags.join(', ')
      ].join('\n'))
    } catch(e) {
      return reply('[Pixiv] 没有搜索到任何结果');
    }
  });

  logger('Pixiv').info('Pixiv 启动完成');
}