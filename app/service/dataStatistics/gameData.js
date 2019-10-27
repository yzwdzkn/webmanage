/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const tools = require('../../tools/tools');
let gameDataAll; // 记录每个游戏当天数据
let gameBetNumber; // 投注人数
let timer = 0;
class GameDataService extends Service {


  /**
     * 将数据保存到数据库。函数一天执行一次
     */
  async saveDataToDatabase() {
    if (timer) { // 检查是否有定时器在执行
      return;
    }
    await this.initGameData();
    await this.app.redis.set('nodeGameData', JSON.stringify(gameDataAll)); // 存入redis 中，当作一个时间节点

    const nodeFunc = async () => {
      await this.initGameData();
      let nodeGameData = await this.app.redis.get('nodeGameData');
      nodeGameData = nodeGameData ? JSON.parse(nodeGameData) : {};
      const itemKey = Object.keys(nodeGameData).sort();
      let state = 1;
      let index = 0;
      let sql = 'replace into game_data(create_time,game_type,total_games,valid_bet,bet_number,win_games,win_gold,lost_games,lost_gold,deduct_gold,duration,insert_time) values ';
      let sqlValue = '';
      for (let i = 0; i < itemKey.length; i++) {
        const nodeItem = nodeGameData[itemKey[i]];
        const item = gameDataAll[itemKey[i]];
        if (i != itemKey.length - 1) {
          sqlValue = sqlValue + await tools.splitGameDataSql(itemKey[i], nodeItem); // 拼接sql
          index++;
        } else {
          // 判断是否被处理过
          if (!nodeItem.timestamp.handle) {
            // 判断2个时间戳一样
            if (nodeItem.timestamp.timestamp == item.timestamp.timestamp) {
              sqlValue = sqlValue + await tools.splitGameDataSql(itemKey[i], nodeItem);
              item.timestamp.handle = 1; // 表示这个时间段的数据已经处理
              this.saveToRedis('timestamp', itemKey[i], item.timestamp);// 记录到redis中
            } else {
              console.log('前时间戳：', nodeGameData[itemKey[i]].timestamp.timestamp);
              nodeGameData[itemKey[i]].timestamp.timestamp = item.timestamp.timestamp;
              console.log('后时间戳：', nodeGameData[itemKey[i]].timestamp.timestamp);
              await this.app.redis.set('nodeGameData', JSON.stringify(nodeGameData)); // 重新存入redis 中
              state = 0;
              index = i;
              break;
            }
          }
        }
      }
      if (sqlValue != '') {
        sql = sql + sqlValue.substring(0, sqlValue.length - 1);
        console.log('gameData执行sql');
        // 执行sql
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        console.log('gameData执行成功');
        for (let i = 0; i < index; i++) {
          await this.app.redis.del('gameDataAll:' + itemKey[i]);
          delete gameDataAll[itemKey[i]];
        }
        await this.app.redis.set('nodeGameData', JSON.stringify(gameDataAll)); // 重新存入redis 中
      }

      if (state == 0) {
        console.log('过一分钟在来执行！');
        timer = 1;
        setTimeout(nodeFunc, 1000 * 60 * 3);
      } else {
        timer = 0;
      }
    };
    setTimeout(nodeFunc, 1000 * 60 * 3); // 延后3分钟执行
    // this.checkIsSameDay(timestamp);// 检查时间是否在同一天
  }


  /**
     * 保存统计每个游戏每天的数据
     * @param {*} record 游戏记录
     * @param {*} tm  这局游戏结束时间戳
     * @param {*} gameType 游戏类型
     */
  async saveGameData(record, tm, gameType) {
    const time = moment(new Date(tm * 1000)).format('YYYYMMDD');
    // await this.initGameBetNumber();
    // await this.initGameData();
    if (!gameDataAll[time]) {
      gameDataAll[time] = {};
    }
    gameDataAll[time][gameType] = gameDataAll[time][gameType] ? gameDataAll[time][gameType] : {};
    // 保存更新记录的时间戳
    if (record.gameNo || !gameDataAll[time].timestamp) {
      gameDataAll[time].timestamp = gameDataAll[time].timestamp ? gameDataAll[time].timestamp : {};
      gameDataAll[time].timestamp.timestamp = tm;
      this.saveToRedis('timestamp', time, gameDataAll[time].timestamp); // 保存平台数据到redis中
    }
    await this.save(gameDataAll[time][gameType], record, gameType); // 保存平台数据到内存中
    await this.saveToRedis(gameType, time, gameDataAll[time][gameType]); // 保存平台数据到redis中
    await this.saveGameBetNumberToRedis();// 保存投注人数统计数据
  }

