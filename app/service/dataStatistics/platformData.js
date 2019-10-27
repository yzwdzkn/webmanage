/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const tools = require('../../tools/tools');
let platformDataAll; // 记录每个平台当天数据
let platformBetNumber; // 投注人数
let timer = 0;
// let platformDateTime; // 记录当天的时间
class PlatformDataService extends Service {


  /**
   * 获取平台今日实时数据
   * @param {*} platform_id
   */
  async findPlatformRealtimeData(platform_id) {
    const realtimeData = await this.getPlatformDataAll();
    const returnData = [];
    if (realtimeData) {
      if (platform_id != '') {
        const platform = realtimeData[platform_id];
        if (platform) {
          returnData.push({
            platform: platform_id,
            total_games: platform.totalGames || 0,
            valid_bet: platform.validBet || 0,
            bet_number: platform.betNumber || 0,
            win_games: platform.winGames || 0,
            win_gold: platform.winGold || 0,
            lost_games: platform.lostGames || 0,
            lost_gold: platform.lostGold || 0,
            deduct_gold: platform.deductGold || 0,
            duration: platform.duration || 0,
          });
        }
      } else {
        Object.keys(realtimeData).forEach(item => {
          if (item != 'timestamp') {
            const platform = realtimeData[item];
            returnData.push({
              platform: item,
              total_games: platform.totalGames || 0,
              valid_bet: platform.validBet || 0,
              bet_number: platform.betNumber || 0,
              win_games: platform.winGames || 0,
              win_gold: platform.winGold || 0,
              lost_games: platform.lostGames || 0,
              lost_gold: platform.lostGold || 0,
              deduct_gold: platform.deductGold || 0,
              duration: platform.duration || 0,
            });
          }
        });
      }
    }
    return returnData;
  }

  /**
   * 获取每日投注人数
   * @param {*} start_date
   * @param {*} end_date
   */
  async getDateBetnumber(start_date, end_date, platformId) {
    if (start_date.length == 10) {
      start_date = start_date + ' 00:00:00';
    }
    if (end_date.length == 10) {
      end_date = end_date + ' 00:00:00';
    }
    let sqlwhere = '';
    if (platformId) {
      sqlwhere = `and platform = ${platformId}`;
    }

    const sql = `SELECT
      DATE_FORMAT(create_time, '%Y-%m-%d') create_time,
        SUM(bet_number) AS bet_number
      FROM
        platform_data
      WHERE
        create_time >= '${start_date}'
      AND create_time <= '${end_date}' ${sqlwhere}

      GROUP BY
        create_time`;

    const data = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return data.reduce(function(result, item, index, array) { // 将数组转为对象
      result[item.create_time] = item.bet_number;
      return result;
    }, {});
  }

