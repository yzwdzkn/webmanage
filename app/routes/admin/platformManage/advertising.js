'use strict';

module.exports = app => {
  // 广告管理
  app.router.get('/admin/platformManage/advertising', app.controller.admin.platformManage.advertising.index);
  app.router.get('/admin/platformManage/advertising/list', app.controller.admin.platformManage.advertising.list);
  app.router.post('/admin/platformManage/advertising/saveAdvertising', app.controller.admin.platformManage.advertising.saveAdvertising);
  app.router.post('/admin/platformManage/advertising/get', app.controller.admin.platformManage.advertising.get);
  app.router.post('/admin/platformManage/advertising/deleteAdvertising', app.controller.admin.platformManage.advertising.deleteAdvertising);
  app.router.put('/admin/platformManage/advertising/AdvertisingStatus', app.controller.admin.platformManage.advertising.AdvertisingStatus);

};
