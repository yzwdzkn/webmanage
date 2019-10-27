'use strict';

module.exports = app => {
  // 平台账变明细
  app.router.get('/admin/platformManage/platformOrderManage', app.controller.admin.platformManage.platformOrderManage.index);
  app.router.get('/admin/platformManage/platformOrderManage/list', app.controller.admin.platformManage.platformOrderManage.list);
  app.router.post('/admin/platformManage/platformOrderManage/export', app.controller.admin.platformManage.platformOrderManage.export);

};