  /**
   * 查询平台历史数据
   * @param {*} start_date
   * @param {*} end_date
   * @param {*} platform
   * @param {*} page
   * @param {*} limit
   */
  async findPlatformHistoryData(start_date, end_date, platform, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      create_time: {
        [Op.between]: [ start_date + ' 00:00:00', end_date + ' 23:59:59' ],
      },
    };
    if (platform !== '') {
      where.platform = platform;
    }
    if (page && limit) {
      return await this.ctx.model.PlatformData.findAndCountAll({
        where,
        offset: (parseInt(page) - 1) * parseInt(limit), // 每页起始位置
        limit: parseInt(limit),
        // order: [[ 'create_time', 'desc' ]],
        include: [
          {
            model: this.ctx.model.PlatformInfo,
            attributes: [ 'rate', 'platform_name' ],
          },
        ],
      });
    }
    return await this.ctx.model.PlatformData.findAll({
      where,
      // order: [[ 'create_time', 'desc' ]],
      include: [
        {
          model: this.ctx.model.PlatformInfo,
          attributes: [ 'rate', 'platform_name' ],
        },
      ],
    });
  }


  _getToDayData(todayData, key) {
    let data;
    if (todayData[key]) {
      data = {
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
      };
    } else {
      data = {
        total_games: 0,
        bet_number: 0,
        valid_bet: 0,
        win_games: 0,
        win_gold: 0,
        lost_games: 0,
        lost_gold: 0,
        deduct_gold: 0,
        duration: 0,
        insert_time: 0,
      };
    }
    return data;
  }

  async getData(platform_id, start_date, end_date) {
    start_date = moment(start_date).format('YYYY-MM-DD');
    end_date = moment(end_date).format('YYYY-MM-DD');
    const cur_date = moment().format('YYYY-MM-DD');
    let data = [];

    if (start_date == cur_date) { // 获取当天的数据
      const todayData = await this.getPlatformDataAll();
      if (platform_id) {
        if (todayData && todayData[platform_id]) {
          data.push(this._getToDayData(todayData, platform_id));
        } else {
          data.push(this._getToDayData(todayData, platform_id));
        }
      } else {
        Object.keys(todayData).forEach(key => {
          if (key !== 'timestamp') {
            data.push(this._getToDayData(todayData, key));
          }
        });
      }
    } else {
      data = await this.findByDate(platform_id, start_date, end_date); // 获取其他时间的数据-历史数据
      if (cur_date >= start_date && cur_date <= end_date) {
        const todayData = await this.getPlatformDataAll(); // 今日数据
        if (todayData && platform_id && todayData[platform_id]) {
          data.push(todayData[platform_id]);
        } else if (platform_id) {
          data = [];
        } else {
          Object.keys(todayData).forEach(key => {
            if (key !== 'timestamp') {
              data.push(this._getToDayData(todayData, key));
            }
          });
        }
      }
    }
    return data;
  }

  async getDataByMonth(start_date, end_date) {
    start_date = moment(start_date).format('YYYY-MM-DD');
    end_date = moment(end_date).format('YYYY-MM-DD');
    const cur_date = moment().format('YYYY-MM-DD');
    const data = await this.findByDateGroupByplatform(start_date, end_date); // 获取其他时间的数据-历史数据
    if (cur_date >= start_date && cur_date <= end_date) {
      const todayData = await this.getPlatformDataAll(); // 今日数据
      console.log('todayData: ', JSON.stringify(todayData));
      Object.keys(todayData).forEach(key => {
        if (key !== 'timestamp') {
          const t = this._getToDayData(todayData, key);
          if (data[key]) {
            data[key] = Number(data[key]);
            data[key] += (t.lost_gold - t.win_gold + t.deduct_gold);
          } else {
            data[key] = 0;
            data[key] += (t.lost_gold - t.win_gold + t.deduct_gold);
          }
        }
      });
    }
    return data;
  }


  /**
   * 根据时间获取数据
   * @param {*} platform_id
   * @param {*} start_date
   * @param {*} end_date
   */
  async findByDate(platform_id, start_date, end_date) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      create_time: {
        [Op.gte]: start_date,
        [Op.lte]: end_date,
      },
    };
    if (platform_id) {
      where.platform = platform_id;
    }
    return await this.ctx.model.PlatformData.findAll({
      where,
    });
  }

  /**
   * 根据时间获取数据按平台id分类
   * @param {*} start_date
   * @param {*} end_date
   */
  async findByDateGroupByplatform(start_date, end_date) {
    const sql = `select sum(lost_gold - win_gold + deduct_gold) as gold, platform from platform_data 
    where create_time between '${start_date}' and '${end_date}' and status = 0 group by platform`;
    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const result = {};
    for (const row of rows) {
      result[row.platform] = row.gold;
    }
    return result;
  }

  /**
     * 将数据保存到数据库。函数一天执行一次
     */
  async saveDataToDatabase() {
    if (timer) { // 检查是否有定时器在执行
      return;
    }
    await this.initPlatformData();
    await this.app.redis.set('nodePlatformData', JSON.stringify(platformDataAll)); // 存入redis 中，当作一个时间节点

    const nodeFunc = async () => {
      let nodePlatformData = await this.app.redis.get('nodePlatformData');
      nodePlatformData = nodePlatformData ? JSON.parse(nodePlatformData) : {};
      const itemKey = Object.keys(nodePlatformData).sort();
      let state = 1;
      let index = 0;
      let sql = 'replace into platform_data(create_time,platform,total_games,valid_bet,bet_number,win_games,win_gold,lost_games,lost_gold,deduct_gold,duration,insert_time) values ';
      let sqlValue = '';
      for (let i = 0; i < itemKey.length; i++) {
        const nodeItem = nodePlatformData[itemKey[i]];
        const item = platformDataAll[itemKey[i]];
        if (i != itemKey.length - 1) {
          sqlValue = sqlValue + await tools.splitGameDataSql(itemKey[i], nodeItem); // 拼接sql
          index++;
        } else {
          // 判断是否被处理过
          if (!nodeItem.timestamp.handle) {
            // 判断2个时间戳一样
            if (nodeItem.timestamp.timestamp == item.timestamp.timestamp) {
              console.log('timestamp相同');
              sqlValue = sqlValue + await tools.splitGameDataSql(itemKey[i], nodeItem);
              item.timestamp.handle = 1; // 表示这个时间段的数据已经处理
              this.saveToRedis('timestamp', itemKey[i], item.timestamp);// 记录到redis中
            } else {
              console.log('前时间戳：', nodePlatformData[itemKey[i]].timestamp.timestamp);
              nodePlatformData[itemKey[i]].timestamp.timestamp = item.timestamp.timestamp;
              console.log('后时间戳：', nodePlatformData[itemKey[i]].timestamp.timestamp);
              await this.app.redis.set('nodePlatformData', JSON.stringify(nodePlatformData)); // 重新存入redis 中
              state = 0;
              index = i;
              break;
            }
          }
        }
      }
      if (sqlValue != '') {
        sql = sql + sqlValue.substring(0, sqlValue.length - 1);
        console.log('platformData执行sql');
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        console.log('platformData执行成功');
        for (let i = 0; i < index; i++) {
          await this.app.redis.del('platformDataAll:' + itemKey[i]);
          delete platformDataAll[itemKey[i]];
        }
        await this.app.redis.set('nodePlatformData', JSON.stringify(platformDataAll)); // 重新存入redis 中
      }

      if (state == 0) {
        console.log('过一分钟在来执行！');
        timer = 1;
        setTimeout(nodeFunc, 1000 * 60 * 3);
      } else {
        timer = 0;
      }
    };
    setTimeout(nodeFunc, 1000 * 60 * 4); // 延后4分钟执行
    // this.checkIsSameDay(timestamp);// 检查时间是否在同一天
  }


  /**
   * 保存统计每个平台每天的数据
   * @param {*} record 游戏记录
   * @param {*} tm  这局游戏结束时间戳
   */
  async savePlatformData(record, tm) {
    // console.log('record:', record);
    // console.log('tm:', tm);
    const time = moment(new Date(tm * 1000)).format('YYYYMMDD');
    const platformId = record.platformId;

    if (!platformDataAll[time]) {
      platformDataAll[time] = {};
    }
    platformDataAll[time][platformId] = platformDataAll[time][platformId] ? platformDataAll[time][platformId] : {};
    // 保存更新记录的时间戳
    if (record.gameNo || !platformDataAll[time].timestamp) {
      platformDataAll[time].timestamp = platformDataAll[time].timestamp ? platformDataAll[time].timestamp : {};
      platformDataAll[time].timestamp.timestamp = tm;
      this.saveToRedis('timestamp', time, platformDataAll[time].timestamp); // 保存平台数据到redis中
    }
    await this.save(platformDataAll[time][platformId], record, platformId); // 保存平台数据到内存中
    await this.saveToRedis(platformId, time, platformDataAll[time][platformId]); // 保存平台数据到redis中
    await this.savePlatformBetNumberToRedis();// 保存投注人数统计数据
  }

  /**
   * 去加载redis 中的数据
   */
  async initPlatformData() {
    platformDataAll = {};
    const keys = await this.app.redis.keys('platformDataAll:*');
    for (let i = 0; i < keys.length; i++) {
      const info = await this.app.redis.hgetall(keys[i]);
      const dateKey = keys[i].substring(keys[i].indexOf(':') + 1, keys[i].length);
      if (!platformDataAll[dateKey]) {
        platformDataAll[dateKey] = {};
      }
      const key = Object.keys(info);
      for (let i = 0; i < key.length; i++) {
        platformDataAll[dateKey][key[i]] = JSON.parse(info[key[i]]);
      }
    }
  }

  /**
   * 计算每个平台的统计数据
   * @param {*} obj 存储的对象
   * @param {*} record 要保存的记录数据
   */
  async save(obj, record, platformId) {
    if (record.gameNo) { // 是否存在局号
      if (record.name) {
        if (!platformBetNumber[platformId]) {
          platformBetNumber[platformId] = [];
        }
        const username = record.platformId + '@' + record.name;
        if (!(platformBetNumber[platformId].includes(username))) {
          if (!obj.betNumber) obj.betNumber = 0;
          obj.betNumber += 1; // 投注人数，按天计算
          platformBetNumber[platformId].push(username);
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
      obj.duration = (obj.duration || 0) + (record.duration || 0); // 当天平台时长（一局平台开始到结束的中间时长）

      // if (String(obj.validBet).indexOf('.') != -1 || String(obj.win).indexOf('.') != -1) {
      //   this.app.model.query(`insert into test1 values(null,'${JSON.stringify(record)}')`, {
      //     type: this.app.Sequelize.QueryTypes.INSERT,
      //   });
      // }

    }
  }

  /**
     * 将数据保存到redis中
     * @param {*} platformId  平台id
     * @param {*} date  时间 20190628
     * @param {*} record 平台数据
     */
  async saveToRedis(platformId, date, record) {
    this.app.redis.hset('platformDataAll:' + date, platformId, JSON.stringify(record));
  }

  /**
     * 将投注人数信息保存
     */
  async savePlatformBetNumberToRedis() {
    this.app.redis.set('platformBetNumber', JSON.stringify(platformBetNumber)); // 保存到redis
  }

  /**
     * 项目启动加载有效投注人数
     */
  async initPlatformBetNumber() {
    const info = await this.app.redis.get('platformBetNumber');
    if (info) {
      platformBetNumber = JSON.parse(info);
    } else {
      platformBetNumber = {};
    }
  }

  // /**
  //    * 检查时间是否在同一天
  //    * @param {*} timestamp
  //    */
  // async checkIsSameDay(timestamp) {
  //   if (!platformDateTime) {
  //     platformDateTime = await this.app.redis.get('platformDateTime'); // 获取保存的当天时间
  //     if (!platformDateTime) {
  //       platformDateTime = timestamp;
  //       this.app.redis.set('platformDateTime', platformDateTime); // 保存到redis
  //     } else {
  //       platformDateTime = parseInt(platformDateTime);
  //     }
  //   }
  //   const tm1 = moment(new Date(platformDateTime));
  //   const tm2 = moment(new Date(timestamp));
  //   if (tm1.date() != tm2.date()) { // 是否是同一天
  //     this.cleanRealTimeData(); // 清除当天数据
  //     platformDateTime = timestamp;
  //     this.app.redis.set('platformDateTime', platformDateTime); // 保存到redis
  //   }
  // }

  /**
     * 清除每天登录投注人的数据
     */
  async cleanRealTimeData() {
    console.log('清除每天平台投注信息数据:', new Date());
    platformBetNumber = null; // 清除
    await this.app.redis.del('platformBetNumber');
  }

  /**
   * 同步player_data 表的数据
   * @param {*} platform_id
   * @param {*} index
   * @param {*} limit
   */
  async syncPlayerData(platform_id, index, limit) {
    return await this.app.model.PlayerData.findAll({
      where: {
        platform_id,
      },
      offset: parseInt(index),
      limit: parseInt(limit),
      order: [[ 'create_time', 'ASC' ]],
    });
  }

  /**
   * 获取今日的平台数据
   */
  async getPlatformDataAll() {
    const time = moment(new Date()).format('YYYYMMDD');
    await this.initPlatformData();
    return platformDataAll[time] || {};
  }

  /**
   * 修改平台交手状态
   */
  async updatePlatformStatus(platform_id, create_date, rate, status = 1) {

    await this.ctx.model.PlatformData.update(
      { rate, status },
      { where: { platform: platform_id, create_time: create_date } }
    );
  }

  // 修改代理交收状态
  async updateAgentStatus(platform_id, agent_id, create_date, rate) {

    const result = await this.ctx.model.AgentData.update(
      { rate, status: 1 },
      { where: { platform_id, agent_id, create_time: create_date } }
    );
    console.log(JSON.stringify(result));
  }
  // 查询牌局
  async findCard(params) {
    let platform_id = '';
    if (params.platform_id) {
      platform_id = ` and platform_id = ${params.platform_id} `;
    }
    let limit = '';
    if (params.page && params.limit) {
      limit = `limit ${(params.page - 1) * params.limit}, ${params.limit}`;
    }
    const tableName = 'game_record_' + moment(params.date).utcOffset(8).format('YYYYMM');
    // const sql = 'SELECT r.*,g.game_name,f.room_name,p.platform_name from ' + tableName + ' as r LEFT JOIN game_info as g ON r.game_id = g.game_id LEFT JOIN room_info as f ON r.room_id = f.room_id LEFT JOIN platform_info as p on p.platform_id=r.platform where TO_DAYS(start_time)=TO_days("' + params.date + '")' + platform_id + `order by start_time DESC ${limit}`;
    const sql = `SELECT r.*,g.game_name,f.room_name,p.platform_name from ${tableName} as r LEFT JOIN game_info as g ON r.game_id = g.game_id LEFT JOIN room_info as f ON r.room_id = f.room_id LEFT JOIN platform_info as p on p.platform_id=r.platform where start_time between '${params.start_date}' and '${params.end_date}' ${platform_id} order by start_time DESC ${limit}`;

    const countSql = `SELECT count(*) as count from ${tableName} as r
     LEFT JOIN game_info as g ON r.game_id = g.game_id LEFT JOIN room_info as f ON r.room_id = f.room_id
     LEFT JOIN platform_info as p on p.platform_id=r.platform
     where  start_time between '${params.start_date}' and '${params.end_date}' ${platform_id}`; // dq 10-16
    const a = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const b = await this.app.model.query(countSql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return {
      rows: a,
      count: b,
    };
  }

  async getHistoryBet(platform_id) {
    let where = '';
    if (platform_id) {
      where += ` where platform = ${platform_id} `;
    }
    const sql = 'select sum(valid_bet) as valid_bet, sum(lost_gold - win_gold + deduct_gold) as lost_win from platform_data' + where;
    const res = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    let { valid_bet, lost_win } = res[0]; // 历史数据
    valid_bet = Number(valid_bet);
    lost_win = Number(lost_win);
    console.log('lost_win: ', lost_win);
    console.log('valid_bet: ', valid_bet);
    const todayData = await this.getPlatformDataAll();
    if (platform_id) {
      if (todayData && todayData[platform_id]) {
        valid_bet += Number(todayData[platform_id].validBet || 0);
        lost_win += Number((todayData[platform_id].lostGold || 0 - todayData[platform_id].winGold || 0 + todayData[platform_id].deductGold || 0));
      }
    } else {
      Object.keys(todayData).forEach(key => {
        if (key !== 'timestamp') {
          valid_bet += todayData[key].validBet || 0;
          lost_win += (todayData[key].lostGold || 0 - todayData[key].winGold || 0 + todayData[key].deductGold || 0);
        }
      });
    }
    return { valid_bet, lost_win };
  }
}

module.exports = PlatformDataService;
