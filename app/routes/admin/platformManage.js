'use strict';

module.exports = app => {

  require('./platformManage/platformManage')(app); // 平台管理
  require('./platformManage/platformOrderManage')(app); // 平台账变明细
  require('./platformManage/platformTotalManage')(app); // 平台账单结算
};
