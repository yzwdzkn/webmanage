'use strict';

module.exports = app => {
  // 前端功能开关
  app.router.get('/admin/systemSetting/frontfunctionalSwitch', app.controller.admin.systemSetting.frontfunctionalSwitch.index);
  app.router.get('/admin/systemSetting/frontfunctionalSwitch/:id', app.controller.admin.systemSetting.frontfunctionalSwitch.get);
  app.router.post('/admin/systemSetting/frontfunctionalSwitch/save', app.controller.admin.systemSetting.frontfunctionalSwitch.save);


};
