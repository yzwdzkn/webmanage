'use strict';

module.exports = app => {
  // 会员账单明细路由
  app.router.get('/admin/billManage/accountChange', app.controller.admin.billManage.accountChange.index);
  app.router.get('/admin/billManage/accountChange/list', app.controller.admin.billManage.accountChange.list);
  app.router.post('/admin/billManage/accountChange/manualBill', app.controller.admin.billManage.accountChange.manualBill);
};
