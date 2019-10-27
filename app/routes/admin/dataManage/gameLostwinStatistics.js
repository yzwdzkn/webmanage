'use strict';

module.exports = app => {

  // 玩家输赢统计
  app.router.get('/admin/dataManage/gameLostwinStatistics', app.controller.admin.dataManage.gameLostwinStatistics.index);
  app.router.get('/admin/dataManage/gameLostwinStatistics/list', app.controller.admin.dataManage.gameLostwinStatistics.list);
  app.router.post('/admin/dataManage/gameLostwinStatistics/findRoom', app.controller.admin.dataManage.gameLostwinStatistics.findRoomByGameId);
  app.router.post('/admin/dataManage/gameLostwinStatistics/export', app.controller.admin.dataManage.gameLostwinStatistics.export);


};
