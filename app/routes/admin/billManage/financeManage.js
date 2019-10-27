'use strict';

module.exports = app => {
  // 玩家对局日志
  app.router.get('/admin/billManage/financeManage', app.controller.admin.billManage.financeManage.index);
  app.router.get('/admin/billManage/financeManage/show', app.controller.admin.billManage.financeManage.show);
  app.router.post('/admin/billManage/financeManage', app.controller.admin.billManage.financeManage.save);
//   app.router.get('/admin/billManage/financeManage/list', app.controller.admin.billManage.agentCommissionManage.list);
//   app.router.get('/admin/billManage/financeManage/export', app.controller.admin.billManage.agentCommissionManage.export);
};
