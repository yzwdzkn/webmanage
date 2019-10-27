'use strict';

module.exports = app => {
  // 平台列表
  app.router.get('/admin/platformManage/platformManage', app.controller.admin.platformManage.platformManage.index);
  app.router.get('/admin/platformManage/platformManage/list', app.controller.admin.platformManage.platformManage.list);
  app.router.get('/admin/platformManage/platformManage/detail', app.controller.admin.platformManage.platformManage.detail);
  app.router.post('/admin/platformManage/platformManage/savePlatform', app.controller.admin.platformManage.platformManage.savePlatform);
  app.router.post('/admin/platformManage/platformManage/get', app.controller.admin.platformManage.platformManage.get);
  app.router.post('/admin/platformManage/platformManage/saveInOutMoney', app.controller.admin.platformManage.platformManage.saveInOutMoney);
  app.router.post('/admin/platformManage/platformManage/saveVersion', app.controller.admin.platformManage.platformManage.saveVersion);


  // 平台历史数据
  app.router.get('/admin/platformManage/platformHistoryData', app.controller.admin.platformManage.platformHistoryData.index);
  app.router.get('/admin/platformManage/platformHistoryData/list', app.controller.admin.platformManage.platformHistoryData.list);
  app.router.post('/admin/platformManage/platformHistoryData/export', app.controller.admin.platformManage.platformHistoryData.export);
  app.router.post('/admin/platformManage/platformHistoryData/changeStatus', app.controller.admin.platformManage.platformHistoryData.changeStatus);
  app.router.post('/admin/platformManage/platformHistoryData/changeStatusAll', app.controller.admin.platformManage.platformHistoryData.changeStatusAll);
  app.router.get('/admin/platformManage/platformHistoryData/cardIndex', app.controller.admin.platformManage.platformHistoryData.cardIndex);
  app.router.get('/admin/platformManage/platformHistoryData/findCard', app.controller.admin.platformManage.platformHistoryData.findCard);
  app.router.post('/admin/platformManage/platformHistoryData/cardExport', app.controller.admin.platformManage.platformHistoryData.cardExport);


  // 平台今日数据
  app.router.get('/admin/platformManage/platformRealtimeData', app.controller.admin.platformManage.platformRealtimeData.index);
  app.router.get('/admin/platformManage/platformRealtimeData/list', app.controller.admin.platformManage.platformRealtimeData.list);
  app.router.post('/admin/platformManage/platformRealtimeData/export', app.controller.admin.platformManage.platformRealtimeData.export);

};
