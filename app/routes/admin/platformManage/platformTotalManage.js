'use strict';

module.exports = app => {
  // 平台账变统计
  app.router.get('/admin/platformManage/platformTotalManage', app.controller.admin.platformManage.platformTotalManage.index);
  app.router.get('/admin/platformManage/platformTotalManage/list', app.controller.admin.platformManage.platformTotalManage.list);
  app.router.post('/admin/platformManage/platformTotalManage/export', app.controller.admin.platformManage.platformTotalManage.export);

};
