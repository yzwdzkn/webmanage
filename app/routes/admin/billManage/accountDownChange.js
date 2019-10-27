'use strict';

module.exports = app => {
  // 会员账单下分明细路由
  app.router.get('/admin/billManage/accountDownChange/', app.controller.admin.billManage.accountDownChange.index);
  app.router.get('/admin/billManage/accountDownChange/list', app.controller.admin.billManage.accountDownChange.list);
  app.router.post('/admin/billManage/accountUpChange/lock', app.controller.admin.billManage.accountUpChange.lock);
};
