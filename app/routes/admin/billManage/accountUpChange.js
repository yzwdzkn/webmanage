'use strict';

module.exports = app => {
  // 会员账单上分明细路由
  app.router.get('/admin/billManage/accountUpChange/', app.controller.admin.billManage.accountUpChange.index);
  app.router.get('/admin/billManage/accountUpChange/list', app.controller.admin.billManage.accountUpChange.list);
  app.router.post('/admin/billManage/accountUpChange/lock', app.controller.admin.billManage.accountUpChange.lock);
};
