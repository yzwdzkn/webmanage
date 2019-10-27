'use strict';

module.exports = app => {
  /**
   * 分享管理路由
   */
  app.router.get('/admin/platformManage/shareManage', app.controller.admin.platformManage.shareManage.index);
  app.router.get('/admin/platformManage/shareManage/list', app.controller.admin.platformManage.shareManage.list);
  app.router.post('/admin/platformManage/shareManage/saveShare', app.controller.admin.platformManage.shareManage.saveShare);
  app.router.post('/admin/platformManage/shareManage/get', app.controller.admin.platformManage.shareManage.get);
  app.router.post('/admin/platformManage/shareManage/deleteShare', app.controller.admin.platformManage.shareManage.deleteShare);
  app.router.get('/admin/platformManage/shareManage/findStationByAgent', app.controller.admin.platformManage.shareManage.findStationByAgent);

};
