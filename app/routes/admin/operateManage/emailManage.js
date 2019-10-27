'use strict';

module.exports = app => {

  // 邮件管理
  app.router.get('/admin/operateManage/emailManage', app.controller.admin.operateManage.emailManage.index); //
  app.router.get('/admin/operateManage/emailManage/list', app.controller.admin.operateManage.emailManage.list);
  app.router.post('/admin/operateManage/emailManage/saveEmail', app.controller.admin.operateManage.emailManage.saveEmail);
  app.router.post('/admin/operateManage/emailManage/delEmail', app.controller.admin.operateManage.emailManage.delEmail);
  app.router.post('/admin/operateManage/emailManage/sendEmail', app.controller.admin.operateManage.emailManage.sendEmail);
};
