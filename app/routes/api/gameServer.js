'use strict';

module.exports = app => {
  // app.router.all('/gameServer', app.controller.api.gameServer.gameServer.setQueue); // 消息队列模式
  // app.router.all('/gameServer', app.controller.api.gameServer.gameServer.index);
  app.router.all('/gameServer', app.controller.api.gameServer.gameServer.messageQueue); // 消息队列模式2

  app.router.all('/loginServer', app.controller.api.gameServer.gameLoginServer.index); // 登录退出接口

  // app.router.post('/gameRecordServer', app.controller.api.gameServer.gameRecordServer.index);
};
