'use strict';

module.exports = app => {
  // 会员追杀
  app.router.get('/admin/riskManagement/userKill', app.controller.admin.riskManagement.userKill.index);
  app.router.get('/admin/riskManagement/userKill/list', app.controller.admin.riskManagement.userKill.list);
  app.router.post('/admin/riskManagement/userKill/saveKill', app.controller.admin.riskManagement.userKill.saveKill);
  app.router.get('/admin/riskManagement/userKill/getUserKill', app.controller.admin.riskManagement.userKill.getUserKill);
  app.router.post('/admin/riskManagement/userKill/export', app.controller.admin.riskManagement.userKill.export);

};
