/* eslint-disable no-case-declarations */
/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const tools = require('../../tools/tools');
let agentDataAll; // 记录每个代理当天数据
let agentBetNumber; // 投注人数
let timer = 0;
class AgentDataService extends Service {

  async getData(type, start_date, end_date) {
    start_date = moment(start_date).format('YYYY-MM-DD');
    end_date = moment(end_date).format('YYYY-MM-DD');
    let data = [];
    switch (type) {
      case 1 :
        const todayData = await this.getAgentDataAll() || {};
        Object.keys(todayData).forEach(key => {
          if (key !== 'timestamp') {
            data.push({
              total_games: todayData[key].totalGames || 0,
              bet_number: todayData[key].betNumber || 0,
              valid_bet: todayData[key].validBet || 0,
              win_games: todayData[key].winGames || 0,
              win_gold: todayData[key].winGold || 0,
              lost_games: todayData[key].lostGames || 0,
              lost_gold: todayData[key].lostGold || 0,
              deduct_gold: todayData[key].deductGold || 0,
              duration: todayData[key].duration || 0,
              insert_time: todayData[key].insertTime || 0,
            });
          }
        });
        break;
      default:
        data = await this.findByDate(start_date, end_date); // 获取其他时间的数据
        break;
    }
    return data;
  }

  /**
   * 根据时间获取数据
   * @param {*} start_date
   * @param {*} end_date
   */
  async findByDate(start_date, end_date) {
    const Op = this.ctx.model.Sequelize.Op;
    return await this.ctx.model.AgentData.findAll({
      where: {
        create_time: {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        },
      },
    });
  }

  /**
   * 将数据保存到数据库。函数一天执行一次
   */
  async saveDataToDatabase() {
    if (timer) { // 检查是否有定时器在执行
      return;
    }
    await this.initAgentData();
    await this.app.redis.set('nodeAgentData', JSON.stringify(agentDataAll)); // 存入redis 中，当作一个时间节点

    const nodeFunc = async () => {
      await this.initAgentData();
      let nodeAgentData = await this.app.redis.get('nodeAgentData');
      nodeAgentData = nodeAgentData ? JSON.parse(nodeAgentData) : {};
      const itemKey = Object.keys(nodeAgentData).sort();
      let state = 1;
      let index = 0;
      let sql = 'replace into agent_data(create_time,platform_id,agent_id,total_games,valid_bet,bet_number,win_games,win_gold,lost_games,lost_gold,deduct_gold,duration,insert_time) values ';
      let sqlValue = '';
      for (let i = 0; i < itemKey.length; i++) {
        const nodeItem = nodeAgentData[itemKey[i]];
        const item = agentDataAll[itemKey[i]];
        if (i != itemKey.length - 1) {
          sqlValue = sqlValue + await tools.splitAgentDataSql(itemKey[i], nodeItem); // 拼接sql
          index++;
        } else {
          // 判断是否被处理过
          if (!nodeItem.timestamp.handle) {
            // 判断2个时间戳一样
            if (nodeItem.timestamp.timestamp == item.timestamp.timestamp) {
              sqlValue = sqlValue + await tools.splitAgentDataSql(itemKey[i], nodeItem);
              item.timestamp.handle = 1; // 表示这个时间段的数据已经处理
              this.saveToRedis('timestamp', itemKey[i], item.timestamp);// 记录到redis中
            } else {
              console.log('前时间戳：', nodeAgentData[itemKey[i]].timestamp.timestamp);
              nodeAgentData[itemKey[i]].timestamp.timestamp = item.timestamp.timestamp;
              console.log('后时间戳：', nodeAgentData[itemKey[i]].timestamp.timestamp);
              await this.app.redis.set('nodeAgentData', JSON.stringify(nodeAgentData)); // 重新存入redis 中
              state = 0;
              index = i;
              break;
            }
          }
        }
      }
      if (sqlValue != '') {
        sql = sql + sqlValue.substring(0, sqlValue.length - 1);
        console.log('agentData执行sql');
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        console.log('agentData执行成功');
        for (let i = 0; i < index; i++) {
          await this.app.redis.del('agentDataAll:' + itemKey[i]);
          delete agentDataAll[itemKey[i]];
        }
        await this.app.redis.set('nodeAgentData', JSON.stringify(agentDataAll)); // 重新存入redis 中
      }

      if (state == 0) {
        console.log('过一分钟在来执行！');
        timer = 1;
        setTimeout(nodeFunc, 1000 * 60 * 2);
      } else {
        timer = 0;
      }
    };
    setTimeout(nodeFunc, 1000 * 60 * 2); // 延后2分钟执行
    // this.checkIsSameDay(timestamp);// 检查时间是否在同一天
  }


