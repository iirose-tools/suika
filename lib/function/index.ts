import logger from '../logger';

import pixiv from './pixiv';
import help from './help';
import dice from './dice';
import welcome from './welcome';
import Arknights from './arknights';
import Bangumi from './bangumi';
import bili from './bili';

export default () => {
  logger('Core').info('正在启动...');
  pixiv();
  help();
  dice();
  welcome();
  Arknights();
  Bangumi();
  bili();
  logger('Core').info('启动完成');
}