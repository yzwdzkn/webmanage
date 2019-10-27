/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const tools = require('../../tools/tools');
let robotDataAll; // 记录每个机器人当天数据
let timer = 0;
// let robotDateTime; // 记录当天的时间
class RobotDataService extends Service {

  /**
     * 将数据保存到数据库。函数一天执行一次
     */
  async saveDataToDatabase() {
    if (timer) { // 检查是否有定时器在执行
      return;
    }
    await this.initRobotData();
    await this.app.redis.set('nodeRobotData', JSON.stringify(robotDataAll)); // 存入redis 中，当作一个时间节点

    const nodeFunc = async () => {
      await this.initRobotData();
      let nodeRobotData = await this.app.redis.get('nodeRobotData');
      nodeRobotData = nodeRobotData ? JSON.parse(nodeRobotData) : {};
      const itemKey = Object.keys(nodeRobotData).sort();
      let state = 1;
      let index = 0;
      let sql = 'replace into robot_data(create_time,username,total_games,valid_bet,win_games,win_gold,lost_games,lost_gold,deduct_gold,duration,insert_time) values ';
      let sqlValue = '';
      for (let i = 0; i < itemKey.length; i++) {
        const nodeItem = nodeRobotData[itemKey[i]];
        const item = robotDataAll[itemKey[i]];
        if (i != itemKey.length - 1) {
          sqlValue = sqlValue + await tools.splitRobotDataSql(itemKey[i], nodeItem); // 拼接sql
          index++;
        } else {
          // 判断是否被处理过
          if (!nodeItem.timestamp.handle) {
            // 判断2个时间戳一样
            if (nodeItem.timestamp.timestamp == item.timestamp.timestamp) {
              console.log('timestamp相同');
              sqlValue = sqlValue + await tools.splitRobotDataSql(itemKey[i], nodeItem);
              item.timestamp.handle = 1; // 表示这个时间段的数据已经处理
              this.saveToRedis('timestamp', itemKey[i], item.timestamp);// 记录到redis中
            } else {
              console.log('前时间戳：', nodeRobotData[itemKey[i]].timestamp.timestamp);
              nodeRobotData[itemKey[i]].timestamp.timestamp = item.timestamp.timestamp;
              console.log('后时间戳：', nodeRobotData[itemKey[i]].timestamp.timestamp);
              await this.app.redis.set('nodeRobotData', JSON.stringify(nodeRobotData)); // 重新存入redis 中
              state = 0;
              index = i;
              break;
            }
          }
        }
      }
      if (sqlValue != '') {
        sql = sql + sqlValue.substring(0, sqlValue.length - 1);
        console.log('robotData执行sql');
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        console.log('robotData执行成功');
        for (let i = 0; i < index; i++) {
          await this.app.redis.del('robotDataAll:' + itemKey[i]);
          delete robotDataAll[itemKey[i]];
        }
        await this.app.redis.set('nodeRobotData', JSON.stringify(robotDataAll)); // 重新存入redis 中
      }

      if (state == 0) {
        console.log('过一分钟在来执行！');
        timer = 1;
        setTimeout(nodeFunc, 1000 * 60 * 3);
      } else {
        timer = 0;
      }
      nodeRobotData = null;
    };
    setTimeout(nodeFunc, 1000 * 60 * 1); // 延后1分钟执行
    // this.checkIsSameDay(timestamp);// 检查时间是否在同一天
  }


  /**
     * 保存统计每个机器人每天的数据
     * @param {*} record 游戏记录
     * @param {*} tm  这局游戏结束时间戳
     */
  async saveRobotData(record, tm) {
    const time = moment(new Date(tm * 1000)).format('YYYYMMDD');
    const username = record.name;
    await this.initRobotData();
    if (!robotDataAll[time]) {
      robotDataAll[time] = {};
    }
    robotDataAll[time][username] = robotDataAll[time][username] ? robotDataAll[time][username] : {};
    // 保存更新记录的时间戳
    if (record.gameNo || !robotDataAll[time].timestamp) {
      robotDataAll[time].timestamp = robotDataAll[time].timestamp ? robotDataAll[time].timestamp : {};
      robotDataAll[time].timestamp.timestamp = tm;
      this.saveToRedis('timestamp', time, robotDataAll[time].timestamp); // 保存机器人数据到redis中
    }
    await this.save(robotDataAll[time][username], record, username); // 保存机器人数据到内存中
    await this.saveToRedis(username, time, robotDataAll[time][username]); // 保存机器人数据到redis中
  }

  /**
     * 项目启动时去加载redis 中的数据（防止意外重启项目数据丢失）
     */
  async initRobotData() {
    robotDataAll = {};
    const keys = await this.app.redis.keys('robotDataAll:*');
    for (let i = 0; i < keys.length; i++) {
      const info = await this.app.redis.hgetall(keys[i]);
      const dateKey = keys[i].substring(keys[i].indexOf(':') + 1, keys[i].length);
      if (!robotDataAll[dateKey]) {
        robotDataAll[dateKey] = {};
      }
      const key = Object.keys(info);
      for (let i = 0; i < key.length; i++) {
        robotDataAll[dateKey][key[i]] = JSON.parse(info[key[i]]);
      }
    }
  }

  /**
     * 计算每个机器人的统计数据
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
      obj.duration = (obj.duration || 0) + (record.duration || 0); // 当天机器人时长（一局机器人开始到结束的中间时长）

    }
  }

  /**
     * 将数据保存到redis中
     * @param {*} username  用户名
     * @param {*} date  时间 20190628
     * @param {*} record 机器人数据
     */
  async saveToRedis(username, date, record) {
    this.app.redis.hset('robotDataAll:' + date, username, JSON.stringify(record));
  }
  // /**
  //    * 检查时间是否在同一天
  //    * @param {*} timestamp
  //    */
  // async checkIsSameDay(timestamp) {
  //   if (!robotDateTime) {
  //     robotDateTime = await this.app.redis.get('robotDateTime'); // 获取保存的当天时间
  //     if (!robotDateTime) {
  //       robotDateTime = timestamp;
  //       this.app.redis.set('robotDateTime', robotDateTime); // 保存到redis
  //     } else {
  //       robotDateTime = parseInt(robotDateTime);
  //     }
  //   }
  //   const tm1 = moment(new Date(robotDateTime));
  //   const tm2 = moment(new Date(timestamp));
  //   if (tm1.date() != tm2.date()) { // 是否是同一天
  //     robotDateTime = timestamp;
  //     this.app.redis.set('robotDateTime', robotDateTime); // 保存到redis
  //   }
  // }

  /**
   * 获取今日的玩家数据
   */
  async getRobotDataAll() {
    const time = moment(new Date()).format('YYYYMMDD');
    await this.initRobotData();
    return robotDataAll[time];
  }
}

module.exports = RobotDataService;
