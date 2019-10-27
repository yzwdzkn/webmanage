'use strict';

module.exports = app => {

  // 玩家输赢详情
  app.router.get('/admin/dataManage/userLostwinStatistics', app.controller.admin.dataManage.userLostwinStatistics.index);
  app.router.get('/admin/dataManage/userLostwinStatistics/list', app.controller.admin.dataManage.userLostwinStatistics.list);
  app.router.post('/admin/dataManage/userLostwinStatistics/findRoom', app.controller.admin.dataManage.userLostwinStatistics.findRoomByGameId);
  app.router.get('/admin/dataManage/userLostwinStatistics/detailLog', app.controller.admin.riskManagement.robot.detailLog);


};
