
'use strict';

module.exports = app => {
  app.router.get('/admin/operateManage/historyDataManage', app.controller.admin.operateManage.historyDataManage.index); // 历史数据
  app.router.get('/admin/operateManage/historyDataManage/initData', app.controller.admin.operateManage.historyDataManage.initData); // 初始化数据
};

