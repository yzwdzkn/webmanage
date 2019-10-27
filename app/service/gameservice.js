'use strict';

const Service = require('egg').Service;
class GameService extends Service {
  async addSql(params) {
    // console.log('addSql: ', params);
    let result = false;
    result = await this.saveGameRecord(params);
    return result;
  }

  async addStatistic(params) {
    let result = false;
    result = await this.savePlayerData(params);
    return result;
  }

  async addOrder(params) {
    let result = false;
    try {
      result = await this.ctx.model.Orders.create({
        order_id: params.order_id,
        user_id: params.user_id,
        agent_id: params.agent_id,
        pre_score: params.pre_score,
        score: params.score,
        deduct_gold: params.deduct === undefined ? 0 : params.deduct,
        current_score: params.current_score,
        type: params.type,
        game_id: params.game_id,
        platform_id: params.platform_id,
        ip: params.ip,
        status: params.status,
        create_time: new Date(),
        update_time: new Date(),
        create_operator: params.create_operator,
      });
    } catch (error) {
      this.app.logger.error('存会员输赢账单记录失败：', error);
      result = false;
    }
    return result;
  }


  /**
    *保持游戏数据
    * @param {*} params params
    */
  async saveGameRecord(params) {
    try {
      return await this.ctx.service.dataStatistics.gameRecord.parseRecord(params);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // eslint-disable-next-line jsdoc/require-param
  /**
       * 保存玩家站起信息（玩家玩完每把游戏的数据）
       * 结构：
       { record:
          {
            roomType: 602,
            win: -1000,
            chip: 372899,
            deduct: 0,
            duration: 41,
            isNew: false,
            isRobot: true,
            lineCode: 0,
            aid: 6000,
            validBet: 1000,
            gamesn: 1348621,
            sn: 120400001,
            gameNo: '20190624094839-60213486211',
            matchType: 6,
            name: '28286303',
            take: 373899
          },
        tm: 1561340960,
        s: 2,
        gameType: 'esyd' }
       */
  async savePlayerData(params) {
    const body = params;
    const record = body.record;
    if (!record.isRobot) { // 添加个人统计信息
      await Promise.all([
        this.service.dataStatistics.roomData.saveRoomData(record, body.tm), // 统计每个房间的每天数据
        this.service.dataStatistics.playerData.savePlayerData(record, body.tm), // 统计玩家的每天数据
        this.service.dataStatistics.userData.saveUserData(record), // 统计玩家总数据
        this.service.dataStatistics.agentData.saveAgentData(record, body.tm), // 统计代理的每天数据
        this.service.dataStatistics.platformData.savePlatformData(record, body.tm), // 统计平台的每天数据
        this.service.dataStatistics.gameData.saveGameData(record, body.tm, body.gameType), // 统计每个游戏
        this.service.orders.saveUserGameOrder(record, body.gameId, body.sn), // 统计会员账单明细
      ]);
    } else { // 机器人统计信息
      await this.service.dataStatistics.robotData.saveRobotData(record, body.tm); // 统计机器人每天数据
    }
    return true;
  }
}

module.exports = GameService
;
