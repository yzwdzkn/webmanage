'use strict';

module.exports = app => {
  require('./operateManage/userOnlineManage')(app); // 会员在线
  require('./operateManage/horselightManage')(app); // 跑马灯管理


};
