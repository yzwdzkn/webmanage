/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const linq = require('linq');
const MATCHTYPE = require('../../tools/recordConfig').MATCHTYPE;
const GameData = require('../../tools/recordConfig').GameData;
const _ = require('lodash');

const tools = require('../../tools/tools');
let roomDataAll; // 记录每个房间当天数据
let roomBetNumber; // 投注人数
let timer = 0;
// let roomDateTime; // 记录当天的时间
class RoomDataService extends Service {

  /**
   * 根据时间查询房间数据
   * @param {*} agent_id
   * @param {*} game_id
   * @param {*} room_id
   * @param {*} start_date
   * @param {*} end_date
   */
  async getData(agent_id, game_id, room_id, start_date, end_date, orderField, orderType) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = {};
    const roomDataWhere = {
      create_time: {
        [Op.gte]: start_date,
        [Op.lte]: end_date,
      },
    };
    if (game_id != '' && game_id != '0') { // 游戏ID
      where.game_id = game_id;
    }

    if (room_id != '' && room_id != '0') { // 房间ID
      where.room_id = room_id;
    }

    if (agent_id != '' && agent_id != '0') {
      roomDataWhere.agent_id = agent_id;
    }

    let { rows, count } = await this.ctx.model.RoomInfo.findAndCountAll({

      order: [[ 'room_id', 'ASC' ]],
      where,
      include: [
        {
          model: this.ctx.model.RoomData,
          attributes: [
            'create_time',
            'room_id',
            [ Sequelize.fn('SUM', Sequelize.col('total_games')), 'total_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('bet_number')), 'bet_number' ],
            [ Sequelize.fn('SUM', Sequelize.col('valid_bet')), 'valid_bet' ],
            [ Sequelize.fn('SUM', Sequelize.col('win_games')), 'win_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('win_gold')), 'win_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('lost_games')), 'lost_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('lost_gold')), 'lost_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('deduct_gold')), 'deduct_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('dive_games')), 'dive_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('dive_gold')), 'dive_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('dive_win_games')), 'dive_win_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('dive_win_gold')), 'dive_win_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('dive_lost_games')), 'dive_lost_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('dive_lost_gold')), 'dive_lost_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('kill_games')), 'kill_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('kill_gold')), 'kill_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('kill_win_games')), 'kill_win_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('kill_win_gold')), 'kill_win_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('kill_lost_games')), 'kill_lost_games' ],
            [ Sequelize.fn('SUM', Sequelize.col('kill_lost_gold')), 'kill_lost_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('duration')), 'duration' ],
          ],
          where: roomDataWhere,
        },
        {
          model: this.ctx.model.GameInfo,
          attributes: [ 'game_name' ],
        },
      ],
      attributes: [ 'room_name', 'room_id' ],
      group: 'room_info.room_id',
      subQuery: false, // 不让在子查询里分页，全局处理
    });
    if (end_date == moment().format('YYYY-MM-DD')) { // 今日数据
      rows = JSON.parse(JSON.stringify(rows));
      const curData = await this.getRoomDataAll(); // 获取今日数据
      const keys = Object.keys(curData); // 拿到所有的key
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          const room_id = rows[i].room_id.toString();
          keys.forEach(key => {
            if (agent_id == '0' && room_id == key.split('-')[0] || agent_id != '0' && (room_id + '-' + agent_id) == key) {
              rows[i].room_data[0].total_games = parseInt(rows[i].room_data[0].total_games) + parseInt(curData[key].totalGames || 0);
              rows[i].room_data[0].bet_number = parseInt(rows[i].room_data[0].bet_number) + parseInt(curData[key].betNumber || 0);
              rows[i].room_data[0].valid_bet = parseInt(rows[i].room_data[0].valid_bet) + parseInt(curData[key].validBet || 0);
              rows[i].room_data[0].win_games = parseInt(rows[i].room_data[0].win_games) + parseInt(curData[key].winGames || 0);
              rows[i].room_data[0].win_gold = parseInt(rows[i].room_data[0].win_gold) + parseInt(curData[key].winGold || 0);
              rows[i].room_data[0].lost_games = parseInt(rows[i].room_data[0].lost_games) + parseInt(curData[key].lostGames || 0);
              rows[i].room_data[0].lost_gold = parseInt(rows[i].room_data[0].lost_gold) + parseInt(curData[key].lostGold || 0);
              rows[i].room_data[0].deduct_gold = parseInt(rows[i].room_data[0].deduct_gold) + parseInt(curData[key].deductGold || 0);
              rows[i].room_data[0].dive_games = parseInt(rows[i].room_data[0].dive_games) + parseInt(curData[key].diveGames || 0);
              rows[i].room_data[0].dive_gold = parseInt(rows[i].room_data[0].dive_gold) + parseInt(curData[key].diveGold || 0);
              rows[i].room_data[0].dive_win_games = parseInt(rows[i].room_data[0].dive_win_games) + parseInt(curData[key].diveWinGames || 0);
              rows[i].room_data[0].dive_win_gold = parseInt(rows[i].room_data[0].dive_win_gold) + parseInt(curData[key].diveWinGold || 0);
              rows[i].room_data[0].dive_lost_games = parseInt(rows[i].room_data[0].dive_lost_games) + parseInt(curData[key].diveLostGames || 0);
              rows[i].room_data[0].dive_lost_gold = parseInt(rows[i].room_data[0].dive_lost_gold) + parseInt(curData[key].diveLostGold || 0);
              rows[i].room_data[0].kill_games = parseInt(rows[i].room_data[0].kill_games) + parseInt(curData[key].killGames || 0);
              rows[i].room_data[0].kill_gold = parseInt(rows[i].room_data[0].kill_gold) + parseInt(curData[key].killGold || 0);
              rows[i].room_data[0].kill_win_games = parseInt(rows[i].room_data[0].kill_win_games) + parseInt(curData[key].killWinGames || 0);
              rows[i].room_data[0].kill_win_gold = parseInt(rows[i].room_data[0].kill_win_gold) + parseInt(curData[key].killWinGold || 0);
              rows[i].room_data[0].kill_lost_games = parseInt(rows[i].room_data[0].kill_lost_games) + parseInt(curData[key].killLostGames || 0);
              rows[i].room_data[0].kill_lost_gold = parseInt(rows[i].room_data[0].kill_lost_gold) + parseInt(curData[key].killLostGold || 0);
              rows[i].room_data[0].duration = parseInt(rows[i].room_data[0].duration) + parseInt(curData[key].duration || 0);
            }
          });
        }
      } else {
        const arr = [];
        keys.forEach(key => {
          if (key != 'timestamp') {
            const room_id = key.split('-')[0]; // 房间id
            const agent_id = key.split('-')[1]; // 代理id
            const game_id = room_id.substring(0, room_id.length - 2); // 游戏id
            arr.push({
              room_id,
              game_id,
              agent_id,
              game_info: {
                game_id: key.split('-')[1],
                game_name: GameData[game_id],
              },
              room_data: [{
                total_games: (curData[key].totalGames || 0),
                bet_number: (curData[key].betNumber || 0),
                valid_bet: (curData[key].validBet || 0),
                win_games: (curData[key].winGames || 0),
                win_gold: (curData[key].winGold || 0),
                lost_games: (curData[key].lostGames || 0),
                lost_gold: (curData[key].lostGold || 0),
                deduct_gold: (curData[key].deductGold || 0),
                dive_games: (curData[key].diveGames || 0),
                dive_gold: (curData[key].diveGold || 0),
                dive_win_games: (curData[key].diveWinGames || 0),
                dive_win_gold: (curData[key].diveWinGold || 0),
                dive_lost_games: (curData[key].diveLostGames || 0),
                dive_lost_gold: (curData[key].diveLostGold || 0),
                kill_games: (curData[key].killGames || 0),
                kill_gold: (curData[key].killGold || 0),
                kill_win_games: (curData[key].killWinGames || 0),
                kill_win_gold: (curData[key].killWinGold || 0),
                kill_lost_games: (curData[key].killLostGames || 0),
                kill_lost_gold: (curData[key].killLostGold || 0),
                duration: (curData[key].duration || 0),
              }],
            });
          }
        });
        // linq 根据条件查询
        const arrRes = linq.from(arr).where(item => {
          if (game_id != '' && game_id != '0' && item.game_id != game_id) { // 游戏ID
            return false;
          }

          if (room_id != '' && room_id != '0' && item.room_id != room_id) { // 房间ID
            return false;
          }

          if (agent_id != '' && agent_id != '0' && item.agent_id != agent_id) {
            return false;
          }
          return true;
        }).toArray();

        // 将数据分组求和
        const indexObj = {};
        for (let i = 0; i < arrRes.length; i++) {
          if (indexObj[arrRes[i].room_id] !== undefined) {
            const index = indexObj[arrRes[i].room_id];
            rows[index].room_data[0].total_games = parseInt(rows[index].room_data[0].total_games) + parseInt(arrRes[i].room_data[0].total_games || 0);
            rows[index].room_data[0].bet_number = parseInt(rows[index].room_data[0].bet_number) + parseInt(arrRes[i].room_data[0].bet_number || 0);
            rows[index].room_data[0].valid_bet = parseInt(rows[index].room_data[0].valid_bet) + parseInt(arrRes[i].room_data[0].valid_bet || 0);
            rows[index].room_data[0].win_games = parseInt(rows[index].room_data[0].win_games) + parseInt(arrRes[i].room_data[0].win_games || 0);
            rows[index].room_data[0].win_gold = parseInt(rows[index].room_data[0].win_gold) + parseInt(arrRes[i].room_data[0].win_gold || 0);
            rows[index].room_data[0].lost_games = parseInt(rows[index].room_data[0].lost_games) + parseInt(arrRes[i].room_data[0].lost_games || 0);
            rows[index].room_data[0].lost_gold = parseInt(rows[index].room_data[0].lost_gold) + parseInt(arrRes[i].room_data[0].lost_gold || 0);
            rows[index].room_data[0].deduct_gold = parseInt(rows[index].room_data[0].deduct_gold) + parseInt(arrRes[i].room_data[0].deduct_gold || 0);
            rows[index].room_data[0].dive_games = parseInt(rows[index].room_data[0].dive_games) + parseInt(arrRes[i].room_data[0].dive_games || 0);
            rows[index].room_data[0].dive_gold = parseInt(rows[index].room_data[0].dive_gold) + parseInt(arrRes[i].room_data[0].dive_gold || 0);
            rows[index].room_data[0].kill_games = parseInt(rows[index].room_data[0].kill_games) + parseInt(arrRes[i].room_data[0].kill_games || 0);
            rows[index].room_data[0].kill_gold = parseInt(rows[index].room_data[0].kill_gold) + parseInt(arrRes[i].room_data[0].kill_gold || 0);
            rows[index].room_data[0].kill_win_games = parseInt(rows[index].room_data[0].kill_win_games) + parseInt(arrRes[i].room_data[0].kill_win_games || 0);
            rows[index].room_data[0].kill_win_gold = parseInt(rows[index].room_data[0].kill_win_gold) + parseInt(arrRes[i].room_data[0].kill_win_gold || 0);
            rows[index].room_data[0].kill_lost_games = parseInt(rows[index].room_data[0].kill_lost_games) + parseInt(arrRes[i].room_data[0].kill_lost_games || 0);
            rows[index].room_data[0].kill_lost_gold = parseInt(rows[index].room_data[0].kill_lost_gold) + parseInt(arrRes[i].room_data[0].kill_lost_gold || 0);
            rows[index].room_data[0].duration = parseInt(rows[index].room_data[0].duration) + parseInt(arrRes[i].room_data[0].duration || 0);
          } else {
            rows.push(arrRes[i]);
            indexObj[arrRes[i].room_id] = i;
          }
        }
      }
    }

    const rowArr = [];
    for (const row of rows) {
      row.room_data = row.room_data[0];
      row.room_data.lostWin = (row.room_data.win_gold - row.room_data.deduct_gold - row.room_data.lost_gold) / -100;
      row.room_data.avgLostWin = row.room_data.bet_number != 0 ? ((row.room_data.win_gold - row.room_data.deduct_gold - row.room_data.lost_gold) / row.room_data.bet_number) / 100 : 0;
      row.room_data.room_kill = ((row.room_data.win_gold - row.room_data.deduct_gold - row.room_data.lost_gold) / row.room_data.valid_bet * -100).toFixed(2);
      Object.assign(row, row.room_data);
      delete row.room_data;
      rowArr.push(row);
    }

    const result = _.sortBy(rowArr, function(o) {
      if (orderType == 'asc') {
        return o[orderField];
      }
      return -1 * o[orderField];
    });
    return { result, count };
  }

  /**
     * 将数据保存到数据库。函数一天执行一次
     */
  async saveDataToDatabase() {
    if (timer) { // 检查是否有定时器在执行
      return;
    }
    await this.initRoomData();
    await this.app.redis.set('nodeRoomData', JSON.stringify(roomDataAll)); // 存入redis 中，当作一个时间节点

    const nodeFunc = async () => {
      await this.initRoomData();
      let nodeRoomData = await this.app.redis.get('nodeRoomData');
      nodeRoomData = nodeRoomData ? JSON.parse(nodeRoomData) : {};
      const itemKey = Object.keys(nodeRoomData).sort();
      let state = 1;
      let index = 0;
      let sql = 'replace into room_data(create_time,room_id,agent_id,total_games,valid_bet,bet_number,win_games,win_gold,lost_games,lost_gold,deduct_gold,dive_games,dive_gold,dive_win_games,dive_win_gold,kill_lost_games,dive_lost_gold,kill_games,kill_gold,kill_win_games,kill_win_gold,kill_lost_games,kill_lost_gold,duration,insert_time) values ';
      let sqlValue = '';
      for (let i = 0; i < itemKey.length; i++) {
        const nodeItem = nodeRoomData[itemKey[i]];
        const item = roomDataAll[itemKey[i]];
        if (i != itemKey.length - 1) {
          sqlValue = sqlValue + await tools.splitRoomDataSql(itemKey[i], nodeItem); // 拼接sql
          index++;
        } else {
          // 判断是否被处理过
          if (!nodeItem.timestamp.handle) {
            // 判断2个时间戳一样
            if (nodeItem.timestamp.timestamp == item.timestamp.timestamp) {
              // console.log('timestamp相同');
              sqlValue = sqlValue + await tools.splitRoomDataSql(itemKey[i], nodeItem);
              item.timestamp.handle = 1; // 表示这个时间段的数据已经处理
              this.saveToRedis('timestamp', itemKey[i], item.timestamp);// 记录到redis中
            } else {
              // console.log('前时间戳：', nodeRoomData[itemKey[i]].timestamp.timestamp);
              nodeRoomData[itemKey[i]].timestamp.timestamp = item.timestamp.timestamp;
              // console.log('后时间戳：', nodeRoomData[itemKey[i]].timestamp.timestamp);
              await this.app.redis.set('nodeRoomData', JSON.stringify(nodeRoomData)); // 重新存入redis 中
              state = 0;
              index = i;
              break;
            }
          }
        }
      }
      if (sqlValue != '') {
        sql = sql + sqlValue.substring(0, sqlValue.length - 1);
        // console.log('roomData执行sql');
        // 执行sql
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        // console.log('roomData执行成功');
        for (let i = 0; i < index; i++) {
          await this.app.redis.del('roomDataAll:' + itemKey[i]);
          delete roomDataAll[itemKey[i]];
        }
        await this.app.redis.set('nodeRoomData', JSON.stringify(roomDataAll)); // 重新存入redis 中
      }

      if (state == 0) {
        console.log('过一分钟在来执行！');
        timer = 1;
        setTimeout(nodeFunc, 1000 * 60 * 3);
      } else {
        timer = 0;
      }
    };
    setTimeout(nodeFunc, 1000 * 60 * 4.5); // 延后4.5分钟执行
    // this.checkIsSameDay(timestamp);// 检查时间是否在同一天
  }


  /**
     * 保存统计每个房间每天的数据
     * @param {*} record 游戏记录
     * @param {*} tm  这局游戏结束时间戳
     */
  async saveRoomData(record, tm) {
    const time = moment(new Date(tm * 1000)).format('YYYYMMDD');
    const roomType = record.roomType + '-' + record.lineCode;
    // await this.initRoomBetNumber();
    // await this.initRoomData();
    if (!roomDataAll[time]) {
      roomDataAll[time] = {};
    }
    roomDataAll[time][roomType] = roomDataAll[time][roomType] ? roomDataAll[time][roomType] : {};
    // 保存更新记录的时间戳
    if (record.gameNo || !roomDataAll[time].timestamp) {
      roomDataAll[time].timestamp = roomDataAll[time].timestamp ? roomDataAll[time].timestamp : {};
      roomDataAll[time].timestamp.timestamp = tm;
      await this.saveToRedis('timestamp', time, roomDataAll[time].timestamp); // 保存房间数据到redis中
    }
    await this.save(roomDataAll[time][roomType], record, roomType); // 保存房间数据到内存中
    await this.saveToRedis(roomType, time, roomDataAll[time][roomType]); // 保存房间数据到redis中
    await this.saveRoomBetNumberToRedis();// 保存投注人数统计数据
  }

  /**
   * 加载redis 中的数据
   */
  async initRoomData() {
    roomDataAll = {};
    const keys = await this.app.redis.keys('roomDataAll:*');
    for (let i = 0; i < keys.length; i++) {
      const info = await this.app.redis.hgetall(keys[i]);
      const dateKey = keys[i].substring(keys[i].indexOf(':') + 1, keys[i].length);
      if (!roomDataAll[dateKey]) {
        roomDataAll[dateKey] = {};
      }
      const key = Object.keys(info);
      for (let i = 0; i < key.length; i++) {
        roomDataAll[dateKey][key[i]] = JSON.parse(info[key[i]]);
      }
    }
  }

  /**
   * 计算每个房间的统计数据
   * @param {*} obj 存储的对象
   * @param {*} record 要保存的记录数据
   */
  async save(obj, record, roomType) {
    if (record.gameNo) { // 是否存在局号
      if (record.name) {
        if (!roomBetNumber[roomType]) {
          roomBetNumber[roomType] = [];
        }
        const username = record.name;
        if (!(roomBetNumber[roomType].includes(username))) {
          obj.betNumber = (obj.betNumber || 0) + 1; // 投注人数，按天计算
          roomBetNumber[roomType].push(username);
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
      obj.duration = (obj.duration || 0) + (record.duration || 0); // 当天房间时长（一局房间开始到结束的中间时长）

      if (record.matchType == MATCHTYPE.DIVE) { // 这局是否是放水的
        obj.diveGames = (obj.diveGames || 0) + 1; // 当天防水的局数
        obj.diveGold = (obj.diveGold || 0) + Math.abs(record.win || 0);
        if (record.win > 0) { // 放水赢了
          obj.diveWinGames = (obj.diveWinGames || 0) + 1; // 当天放水赢的局数
          obj.diveWinGold = (obj.diveWinGold || 0) + Math.abs(record.win || 0); // 当天放水赢的钱
        } else if (record.win < 0) { // 放水输了
          obj.diveLostGames = (obj.diveLostGames || 0) + 1; // 当天放水输的局数
          obj.diveLostGold = (obj.diveLostGold || 0) + Math.abs(record.win || 0); // 当天放水输的钱
        }
      } else if (record.matchType == MATCHTYPE.KILL) { // 这局是否是被追杀了的
        obj.killGames = (obj.killGames || 0) + 1; // 当天追杀的局数
        obj.killGold = (obj.killGold || 0) + Math.abs(record.win || 0);
        if (record.win > 0) { // 追杀赢了
          obj.killWinGames = (obj.killWinGames || 0) + 1; // 当天追杀赢的局数
          obj.killWinGold = (obj.killWinGold || 0) + Math.abs(record.win || 0); // 当天追杀赢的钱
        } else if (record.win < 0) { // 追杀输了
          obj.killLostGames = (obj.killLostGames || 0) + 1; // 当天追杀输的局数
          obj.killLostGold = (obj.killLostGold || 0) + Math.abs(record.win || 0); // 当天追杀输的钱
        }
      }
    }
  }

  /**
     * 将数据保存到redis中
     * @param {*} roomType  房间类型
     * @param {*} date  时间 20190628
     * @param {*} record 房间数据
     */
  async saveToRedis(roomType, date, record) {
    this.app.redis.hset('roomDataAll:' + date, roomType, JSON.stringify(record));
  }

  /**
     * 将投注人数信息保存
     */
  async saveRoomBetNumberToRedis() {
    this.app.redis.set('roomBetNumber', JSON.stringify(roomBetNumber)); // 保存到redis
  }

  /**
     * 项目启动加载有效投注人数
     */
  async initRoomBetNumber() {
    const info = await this.app.redis.get('roomBetNumber');
    if (info) {
      roomBetNumber = JSON.parse(info);
    } else {
      roomBetNumber = {};
    }
  }

  // /**
  //    * 检查时间是否在同一天
  //    * @param {*} timestamp
  //    */
  // async checkIsSameDay(timestamp) {
  //   if (!roomDateTime) {
  //     roomDateTime = await this.app.redis.get('roomDateTime'); // 获取保存的当天时间
  //     if (!roomDateTime) {
  //       roomDateTime = timestamp;
  //       this.app.redis.set('roomDateTime', roomDateTime); // 保存到redis
  //     } else {
  //       roomDateTime = parseInt(roomDateTime);
  //     }
  //   }
  //   const tm1 = moment(new Date(roomDateTime));
  //   const tm2 = moment(new Date(timestamp));
  //   if (tm1.date() != tm2.date()) { // 是否是同一天
  //     this.cleanRealTimeData(); // 清除当天数据
  //     roomDateTime = timestamp;
  //     this.app.redis.set('roomDateTime', roomDateTime); // 保存到redis
  //   }
  // }

  /**
   * 清除每天登录投注人的数据
   */
  async cleanRealTimeData() {
    // console.log('清除每天房间投注信息数据:', new Date());
    roomBetNumber = null; // 清除
    await this.app.redis.del('roomBetNumber');
  }

  /**
   * 获取今日的房间数据
   */
  async getRoomDataAll() {
    const time = moment(new Date()).format('YYYYMMDD');
    await this.initRoomData();
    return roomDataAll[time] || {};
  }
}

module.exports = RoomDataService;
