'use strict';

module.exports = app => {

  /**
   * 跑马灯管理路由
   */
  app.router.get('/admin/operateManage/horselightManage', app.controller.admin.operateManage.horselightManage.index);
  app.router.get('/admin/operateManage/horselightManage/list', app.controller.admin.operateManage.horselightManage.list);
  app.router.post('/admin/operateManage/horselightManage/saveHorselight', app.controller.admin.operateManage.horselightManage.saveHorselight);
  app.router.post('/admin/operateManage/horselightManage/get', app.controller.admin.operateManage.horselightManage.get);
  app.router.post('/admin/operateManage/horselightManage/deleteHorselight', app.controller.admin.operateManage.horselightManage.deleteHorselight);
  app.router.post('/admin/operateManage/horselightManage/findGame', app.controller.admin.operateManage.horselightManage.findGame);
  app.router.put('/admin/operateManage/horselightManage/horselightStatus', app.controller.admin.operateManage.horselightManage.horselightStatus);

};
