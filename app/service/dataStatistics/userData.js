/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
'use strict';

const Service = require('egg').Service;
const MATCHTYPE = require('../../tools/recordConfig').MATCHTYPE;
let userDataAll; // 记录每个玩家当天数据

/**
 * 该service 用来保存玩家历史以来的总数据。每局数据都会进行计算累计
 */

class UserDataAllService extends Service {

  /**
   * 保存统计每个玩家数据
   * @param {*} record 游戏记录
   */
  async saveUserData(record) {
    const username = record.name + '@' + record.platformId;
    // await this.initUserData();
    if (!userDataAll[username]) {
      userDataAll[username] = {};
      if (record.gameNo) { // dq 10-15
        try {
          this.service.user.updateVariableParam({ is_bet: 1 }, { username: record.name, platform_id: record.platformId });
        } catch (error) {
          console.error('saveUserData:', error);
        }
      }
    }
    await this.save(userDataAll[username], record, username); // 保存玩家数据到内存中
    await this.saveToRedis(username, userDataAll[username]); //  保存玩家数据到redis中
  }

  /**
   * 项目启动时去加载redis 中的数据
   */
  async initUserData() {
    userDataAll = {};
    const info = await this.app.redis.hgetall('userDataAll');

    const key = Object.keys(info);
    for (let i = 0; i < key.length; i++) {
      try {
        userDataAll[key[i]] = JSON.parse(info[key[i]]);
      } catch (error) {
        console.error(info[key[i]]);
      }
    }
  }

  /**
   * 计算每个玩家的统计数据
   * @param {*} obj 存储的对象
   * @param {*} record 要保存的记录数据
   */
  async save(obj, record) {
    if (record.gameNo) { // 是否存在局号
      obj.totalGames = (obj.totalGames || 0) + 1; // 当天总玩的局数
      if (record.win > 0) { // 这局赢钱
        obj.winGames = (obj.winGames || 0) + 1; // 当天赢钱局数
        obj.winGold = (obj.winGold || 0) + (record.win || 0); // 当天赢了多少钱
      } else if (record.win < 0) { // 这局输钱
        obj.lostGames = (obj.lostGames || 0) + 1; // 当天输钱局数
        obj.lostGold = (obj.lostGold || 0) + ((record.win || 0) * -1); // 当天输了多少钱
      }
      if (record.deduct > 0) { // 赢了有抽水
        obj.deductGold = (obj.deductGold || 0) + (record.deduct || 0); // 当天一共抽了多少水
      }
      obj.validBet = (obj.validBet || 0) + (record.validBet || 0); // 当天一共有效投注
      obj.duration = (obj.duration || 0) + (record.duration || 0); // 当天玩家时长（一局玩家开始到结束的中间时长）

      if (record.matchType == MATCHTYPE.DIVE) { // 这局是否是放水的
        obj.diveGames = (obj.diveGames || 0) + 1; // 防水的局数
        obj.diveGold = (obj.diveGold || 0) + Math.abs(record.win || 0); // 放水的金额
        // if (record.win > 0) { // 放水赢了
        //   obj.diveWinGames = (obj.diveWinGames || 0) + 1; // 放水赢的局数
        //   obj.diveWinGold = (obj.diveWinGold || 0) + Math.abs(record.win || 0); // 放水赢的钱
        // } else if (record.win < 0) { // 放水输了
        //   obj.diveWinGames = (obj.diveLostGames || 0) + 1; // 放水输的局数
        //   obj.diveLostGold = (obj.diveLostGold || 0) + Math.abs(record.win || 0); // 放水输的钱
        // }
      } else if (record.matchType == MATCHTYPE.KILL) { // 这局是否是被追杀了的
        obj.killGames = (obj.killGames || 0) + 1; // 追杀的局数
        obj.killGold = (obj.killGold || 0) + Math.abs(record.win || 0); // 追杀的金额
        if (record.win > 0) { // 追杀赢了
          obj.killWinGames = (obj.killWinGames || 0) + 1; // 追杀赢的局数
          obj.killWinGold = (obj.killWinGold || 0) + Math.abs(record.win || 0); // 追杀赢的钱
        } else if (record.win < 0) { // 追杀输了
          obj.killLostGames = (obj.killLostGames || 0) + 1; // 追杀输的局数
          obj.killLostGold = (obj.killLostGold || 0) + Math.abs(record.win || 0); // 追杀输的钱
        }
      }

    } else if (record.updateMoney !== undefined) {
      obj.currentMoney = record.updateMoney; // 记录玩家当前身上金额
      if (obj.sn == undefined || parseInt(record.sn) > parseInt(obj.sn)) {
        obj.sn = record.sn;
      }
    }

  }

  /**
     * 将数据保存到redis中
     * @param {*} username  用户名
     * @param {*} record 玩家数据
     */
  async saveToRedis(username, record) {
    this.app.redis.hset('userDataAll', username, JSON.stringify(record));
  }

  /**
   * 获取玩家总数据
   * @param {*} username
   * @param {*} platform_id
   */
  async getUserDataAll(username, platform_id) {
    await this.initUserData();
    if (username != undefined && platform_id != undefined) {
      return userDataAll[username + '@' + platform_id];
    }
    return userDataAll;
  }
}

module.exports = UserDataAllService;
