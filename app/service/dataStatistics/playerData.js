/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const tools = require('../../tools/tools');
const MATCHTYPE = require('../../tools/recordConfig').MATCHTYPE;
let playerDataAll; // 记录每个玩家当天数据
let timer = 0;
// let playerDateTime; // 记录当天的时间
class PlayerDataService extends Service {

  /**
     * 将数据保存到数据库。函数一天执行一次
     * @param {*} timestamp
     */
  async saveDataToDatabase(timestamp) {
    if (timer) { // 检查是否有定时器在执行
      return;
    }
    await this.initPlayerData();
    await this.app.redis.set('nodePlayerData', JSON.stringify(playerDataAll)); // 存入redis 中，当作一个时间节点

    const nodeFunc = async () => {
      await this.initPlayerData();
      let nodePlayerData = await this.app.redis.get('nodePlayerData');
      nodePlayerData = nodePlayerData ? JSON.parse(nodePlayerData) : {};
      const itemKey = Object.keys(nodePlayerData).sort();
      let state = 1;
      let index = 0;
      let sql = 'replace into player_data(create_time,username,platform_id,total_games,valid_bet,win_games,win_gold,lost_games,lost_gold,deduct_gold,dive_gold,kill_gold,duration,insert_time) values ';
      let sqlValue = '';
      for (let i = 0; i < itemKey.length; i++) {
        const nodeItem = nodePlayerData[itemKey[i]];
        const item = playerDataAll[itemKey[i]];
        if (i != itemKey.length - 1) {
          sqlValue = sqlValue + await tools.splitPlayerDataSql(itemKey[i], nodeItem); // 拼接sql
          index++;
        } else {
          // 判断是否被处理过
          if (!nodeItem.timestamp.handle) {
            // 判断2个时间戳一样
            if (nodeItem.timestamp.timestamp == item.timestamp.timestamp) {
              console.log('timestamp相同');
              sqlValue = sqlValue + await tools.splitPlayerDataSql(itemKey[i], nodeItem);
              item.timestamp.handle = 1; // 表示这个时间段的数据已经处理
              this.saveToRedis('timestamp', itemKey[i], item.timestamp);// 记录到redis中
            } else {
              console.log('前时间戳：', nodePlayerData[itemKey[i]].timestamp.timestamp);
              nodePlayerData[itemKey[i]].timestamp.timestamp = item.timestamp.timestamp;
              console.log('后时间戳：', nodePlayerData[itemKey[i]].timestamp.timestamp);
              await this.app.redis.set('nodePlayerData', JSON.stringify(nodePlayerData)); // 重新存入redis 中
              state = 0;
              index = i;
              break;
            }
          }
        }
      }
      if (sqlValue != '') {
        sql = sql + sqlValue.substring(0, sqlValue.length - 1);
        console.log('playerData执行sql');
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        console.log('playerData执行成功');
        for (let i = 0; i < index; i++) {
          await this.app.redis.del('playerDataAll:' + itemKey[i]);
          delete playerDataAll[itemKey[i]];
        }
        await this.app.redis.set('nodePlayerData', JSON.stringify(playerDataAll)); // 重新存入redis 中
      }

      if (state == 0) {
        console.log('过一分钟在来执行！');
        timer = 1;
        setTimeout(nodeFunc, 1000 * 60 * 3);
      } else {
        timer = 0;
      }
    };
    setTimeout(nodeFunc, 1000 * 60 * 1.5); // 延后1.5分钟执行
    // this.checkIsSameDay(timestamp);// 检查时间是否在同一天
  }


  /**
     * 保存统计每个玩家每天的数据
     * @param {*} record 游戏记录
     * @param {*} tm  这局游戏结束时间戳
     */
  async savePlayerData(record, tm) {
    const time = moment(new Date(tm * 1000)).format('YYYYMMDD');
    const username = record.name + '-' + record.platformId;
    // await this.initPlayerData();
    if (!playerDataAll[time]) {
      playerDataAll[time] = {};
    }
    playerDataAll[time][username] = playerDataAll[time][username] ? playerDataAll[time][username] : {};
    // 保存更新记录的时间戳
    if (record.gameNo || !playerDataAll[time].timestamp) {
      playerDataAll[time].timestamp = playerDataAll[time].timestamp ? playerDataAll[time].timestamp : {};
      playerDataAll[time].timestamp.timestamp = tm;
      this.saveToRedis('timestamp', time, playerDataAll[time].timestamp); // 保存玩家数据到redis中
    }
    await this.save(playerDataAll[time][username], record, username); // 保存玩家数据到内存中
    await this.saveToRedis(username, time, playerDataAll[time][username]); // 保存玩家数据到redis中
  }

  /**
   * 加载redis 中的数据
   */
  async initPlayerData() {
    playerDataAll = {};
    const keys = await this.app.redis.keys('playerDataAll:*');
    for (let i = 0; i < keys.length; i++) {
      const info = await this.app.redis.hgetall(keys[i]);
      const dateKey = keys[i].substring(keys[i].indexOf(':') + 1, keys[i].length);
      if (!playerDataAll[dateKey]) {
        playerDataAll[dateKey] = {};
      }
      const key = Object.keys(info);
      for (let i = 0; i < key.length; i++) {
        playerDataAll[dateKey][key[i]] = JSON.parse(info[key[i]]);
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
        obj.diveGold = (obj.diveGold || 0) + (record.win || 0);
      } else if (record.matchType == MATCHTYPE.KILL) { // 这局是否是被追杀了的
        obj.killGold = (obj.killGold || 0) + (record.win || 0);
        this.service.user.killUser(record);
      }
    }
  }

  /**
     * 将数据保存到redis中
     * @param {*} username  用户名
     * @param {*} date  时间 20190628
     * @param {*} record 玩家数据
     */
  async saveToRedis(username, date, record) {
    this.app.redis.hset('playerDataAll:' + date, username, JSON.stringify(record));
  }

  // /**
  //    * 检查时间是否在同一天
  //    * @param {*} timestamp
  //    */
  // async checkIsSameDay(timestamp) {
  //   if (!playerDateTime) {
  //     playerDateTime = await this.app.redis.get('playerDateTime'); // 获取保存的当天时间
  //     if (!playerDateTime) {
  //       playerDateTime = timestamp;
  //       this.app.redis.set('playerDateTime', playerDateTime); // 保存到redis
  //     } else {
  //       playerDateTime = parseInt(playerDateTime);
  //     }
  //   }
  //   const tm1 = moment(new Date(playerDateTime));
  //   const tm2 = moment(new Date(timestamp));
  //   if (tm1.date() != tm2.date()) { // 是否是同一天
  //     playerDateTime = timestamp;
  //     this.app.redis.set('playerDateTime', playerDateTime); // 保存到redis
  //   }
  // }

  /**
   * 获取今日的玩家数据
   */
  async getPlayerDataAll() {
    const time = moment(new Date()).format('YYYYMMDD');
    const data = {};
    const info = await this.app.redis.hgetall('playerDataAll:' + time);

    const key = Object.keys(info);
    for (let i = 0; i < key.length; i++) {
      data[key[i]] = JSON.parse(info[key[i]]);
    }
    return data;
  }
}

module.exports = PlayerDataService;
