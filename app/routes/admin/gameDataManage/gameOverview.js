'use strict';

module.exports = app => {
  app.router.get('/admin/gameDataManage/gameOverview', app.controller.admin.gameDataManage.gameOverview.index);
  app.router.get('/admin/gameDataManage/gameOverview/get24HoursNum', app.controller.admin.gameDataManage.gameOverview.get24HoursNum);
  app.router.get('/admin/gameDataManage/gameOverview/initData', app.controller.admin.gameDataManage.gameOverview.initData);
};
