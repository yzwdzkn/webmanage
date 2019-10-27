'use strict';

module.exports = app => {

  // 平台监控
  app.router.get('/admin/operateManage/riskManage/platfromMonitor', app.controller.admin.operateManage.riskManage.platfromMonitor.index);
  app.router.get('/admin/operateManage/riskManage/platfromMonitor/list', app.controller.admin.operateManage.riskManage.platfromMonitor.list);

  // 游戏监控
  app.router.get('/admin/operateManage/riskManage/gameMonitor', app.controller.admin.operateManage.riskManage.gameMonitor.index);
  app.router.get('/admin/operateManage/riskManage/gameMonitor/list', app.controller.admin.operateManage.riskManage.gameMonitor.list);
  //  app.router.post('/admin/operateManage/killNumberManage/gameKill/getGameKill', app.controller.admin.operateManage.killNumberManage.gameKill.getGameKill);
  //  app.router.post('/admin/operateManage/killNumberManage/gameKill/saveKill', app.controller.admin.operateManage.killNumberManage.gameKill.saveGameKill);

  //  app.router.get('/admin/operateManage/killNumberManage/historyOperation', app.controller.admin.operateManage.killNumberManage.historyOperation.index);
  //  app.router.get('/admin/operateManage/killNumberManage/historyOperation/list', app.controller.admin.operateManage.killNumberManage.historyOperation.list);

};
