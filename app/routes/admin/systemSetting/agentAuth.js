'use strict';

module.exports = app => {
  // 代理权限设置
  app.router.get('/admin/systemSetting/agentAuth', app.controller.admin.systemSetting.agentAuth.index);
  app.router.get('/admin/systemSetting/agentAuth/list', app.controller.admin.systemSetting.agentAuth.list);
  app.router.post('/admin/systemSetting/agentAuth/initTree', app.controller.admin.systemSetting.agentAuth.initTree);
  app.router.post('/admin/systemSetting/agentAuth/agentStationAuthMenu', app.controller.admin.systemSetting.agentAuth.agentStationAuthMenu);
  app.router.post('/admin/systemSetting/agentAuth/saveAgentStationAuthMenu', app.controller.admin.systemSetting.agentAuth.saveAgentStationAuthMenu);


};
