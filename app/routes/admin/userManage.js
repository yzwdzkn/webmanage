'use strict';

module.exports = app => {
  require('./userManage/userManage')(app); // 会员管理

  require('./userManage/cardGameQuery')(app); // 会员牌局详情
  require('./userManage/userAccountChange')(app); // 会员账单明细
  require('./userManage/userLoginHallManage')(app); // 会员账单明细

};
