'use strict';

module.exports = app => {
  require('./dataManage/gameLostwinStatistics')(app); // 游戏输赢统计
};
