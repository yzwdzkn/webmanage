'use strict';

module.exports = app => {
  // 玩家对局日志
  app.router.get('/admin/billManage/agentCommissionManage', app.controller.admin.billManage.agentCommissionManage.index);
  app.router.get('/admin/billManage/agentCommissionManage/list', app.controller.admin.billManage.agentCommissionManage.list);
  app.router.get('/admin/billManage/agentCommissionManage/export', app.controller.admin.billManage.agentCommissionManage.export);
  app.router.put('/admin/billManage/agentCommissionManage/status', app.controller.admin.billManage.agentCommissionManage.changeStatus);
};