  /**
     * 保存统计每个代理每天的数据
     * @param {*} record 游戏记录
     * @param {*} tm  这局游戏结束时间戳
     */
  async saveAgentData(record, tm) {
    const time = moment(new Date(tm * 1000)).format('YYYYMMDD');
    const agent_id = `${record.platformId}-${record.lineCode}`;
    // await this.initAgentBetNumber();
    // await this.initAgentData();
    if (!agentDataAll[time]) {
      agentDataAll[time] = {};
    }
    agentDataAll[time][agent_id] = agentDataAll[time][agent_id] ? agentDataAll[time][agent_id] : {};
    // 保存更新记录的时间戳
    if (record.gameNo || !agentDataAll[time].timestamp) {
      agentDataAll[time].timestamp = agentDataAll[time].timestamp ? agentDataAll[time].timestamp : {};
      agentDataAll[time].timestamp.timestamp = tm;
      this.saveToRedis('timestamp', time, agentDataAll[time].timestamp); // 保存代理数据到redis中
    }
    await this.save(agentDataAll[time][agent_id], record, agent_id); // 保存代理数据到内存中
    await this.saveToRedis(agent_id, time, agentDataAll[time][agent_id]); // 保存代理数据到redis中
    await this.saveAgentBetNumberToRedis();// 保存投注人数统计数据
  }

  /**
     * redis 读取数据
     */
  async initAgentData() {
    agentDataAll = {};
    const keys = await this.app.redis.keys('agentDataAll:*');
    for (let i = 0; i < keys.length; i++) {
      const info = await this.app.redis.hgetall(keys[i]);
      const dateKey = keys[i].substring(keys[i].indexOf(':') + 1, keys[i].length);
      if (!agentDataAll[dateKey]) {
        agentDataAll[dateKey] = {};
      }
      const key = Object.keys(info);
      for (let i = 0; i < key.length; i++) {
        agentDataAll[dateKey][key[i]] = JSON.parse(info[key[i]]);
      }
    }
  }

