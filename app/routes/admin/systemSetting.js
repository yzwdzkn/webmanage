'use strict';

module.exports = app => {

  require('./systemSetting/adminManage')(app); // 账户管理
  require('./systemSetting/menuManage')(app); // 菜单管理
  require('./systemSetting/roleManage')(app); // 权限管理
  require('./systemSetting/whitelistManage')(app); // 后台白名单管理
  require('./systemSetting/operationLog')(app); // 日志
  require('./systemSetting/recycleBin')(app); // 回收站

};
