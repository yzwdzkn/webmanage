'use strict';

module.exports = app => {
  // 会员在线
  app.router.get('/admin/operateManage/userOnlineManage/index', app.controller.admin.operateManage.userOnlineManage.index);
  app.router.get('/admin/operateManage/userOnlineManage/userOnlineBytime', app.controller.admin.operateManage.userOnlineManage.getUserByTime);

  app.router.get('/admin/operateManage/userOnlineManage/onlineNumberByDay', app.controller.admin.operateManage.userOnlineManage.getOnlineNumberByDay);
  app.router.get('/admin/operateManage/userOnlineManage/onlineNumberByMonth', app.controller.admin.operateManage.userOnlineManage.getOnlineNumberByMonth);
};
