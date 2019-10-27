'use strict';

module.exports = app => {
  // 回收站
  app.router.get('/admin/systemSetting/recycleBin', app.controller.admin.systemSetting.recycleBin.index);
  app.router.get('/admin/systemSetting/recycleBin/list', app.controller.admin.systemSetting.recycleBin.list);
  app.router.post('/admin/systemSetting/recycleBin/recover', app.controller.admin.systemSetting.recycleBin.recover);
  app.router.post('/admin/systemSetting/recycleBin/shiftDelete', app.controller.admin.systemSetting.recycleBin.shiftDelete);
  app.router.post('/admin/systemSetting/recycleBin/deleteAll', app.controller.admin.systemSetting.recycleBin.deleteAll);
};
