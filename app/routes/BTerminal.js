'use strict';

module.exports = app => {
  // console.log('#####: ', app.controller.admin.bTerminal);xx
  app.router.get('/service/gameDataManage/totalData/initData', app.controller.admin.gameDataManage.totalData.initData); // 获取数据总览数据
  app.router.get('/service/agentOrderStatistic', app.controller.bTerminal.agentOrderStatistic); // 获取代理统计数据
  app.router.post('/service/platformInfo', app.controller.admin.platformManage.platformManage.get); // 查看平台余额
  app.router.post('/service/agent/saveInOutMoney', app.controller.admin.platformManage.platformManage.saveInOutMoneyByAgent); // 代理充值,提现 充值,平台余额减少,代理提现,平台余额增加
  // app.router.post('/service/agent/saveInOutMoney', app.controller.admin.platformManage.platformManage.saveInOutMoneyByAgent); // 代理充值,提现 充值,平台余额减少,代理提现,平台余额增加
  app.router.post('/service/user/saveInOutMoney', app.controller.admin.platformManage.platformManage.saveInOutMoneyByUser); // 信用玩代理下的玩家上下分, 上分 平台余额减少,下分 平台余额增加

  app.router.post('/service/user/rollbackMoney', app.controller.admin.platformManage.platformManage.rollbackMoney); // 玩家上下分失败,回滚平台分数
  app.router.post('/service/user/addPlatformOrder', app.controller.admin.platformManage.platformManage.addPlatformOrder); // 信用玩代理下的玩家上下分平台 添加平台账单


  app.router.get('/service/platform/allGames', app.controller.admin.gameManage.gameManage.list); // 查询平台游戏列表
  app.router.get('/service/platform/games', app.controller.admin.gameManage.platformGameManage.list); // 查询平台游戏列表
  app.router.post('/service/platform/games', app.controller.admin.gameManage.platformGameManage.add); // 新增平台游戏
  app.router.put('/service/platform/games', app.controller.admin.gameManage.platformGameManage.edit); // 修改平台游戏
  app.router.delete('/service/platform/games', app.controller.admin.gameManage.platformGameManage.delete); // 删除平台游戏
  app.router.get('/service/platform/games/detail', app.controller.admin.gameManage.platformGameManage.findGameById); // 根据id获取游戏


  app.router.get('/service/gameDataManage/totalData/registerNum', app.controller.admin.gameDataManage.totalData.registerNum); // 获取
  // app.router.get('/service/gameDataManage/totalData/initData', app.controller.admin.gameDataManage.totalData.initData);
  app.router.get('/service/gameDataManage/retain/list', app.controller.admin.gameDataManage.retain.list); // 获取留存
  app.router.get('/service/gameDataManage/retain/total', app.controller.admin.gameDataManage.retain.total); // 获取留存


  app.router.post('/service/userDataInfo', app.controller.admin.riskManagement.userMonitor.findUserDataInfoByPlatform); // 查询玩家数据等，玩家在线情况
  app.router.post('/service/userDataInfoAll', app.controller.admin.riskManagement.userMonitor.findUserDataInfoByPlatformAll); // 查询玩家数据等，玩家在线情况
  app.router.get('/service/userList', app.controller.admin.userManage.userManage.list);
  // B端查询玩家在线,及数据情况
  app.router.post('/service/userInfo', app.controller.admin.userManage.userManage.bFindUserInfo);
  // app.router.post('/service/userInfoExport', app.controller.admin.userManage.userManage.bFindUserInfoExport);


  app.router.post('/service/userStatus', app.controller.admin.userManage.userManage.updateUserStatusByPlatform); // 更新用户状态
  app.router.get('/service/seeUserCarry', app.controller.admin.userManage.userManage.seeCarry); // 查看用户携带
  app.router.get('/service/clearUserMoney', app.controller.admin.userManage.userManage.clearMoney); // 清除用户携带
  app.router.get('/service/userForcedOffline', app.controller.admin.userManage.userManage.forcedOffline); // 强制下线
  app.router.post('/service/userInOutMoney', app.controller.admin.userManage.userManage.userInOutMoney); // 玩家上下分


  app.router.post('/service/cardQuery', app.controller.admin.userManage.cardGameQuery.list); // 查询玩家牌局
  app.router.get('/service/cardDetails', app.controller.admin.dataManage.cardGameQuery.findByGameNo); // 查询玩家详情

  app.router.get('/service/syncOrder', app.controller.admin.userManage.userManage.syncOrder); // 同步orders 表的数据
  app.router.get('/service/syncPlayerData', app.controller.admin.userManage.userManage.syncPlayerData); // 同步player_data 表的数据

  app.router.get('/service/agentUserPlayerData', app.controller.admin.userManage.userManage.agentUserPlayerData); // 同步player_data 表的数据


  // 根据平台id获取平台信息
  app.router.post('/service/platformManage/platformInfo', app.controller.admin.platformManage.platformManage.get);
  // 平台今日数据
  app.router.get('/service/platformManage/platformRealtimeData/list', app.controller.admin.platformManage.platformRealtimeData.list);
  // 历史
  app.router.get('/service/platformManage/platformHistoryData/list', app.controller.admin.platformManage.platformHistoryData.list);
  // app.router.post('/service/platformManage/platformHistoryData/findCard', app.controller.platformManage.platformHistoryData.findCard); // 查询玩家牌局
  app.router.post('/service/platformManage/platformHistoryData/changeStatus', app.controller.admin.platformManage.platformHistoryData.changePlatStatus);
  app.router.post('/service/platformManage/platformHistoryData/changeStatusAll', app.controller.admin.platformManage.platformHistoryData.changePlatStatusAll);
  // 平台账变明细
  app.router.get('/service/platformManage/platformOrderManage/list', app.controller.admin.platformManage.platformOrderManage.list);
  app.router.post('/service/platformManage/platformOrderManage/export', app.controller.admin.platformManage.platformOrderManage.export);

  app.router.get('/service/platformManage/platformTotalManage/list', app.controller.admin.platformManage.platformTotalManage.list);
  app.router.get('/service/platformManage/platformTotalManage/listReport', app.controller.admin.platformManage.platformTotalManage.listReport);
  app.router.get('/service/platformManage/platformTotalManage/agentSettlement', app.controller.admin.platformManage.platformTotalManage.agentSettlement);
  app.router.post('/service/platformManage/platformTotalManage/export', app.controller.admin.platformManage.platformTotalManage.export);

  app.router.get('/service/platformManage/platformHistoryData/findCard', app.controller.admin.platformManage.platformHistoryData.findCard);

  // 代理结算接口
  app.router.post('/service/platformManage/agentManage/changeStatus', app.controller.admin.platformManage.agentManage.changeStatus);
  app.router.post('/service/platformManage/agentManage/changeStatusAll', app.controller.admin.platformManage.agentManage.changeStatusAll);


  // 平台余额
  app.router.get('/service/platformManage/platformManage/list', app.controller.admin.platformManage.platformManage.list);

  // 会员追杀
  app.router.get('/service/riskManagement/userKill/list', app.controller.admin.riskManagement.userKill.list);
  app.router.post('/service/riskManagement/userKill/saveKill', app.controller.admin.riskManagement.userKill.saveKill);
  app.router.post('/service/riskManagement/userKill/export', app.controller.admin.riskManagement.userKill.export);
  app.router.get('/service/riskManagement/userKill/getUserKill', app.controller.admin.riskManagement.userKill.getUserKill);

  // 房间设置
  app.router.get('/service/gameManage/gameRoomManage/list', app.controller.admin.gameManage.gameRoomManage.listB);
  app.router.get('/service/gameManage/gameRoomManage/findRoomById', app.controller.admin.gameManage.gameRoomManage.findRoomByIdB);
  app.router.get('/service/gameManage/gameRoomManage/findRoomByIdS', app.controller.admin.gameManage.gameRoomManage.findRoomById);
  app.router.put('/service/gameManage/gameRoomManage/editRoomB', app.controller.admin.gameManage.gameRoomManage.editRoomB);
  // 游戏输赢统计
  app.router.get('/service/dataManage/list', app.controller.admin.dataManage.gameLostwinStatistics.list);


  // 根据平台和账户查询
  app.router.post('/service/findByPlatAndUsername', app.controller.admin.userManage.userManage.findByPlatAndUsername);
  // 查询id
  app.router.post('/service/findById', app.controller.admin.userManage.userManage.get);


};
