'use strict';

module.exports = app => {
  // 房间杀数
  app.router.get('/admin/riskManagement/roomKill', app.controller.admin.riskManagement.roomKill.index);
  app.router.get('/admin/riskManagement/roomKill/list', app.controller.admin.riskManagement.roomKill.list);
  app.router.post('/admin/riskManagement/roomKill/getGameKill', app.controller.admin.riskManagement.roomKill.getGameKill);
  app.router.post('/admin/riskManagement/roomKill/saveKill', app.controller.admin.riskManagement.roomKill.saveGameKill);

};
