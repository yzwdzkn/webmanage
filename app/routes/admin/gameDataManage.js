'use strict';

module.exports = app => {
  require('./gameDataManage/totalData')(app); // 游戏总览
  require('./gameDataManage/gameOverview')(app); // 游戏总览
  require('./gameDataManage/gameLostwin')(app); // 游戏输赢统计
  require('./gameDataManage/retain')(app); // 留存
};
