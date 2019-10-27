'use strict';

module.exports = app => {
  // 数据总览get24HoursNum
  app.router.get('/admin/gameDataManage/totalData', app.controller.admin.gameDataManage.totalData.index);
  app.router.get('/admin/gameDataManage/totalData/initData', app.controller.admin.gameDataManage.totalData.initData);
  app.router.get('/admin/gameDataManage/totalData/registerNum', app.controller.admin.gameDataManage.totalData.registerNum);
  app.router.get('/admin/gameDataManage/totalData/onlineNumberByMonth', app.controller.admin.gameDataManage.totalData.getOnlineNumberByMonth);
};
