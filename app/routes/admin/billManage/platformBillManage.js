'use strict';

module.exports = app => {
  // 平台账单管理
  app.router.get('/admin/billManage/platformBillManage', app.controller.admin.billManage.platformBillManage.index);
  app.router.get('/admin/billManage/platformBillManage/list', app.controller.admin.billManage.platformBillManage.list);
  app.router.get('/admin/billManage/platformBillManage/baseInfo', app.controller.admin.billManage.platformBillManage.baseInfo);
  app.router.get('/admin/billManage/platformBillManage/export', app.controller.admin.billManage.platformBillManage.export);

};
