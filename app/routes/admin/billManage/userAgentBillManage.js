'use strict';

module.exports = app => {
  // 全民代结算
  app.router.get('/admin/billManage/userAgentBillManage', app.controller.admin.billManage.userAgentBillManage.index);
  app.router.get('/admin/billManage/userAgentBillManage/list', app.controller.admin.billManage.userAgentBillManage.list);
  app.router.get('/admin/billManage/userAgentBillManage/export', app.controller.admin.billManage.userAgentBillManage.export);

};