  /**
     * 计算每个代理的统计数据
     * @param {*} obj 存储的对象
     * @param {*} record 要保存的记录数据
     */
  async save(obj, record, agent_id) {
    if (record.gameNo) { // 是否存在局号
      if (record.name) {
        if (!agentBetNumber[agent_id]) {
          agentBetNumber[agent_id] = [];
        }
        const username = record.name;
        if (!(agentBetNumber[agent_id].includes(username))) {
          obj.betNumber = (obj.betNumber || 0) + 1; // 投注人数，按天计算
          agentBetNumber[agent_id].push(username);
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
      obj.duration = (obj.duration || 0) + (record.duration || 0); // 当天代理时长（一局代理开始到结束的中间时长）
    }
  }

  /**
     * 将数据保存到redis中
     * @param {*} agent_id  代理id
     * @param {*} date  时间 20190628
     * @param {*} record 代理数据
     */
  async saveToRedis(agent_id, date, record) {
    this.app.redis.hset('agentDataAll:' + date, agent_id, JSON.stringify(record));
  }

  /**
     * 将投注人数信息保存
     */
  async saveAgentBetNumberToRedis() {
    this.app.redis.set('agentBetNumber', JSON.stringify(agentBetNumber)); // 保存到redis
  }

  /**
     * 项目启动加载有效投注人数
     */
  async initAgentBetNumber() {
    const info = await this.app.redis.get('agentBetNumber');
    if (info) {
      agentBetNumber = JSON.parse(info);
    } else {
      agentBetNumber = {};
    }
  }

  // /**
  //    * 检查时间是否在同一天
  //    * @param {*} timestamp
  //    */
  // async checkIsSameDay(timestamp) {
  //   if (!agentDateTime) {
  //     agentDateTime = await this.app.redis.get('agentDateTime'); // 获取保存的当天时间
  //     if (!agentDateTime) {
  //       agentDateTime = timestamp;
  //       this.app.redis.set('agentDateTime', agentDateTime); // 保存到redis
  //     } else {
  //       agentDateTime = parseInt(agentDateTime);
  //     }
  //   }
  //   const tm1 = moment(new Date(agentDateTime));
  //   const tm2 = moment(new Date(timestamp));
  //   if (tm1.date() != tm2.date()) { // 是否是同一天
  //     this.cleanRealTimeData(); // 清除当天数据
  //     agentDateTime = timestamp;
  //     this.app.redis.set('agentDateTime', agentDateTime); // 保存到redis
  //   }
  // }

  /**
     * 清除每天登录投注人的数据
     */
  async cleanRealTimeData() {
    console.log('清除每天代理投注信息数据:', new Date());
    agentBetNumber = null; // 清除
    await this.app.redis.del('agentBetNumber');
  }

  /**
   * 获取今日的代理数据
   */
  async getAgentDataAll() {
    const time = moment(new Date()).format('YYYYMMDD');
    await this.initAgentData();
    return agentDataAll[time];
  }


  async getAgentStatisticData(platform_id, agent_id, start_time, end_time, page, limit) {
    let sql = `select a.agent_id, IFNULL(a.total_games,0) as total_games, 
    IFNULL(a.valid_bet,0) as valid_bet, (a.win_gold - a.lost_gold -a.deduct_gold) as win_lost,DATE_FORMAT(a.create_time,'%Y-%m-%d') as date,
    b.username, b.nickname,(select count(*) as count from user_account where agent_id = a.agent_id) as count 
    from agent_data a left join agent_account b on a.agent_id = b.id where 1`;
    let sql_count = 'select count(*) as count from agent_data where 1';
    if (start_time && end_time) {
      sql += ` and a.create_time >= '${start_time} 00:00:00' and a.create_time <= '${end_time} 23:59:59'`;
      sql_count += ` and create_time >= '${start_time} 00:00:00' and create_time <= '${end_time} 23:59:59'`;
    } else if (start_time) {
      sql += ` and a.create_time >= '${start_time} 00:00:00'`;
      sql_count += ` and create_time >= '${start_time} 00:00:00'`;
    } else if (end_time) {
      sql += ` and a.create_time <= '${end_time} 23:59:59'`;
      sql_count += ` and create_time <= '${end_time} 23:59:59'`;
    }

    if (platform_id) {
      sql += ` and a.platform_id = ${platform_id}`;
      sql_count += ` and platform_id = ${platform_id}`;
    }

    if (agent_id) {
      sql += ` and a.agent_id = ${agent_id}`;
      sql_count += ` and agent_id = ${agent_id}`;
    }
    sql += ' ORDER BY a.create_time';
    if (page && limit) {
      sql += ` LIMIT ${(page - 1) * limit},${limit} `;
    }
    // console.log('sql: ', sql);
    // console.log('sql_count: ', sql_count);
    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const count = await this.app.model.query(sql_count, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return { rows, count: count[0].count };
  }
}

module.exports = AgentDataService;
