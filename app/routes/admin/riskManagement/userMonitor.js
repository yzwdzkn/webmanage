'use strict';

module.exports = app => {
  // 会员监控
  app.router.get('/admin/riskManagement/userMonitor', app.controller.admin.riskManagement.userMonitor.index);
  app.router.get('/admin/riskManagement/userMonitor/list', app.controller.admin.riskManagement.userMonitor.list);
  app.router.post('/admin/riskManagement/userMonitor/saveMonitor', app.controller.admin.riskManagement.userMonitor.saveMonitor);
  // app.router.put('/admin/platformManage/userMonitor/userStatus', app.controller.admin.platformManage.userManage.changeUserStatus);
  app.router.put('/admin/riskManagement/userMonitor/userStatus', app.controller.admin.userManage.userManage.changeUserStatus);

  app.router.get('/admin/platformManage/userMonitor/detailLog', app.controller.admin.riskManagement.robot.detailLog);
};
