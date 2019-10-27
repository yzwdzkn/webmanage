'use strict';

module.exports = app => {
  require('./billManage/platformBillManage')(app); // 玩家输赢详情
  require('./billManage/agentCommissionManage')(app); // 代理佣金结算
  require('./billManage/userAgentBillManage')(app); // 全民代结算
  require('./billManage/userAgentSettlementManage')(app); // 会员业绩明细
  require('./billManage/financeManage')(app); // 财务设置
};
