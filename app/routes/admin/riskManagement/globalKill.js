'use strict';

module.exports = app => {
  // 全局杀数
  app.router.get('/admin/riskManagement/globalKill', app.controller.admin.riskManagement.globalKill.index);
  app.router.post('/admin/riskManagement/globalKill/saveKill', app.controller.admin.riskManagement.globalKill.saveGlobalKill);
  app.router.post('/admin/riskManagement/globalKill/saveKillStatus', app.controller.admin.riskManagement.globalKill.saveKillStatus);
  app.router.post('/admin/riskManagement/globalKill/saveWaterStatus', app.controller.admin.riskManagement.globalKill.saveWaterStatus);

};
