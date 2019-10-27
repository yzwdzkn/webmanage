/**
 * 1分钟一次定时器获取当前在线
 */
'use strict';

module.exports = app => {
  return {
    schedule: {
      cron: '0 */1 * * * *', // 1分钟一次
      type: 'worker', // worker 类型：每台机器上只有一个 worker 会执行这个定时任务
      immediate: false, // 应用启动并 ready 后立刻执行一次这个定时任务
      disable: app.config.disableTimer,
    },
    async task(ctx) {
      // const time = parseInt(Date.now());
      // console.log('schedule1Minutes执行定时任务task:', time);
      ctx.service.dataStatistics.currentOnline.requestOnlineInfo();
    },
  };
};
