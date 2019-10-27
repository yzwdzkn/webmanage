'use strict';

module.exports = app => {

  // 会员牌局详情
  app.router.get('/admin/userManage/cardGameQuery', app.controller.admin.userManage.cardGameQuery.index);
  app.router.get('/admin/userManage/cardGameQuery/indexByUser', app.controller.admin.userManage.cardGameQuery.indexByUser);
  app.router.get('/admin/userManage/cardGameQuery/list', app.controller.admin.userManage.cardGameQuery.list);
  app.router.post('/admin/userManage/cardGameQuery/findRoom', app.controller.admin.userManage.cardGameQuery.findRoomByGameId);
  app.router.get('/admin/userManage/cardGameQuery/findByGameNo', app.controller.admin.userManage.cardGameQuery.findByGameNo);
  app.router.post('/admin/userManage/cardGameQuery/export', app.controller.admin.userManage.cardGameQuery.export);

};
