/**
 * 一天执行一次的定时器保存数据
 */
'use strict';

module.exports = app => {
  return {
    schedule: {
      cron: '1 0 0 * * ?', // 每天触发一次
      type: 'worker', // worker 类型：每台机器上只有一个 worker 会执行这个定时任务
      immediate: false, // 应用启动并 ready 后立刻执行一次这个定时任务
      disable: app.config.disableTimer,
    },
    async task(ctx) {
      const time = parseInt(Date.now());
      console.log('定时清除数据:', time);

      ctx.service.dataStatistics.gameData.cleanRealTimeData();
      ctx.service.dataStatistics.roomData.cleanRealTimeData();
      ctx.service.dataStatistics.agentData.cleanRealTimeData();
      ctx.service.dataStatistics.platformData.cleanRealTimeData();

    },
  };

};
