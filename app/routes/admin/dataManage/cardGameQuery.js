'use strict';

module.exports = app => {

  // 玩家对局日志
  app.router.get('/admin/dataManage/cardGameQuery', app.controller.admin.dataManage.cardGameQuery.index);
  app.router.get('/admin/dataManage/cardGameQuery/list', app.controller.admin.dataManage.cardGameQuery.list);
  app.router.post('/admin/dataManage/cardGameQuery/findRoom', app.controller.admin.dataManage.cardGameQuery.findRoomByGameId);
  app.router.get('/admin/dataManage/cardGameQuery/findByGameNo', app.controller.admin.dataManage.cardGameQuery.findByGameNo);

};
