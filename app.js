/* eslint-disable no-constant-condition */
'use strict';
// app.js or agent.js
class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.

    // console.log("configWillLoad");
  }

  configDidLoad() {
    // Config, plugin files have been loaded.
    // console.log("configDidLoad");
  }

  async didLoad() {
    // All files have loaded, start plugin here.
    // console.log("didLoad");
  }

  async willReady() {
    // console.log('加载初始化列表成功');
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.
    // console.log('didReady');
  }

  async serverDidReady() {

    const ctx = this.app.createAnonymousContext();
    let flag = false;
    // let statisticFlag = false;

    // this.app.messenger.on('hb', async () => {
    //   this.ctx.messenger.sendToAgent(null, 'ok');
    // });

    this.app.messenger.on('hb', () => {
      this.app.messenger.sendToAgent('hb_receive', {
        flag,
        pid: process.pid,
      });
    });

    // 一个进程专门处理统计mq数据;
    this.app.messenger.on('startStatisticMQ', async isOpen => {
      console.log(`StatisticMQ PID:${process.pid}`);
      await Promise.all([
        ctx.service.dataStatistics.userData.initUserData(),
        ctx.service.dataStatistics.roomData.initRoomBetNumber(),
        ctx.service.dataStatistics.roomData.initRoomData(),
        ctx.service.dataStatistics.playerData.initPlayerData(),
        ctx.service.dataStatistics.agentData.initAgentBetNumber(),
        ctx.service.dataStatistics.agentData.initAgentData(),
        ctx.service.dataStatistics.platformData.initPlatformBetNumber(),
        ctx.service.dataStatistics.platformData.initPlatformData(),
        ctx.service.dataStatistics.gameData.initGameBetNumber(),
        ctx.service.dataStatistics.gameData.initGameData(),
      ]);

      if (isOpen) {
        flag = isOpen;
        console.log('flag statisticMQ: ', flag);
        for (;;) {
          await ctx.service.queue.statisticMQ(); // 执行消息队列
        }
      }
    });

    // 其余进程处理mq数据
    this.app.messenger.on('startDataMQ', async isOpen => {
      console.log(`MQ PID:${process.pid}`);
      if (isOpen) {
        flag = isOpen;
        console.log('flag MQ: ', flag);
        for (;;) {
          await ctx.service.queue.MQ(); // 数据处理
          await ctx.service.queue.mqOrder();
        }
      }
    });

    // const flag = this.app.config.MQ;
    // console.log('flag: ', flag);
    // if (flag) {
    //   for (; ;) {
    //     await ctx.service.queue.MQ(); // 数据处理
    //   }
    // }
  }

  async beforeClose() {
    // Do some thing before app close.
    // console.log("beforeClose");
  }
}

module.exports = AppBootHook;
