'use strict';

module.exports = app => {
  require('./riskManagement/globalKill')(app); // 全局杀数
  require('./riskManagement/historyOperation')(app); // 历史操作
  require('./riskManagement/roomKill')(app); // 房间杀数
  require('./riskManagement/userKill')(app); // 会员追杀
  require('./riskManagement/userMonitor')(app); // 玩家监控
  require('./riskManagement/robot')(app); // 机器人设置

};