  /**
     * redis 读取数据
     */
  async initGameData() {
    gameDataAll = {};
    const keys = await this.app.redis.keys('gameDataAll:*');
    for (let i = 0; i < keys.length; i++) {
      const info = await this.app.redis.hgetall(keys[i]);
      const dateKey = keys[i].substring(keys[i].indexOf(':') + 1, keys[i].length);
      if (!gameDataAll[dateKey]) {
        gameDataAll[dateKey] = {};
      }
      const key = Object.keys(info);
      for (let i = 0; i < key.length; i++) {
        gameDataAll[dateKey][key[i]] = JSON.parse(info[key[i]]);
      }
    }
  }

  /**
   * 计算每个游戏的统计数据
   * @param {*} obj
   * @param {*} record
   * @param {*} gameType
   */
  async save(obj, record, gameType) {
    if (record.gameNo) { // 是否存在局号
      if (record.name) {
        const username = record.platformId + '@' + record.name;
        if (!gameBetNumber[gameType]) {
          gameBetNumber[gameType] = [];
        }
        if (!(gameBetNumber[gameType].includes(username))) {
          obj.betNumber = (obj.betNumber || 0) + 1; // 投注人数，按天计算
          gameBetNumber[gameType].push(username);
        }
      }
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
      obj.duration = (obj.duration || 0) + (record.duration || 0); // 当天游戏时长（一局游戏开始到结束的中间时长）
    }
  }

  /**
     * 将数据保存到redis中
     * @param {*} gameType  游戏类型
     * @param {*} date  时间 20190628
     * @param {*} record 游戏数据
     */
  async saveToRedis(gameType, date, record) {
    this.app.redis.hset('gameDataAll:' + date, gameType, JSON.stringify(record));
  }

  /**
     * 将投注人数信息保存
     */
  async saveGameBetNumberToRedis() {
    this.app.redis.set('gameBetNumber', JSON.stringify(gameBetNumber)); // 保存到redis
  }

  /**
     * 项目启动加载有效投注人数
     */
  async initGameBetNumber() {
    const info = await this.app.redis.get('gameBetNumber');
    if (info) {
      gameBetNumber = JSON.parse(info);
    } else {
      gameBetNumber = {};
    }
  }

  // /**
  //    * 检查时间是否在同一天
  //    * @param {*} timestamp
  //    */
  // async checkIsSameDay(timestamp) {
  //   if (!gameDateTime) {
  //     gameDateTime = await this.app.redis.get('gameDateTime'); // 获取保存的当天时间
  //     if (!gameDateTime) {
  //       gameDateTime = timestamp;
  //       this.app.redis.set('gameDateTime', gameDateTime); // 保存到redis
  //     } else {
  //       gameDateTime = parseInt(gameDateTime);
  //     }
  //   }
  //   const tm1 = moment(new Date(gameDateTime));
  //   const tm2 = moment(new Date(timestamp));
  //   if (tm1.date() != tm2.date()) { // 是否是同一天
  //     this.cleanRealTimeData(); // 清除当天数据
  //     gameDateTime = timestamp;
  //     this.app.redis.set('gameDateTime', gameDateTime); // 保存到redis
  //   }
  // }

  /**
   * 清除每天登录投注人的数据
   */
  async cleanRealTimeData() {
    console.log('清除每天游戏投注信息数据:', new Date());
    gameBetNumber = null; // 清除
    await this.app.redis.del('gameBetNumber');
  }
}

module.exports = GameDataService;
