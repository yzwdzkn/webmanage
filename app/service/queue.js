'use strict';

const Service = require('egg').Service;
// const code = require('../tools/statusCode');

class QueueService extends Service {

  constructor(ctx) {
    super(ctx);
    this.redisBlocking = null;
    // this.result;
  }

  async MQ() {
    // console.log('=====================>>>>>> MQ');
    const result = await this.app.redis.rpoplpush('MQ', 'MQ_BK'); // 可以使用异步处理,统计数据扔到新的消息队列,独立进程处理 by X 2019-09-19
    if (result) {
      const flag = await this.ctx.service.gameservice.addSql(JSON.parse(result));
      this.app.redis.lrem('MQ_BK', -1, result);
      if (!flag) {
        this.app.redis.rpush('MQ_ERROR', result); // 错误的消息移到MSGQ_ERROR队列中y
      }
    } else {
      await this.sleep(100);
    }
  }

  async mqOrder() {
    // console.log('=====================>>>>>> MQ:order');
    const result = await this.app.redis.rpoplpush('MQ:order', 'MQ_BK:order'); // 可以使用异步处理,统计数据扔到新的消息队列,独立进程处理 by X 2019-09-19
    if (result) {
      const flag = await this.ctx.service.gameservice.addOrder(JSON.parse(result));
      this.app.redis.lrem('MQ_BK:order', -1, result);
      if (!flag) {
        this.app.redis.rpush('MQ_ERROR:order', result); // 错误的消息移到MSGQ_ERROR队列中y
      }
    } else {
      await this.sleep(100);
    }
  }

  async statisticMQ() {
    // console.log('=====================>>>>>> statisticMQ');
    const result = await this.app.redis.rpoplpush('MQSTATIC', 'MQSTATIC_BK'); // 可以使用异步处理,统计数据扔到新的消息队列,独立进程处理 by X 2019-09-19
    if (result) {
      const flag = await this.ctx.service.gameservice.addStatistic(JSON.parse(result));
      this.app.redis.lrem('MQSTATIC_BK', -1, result);
      if (!flag) {
        this.app.redis.rpush('MQSTATIC_ERROR', result); // 错误的消息移到MSGQ_ERROR队列中
      }
    } else {
      await this.sleep(100);
    }
  }

  /**
   * 消息队列
   */
  async mq() {
    const keys = await this.app.redis.keys('MQ:*');
    try {

      for (let i = 0; i < keys.length; i++) {
        const info = await this.app.redis.get(keys[i]);
        if (info) {
          const result = await this.ctx.service.gameservice.addSql(JSON.parse(info));
          // console.log('result: ', result);
          if (result) {
            await this.app.redis.del(keys[i]);
          }
        }
      }

    } catch (error) {
      console.log('error:', error);
      return false;
    }
    return !!keys.length;
  }

  async sleep(time) {
    return new Promise(resolve => {
      setTimeout(() => { resolve(); }, time);
    });
  }
}
module.exports = QueueService
;
