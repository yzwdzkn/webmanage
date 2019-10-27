/* eslint-disable eqeqeq */
'use strict';


const Controller = require('egg').Controller;
const moment = require('moment');
const code = require('../../../tools/statusCode');
let index = 1000;

class GameServerController extends Controller {

  /**
   * 消息队列模式 插入redis队列
   */
  async setQueue() {
    await this.messageQueue();
    // try {
    //   console.log(this.ctx.method);
    //   let params;
    //   if (this.ctx.method === 'GET') {
    //     params = this.ctx.query; // 获取get请求
    //   } else if (this.ctx.method === 'POST') {
    //     params = this.ctx.request.body; // 获取POST请求
    //   } else {
    //     params = {};
    //   }
    //   console.log('params: ', params);
    //   await this.app.redis.set('name', 'xuwenbo');
    //   console.log('################');
    //   const result = await this.app.redis.lpush('MSGQ', JSON.stringify(params));
    //   console.log('setQueue result: ', result);
    //   this.ctx.body = {
    //     status: code.CODE_0.code,
    //     msg: code.CODE_0.msg,
    //     params,
    //   };
    // } catch (error) {
    //   this.ctx.body = {
    //     status: code.CODE_12.code,
    //     msg: code.CODE_12.msg,
    //   };
    // }
  }

  /**
   * 消息队列模式 插入redis队列
   */

  async messageQueue() {
    try {
      console.log(this.ctx.method);

      let params;
      if (this.ctx.method === 'GET') {
        params = this.ctx.query; // 获取get请求
      } else if (this.ctx.method === 'POST') {
        params = this.ctx.request.body; // 获取POST请求
      } else {
        params = {};
      }
      // console.log('params:', params);
      const serialNumber = params.sn || `${Date.now()}_${index++}`;
      const serialArr = await this.app.redis.lrange('serialNumber', 0, -1); // 获取redis中所有流水号
      if (serialArr.includes(String(serialNumber))) { // 判断流水号是否存在
        this.ctx.body = {
          status: 0,
          msg: `${serialNumber} 流水号已存在.`,
        };
        return;
      }
      // 记录流水号
      await this.app.redis.lpush('serialNumber', serialNumber); // 从列表左边插入
      const lingth = await this.app.redis.llen('serialNumber'); // 获取列表长度
      if (lingth > 10000) { // 长度大于一万时删除最后一个,及删除最右边那个
        await this.app.redis.rpop('serialNumber');
      }

      let result;
      if (params.action == '3') { // 游戏数据
        result = await this.app.redis.lpush('MQ', JSON.stringify(params));
        await this.app.redis.lpush('MQ_beifen', JSON.stringify(params));
      } else if (params.action == '4') { // 统计数据
        result = await this.app.redis.lpush('MQSTATIC', JSON.stringify(params));
        await this.app.redis.lpush('MQSTATIC_beifen', JSON.stringify(params));
      }
      // const result = await this.app.redis.set(`MQ:${serialNumber}`, JSON.stringify(params));
      // console.log('messageQueue result: ', result);
      this.ctx.body = {
        status: code.CODE_0.code,
        msg: code.CODE_0.msg,
      };
    } catch (error) {
      this.ctx.body = {
        status: code.CODE_12.code,
        msg: code.CODE_12.msg,
      };
    }
  }

  /**
   * 直接数据出来-旧版
   */
  async index() {
    // console.log('this is index: ', this.ctx.method);
    let params;
    if (this.ctx.method === 'GET') {
      params = this.ctx.query; // 获取get请求
    } else if (this.ctx.method === 'POST') {
      params = this.ctx.request.body; // 获取POST请求
    } else {
      params = {};
    }
    // console.log(params);
    switch (parseInt(params.action)) {
      case 1: // 玩家进入房间 （弃用）
        await this.userInRoom(params);
        break;
      case 2:// 玩家退出房间  （弃用）
        await this.userOutRoom(params);
        break;
      case 3: // 保持游戏数据
        await this.saveGameRecord();
        break;
      case 4:// 保存玩家站起信息（玩家玩完每把游戏的数据）
        await this.savePlayerData();
        break;
      default:
        this.ctx.body = {
          status: code.CODE_13.code,
          msg: code.CODE_13.msg,
          params,
        };
    }
  }

  /**
   * 玩家进入房间
   * @param {*} params
   */
  async userInRoom(params) {
    // http://192.168.1.28:7003/gameServer?action=1&username=abc&room_id=101&datetime=2019-08-01 12:00:00
    console.log('玩家进入房间');
    // 验证必要参数存不存在
    if (await this.service.tools.verifParamsIsNull(params.username, params.room_id, params.datetime)) {
      this.ctx.body = {
        status: code.CODE_11.code,
        msg: code.CODE_11.msg,
        params,
      };
      return;
    }
    await this.service.userLoginRoom.create(params);
    this.ctx.body = {
      status: code.CODE_0.code,
    };
  }

  /**
   * 玩家退出房间
   * @param {*} params
   */
  async userOutRoom(params) {
    // http://192.168.1.28:7003/gameServer?action=2&username=abc&room_id=101&datetime=2019-08-01 12:10:00
    console.log('玩家退出房间');
    // 验证必要参数存不存在
    if (await this.service.tools.verifParamsIsNull(params.username, params.room_id, params.datetime)) {
      this.ctx.body = {
        status: code.CODE_11.code,
        msg: code.CODE_11.msg,
        params,
      };
      return;
    }
    const result = await this.service.userLoginRoom.findUserLastLoginRecord(params.username); // 查询这个会员最后一次进入房间的记录
    const in_room_time = moment(result.in_room_time).unix();
    const interval = params.datetime - in_room_time;
    await this.service.userLoginRoom.update(Object.assign({ id: result.id, interval }, params)); // 更新退出房间的时间
    this.ctx.body = {
      status: code.CODE_0.code,
    };
  }


  /**
   * 保持游戏数据
   */
  async saveGameRecord() {
    this.service.dataStatistics.gameRecord.parseRecord(this.ctx.request.body);
  }

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
  async savePlayerData() {
    const body = this.ctx.request.body;
    const record = body.record;
    if (!record.isRobot) { // 添加个人统计信息
      // console.log('savePlayerData:', body);
      await Promise.all([
        this.service.dataStatistics.roomData.saveRoomData(record, body.tm), // 统计每个房间的每天数据
        this.service.dataStatistics.playerData.savePlayerData(record, body.tm), // 统计玩家的每天数据
        this.service.dataStatistics.userData.saveUserData(record), // 统计玩家总数据
        this.service.dataStatistics.agentData.saveAgentData(record, body.tm), // 统计代理的每天数据
        this.service.dataStatistics.platformData.savePlatformData(record, body.tm), // 统计平台的每天数据
        this.service.dataStatistics.gameData.saveGameData(record, body.tm, body.gameType), // 统计每个游戏

        this.service.orders.saveUserGameOrder(record, body.gameId), // 统计会员账单明细
      ]);

    } else { // 机器人统计信息
      await this.service.dataStatistics.robotData.saveRobotData(record, body.tm); // 统计机器人每天数据
    }
    this.ctx.body = {
      status: 0,
    };

  }

}
module.exports = GameServerController;
