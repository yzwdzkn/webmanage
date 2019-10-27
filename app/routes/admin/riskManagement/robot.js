'use strict';

module.exports = app => {
  // 机器人设置
  app.router.get('/admin/riskManagement/robot', app.controller.admin.riskManagement.robot.index);
  app.router.get('/admin/riskManagement/robot/list', app.controller.admin.riskManagement.robot.list);
  app.router.post('/admin/riskManagement/robot/saveMonitor', app.controller.admin.riskManagement.robot.saveMonitor);
  app.router.get('/admin/operateManage/robot/export', app.controller.admin.riskManagement.robot.export);
  app.router.get('/admin/riskManagement/robot/detailLog', app.controller.admin.riskManagement.robot.detailLog);
  app.router.get('/admin/operateManage/robot/detailExport', app.controller.admin.riskManagement.robot.detailExport);

  //   app.router.post('/admin/riskManagement/robot/getGameKill', app.controller.admin.riskManagement.robot.getGameKill);
  //   app.router.post('/admin/riskManagement/robot/saveKill', app.controller.admin.riskManagement.robot.saveGameKill);

};
