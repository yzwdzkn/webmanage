'use strict';

module.exports = app => {
  // 代理管理
  app.router.get('/admin/platformManage/agentManage', app.controller.admin.platformManage.agentManage.index);
  app.router.get('/admin/platformManage/agentManage/list', app.controller.admin.platformManage.agentManage.list);
  app.router.post('/admin/platformManage/agentManage/agentAccount', app.controller.admin.platformManage.agentManage.createAccount);
  app.router.get('/admin/platformManage/agentManage/:id/agentAccount', app.controller.admin.platformManage.agentManage.getTheAgentAccount);
  app.router.put('/admin/platformManage/agentManage/:id/agentAccount', app.controller.admin.platformManage.agentManage.editTheAccount);
  app.router.delete('/admin/platformManage/agentManage/:id/agentAccount', app.controller.admin.platformManage.agentManage.deleteTheAccount);
  app.router.put('/admin/platformManage/agentManage/:id/agentAccount/resetPassword', app.controller.admin.platformManage.agentManage.resetPassword);
  app.router.get('/admin/platformManage/agentManage/:id/authMenu', app.controller.admin.platformManage.agentManage.authMenu);
  app.router.post('/admin/platformManage/agentManage/saveMenu', app.controller.admin.platformManage.agentManage.saveMenu);

};
