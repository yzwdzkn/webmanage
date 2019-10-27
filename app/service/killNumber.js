/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class KillNumberService extends Service {

  /**
     * 获取全局杀数
     */
  async findGlobalKill() {
    return await this.ctx.model.KillNumber.findOne({
      where: {
        is_global: 1,
      },
    });
  }


  /**
   * 获取当前平台总盈利率
   */
  async findKillRate() {
    const sql = 'select sum(lost_gold - win_gold) as win_gold, sum(valid_bet) as valid_bet from platform_data';
    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const rate = result[0].valid_bet ? result[0].win_gold / result[0].valid_bet : 0; // dq
    return rate;
  }

  /**
     * 获取房间杀数
     * @param {*} game_id
     */
  async findRoomKill(game_id, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {};
    if (game_id != 0) {
      where.game_id = game_id;
    }
    // 数据库查询数据
    let data = await this.ctx.model.RoomInfo.findAndCountAll({
      where,
      offset: (parseInt(page) - 1) * parseInt(limit), // 每页起始位置
      limit: parseInt(limit),
      include: [ // 关联查询
        {
          model: this.ctx.model.KillNumber,
        },
        {
          model: this.ctx.model.GameInfo,
          attributes: [ 'game_id', 'game_name' ],
        },
        {
          model: this.ctx.model.RoomData,
          attributes: [ 'create_time', 'win_gold', 'lost_gold', 'valid_bet', 'deduct_gold' ],
          required: false,
          where: {
            create_time: {
              [Op.gte]: moment().subtract(1, 'day').format('YYYY-MM-DD'),
              [Op.lte]: moment().format('YYYY-MM-DD'),
            },
          },
        },
      ],
      attributes: [ 'room_id', 'room_name' ],
      subQuery: false,
    });
    data = JSON.parse(JSON.stringify(data));
    // 获取今日房间数据
    const roomDataAll = await this.service.dataStatistics.roomData.getRoomDataAll() || {};
    const create_time = moment().format('YYYY-MM-DD');
    const roomData = {};
    // 将每个代理的房间数据处理成一个总的房间数据
    console.log(roomDataAll);
    Object.keys(roomDataAll).forEach(key => {
      if (key != 'timestamp') {
        const item = roomData[key.split('-')[0]] || { create_time, win_gold: 0, lost_gold: 0, valid_bet: 0, deduct_gold: 0 };
        item.win_gold += roomDataAll[key].winGold || 0;
        item.lost_gold += roomDataAll[key].lostGold || 0;
        item.valid_bet += roomDataAll[key].validBet || 0;
        item.deduct_gold += roomDataAll[key].deductGold || 0;
        roomData[key.split('-')[0]] = item;
      }
    });
    // 拼接今日房间输赢数据
    for (let i = 0; i < data.rows.length; i++) {
      const item = roomData[data.rows[i].room_id];
      if (item) {
        data.rows[i].room_data.push(item);
      }
    }

    return data;
  }

  /**
     * 获取某个游戏的杀数
     * @param {*} room_id
     */
  async getGameKill(room_id) {
    return await this.ctx.model.KillNumber.findOne({
      where: {
        room_id,
      },
    });
  }


  /**
     * 获取某个时间的全局杀数
     */
  async findGlobalKillByDate(date) {
    const time = moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
    const Op = this.ctx.model.Sequelize.Op;
    return await this.ctx.model.KillNumberLog.findOne({
      where: {
        target: '全局',
        create_time: {
          [Op.lte]: time, // Op.lte 小于等于 操作
        },
      },
      order: [
        [ 'create_time', 'DESC' ],
      ],
    });
  }

  /**
     * 保存全局杀数
     * @param {*} kill_number  杀数值
     */
  async saveGlobalKill(kill_number) {
    return await this.ctx.model.KillNumber.findOrCreate({
      where: {
        is_global: 1,
      },
      defaults: {
        is_global: 1,
        kill_number,
        update_time: new Date(),
      },
    }).spread(async (data, created) => {
      if (created === false) {
        this.saveKillLog('全局杀放', '全局期望杀数', data.kill_number, kill_number);
        return await this.ctx.model.KillNumber.update(
          {
            kill_number,
          },
          {
            where: {
              is_global: 1,
            },
          }
        );
      }
      this.saveKillLog('全局杀放', '全局期望杀数', 0, kill_number);
      return data;

    });
  }

  async saveGlobalKillStatus(kill_status) {
    await this.ctx.model.GlobalStatus.update(
      { kill_status },
      { where: { id: 1 } }
    );
    return await this.saveKillLog('全局追杀状态', '全局追杀开关', kill_status == 0 ? 1 : 0, kill_status);
  }

  async saveGlobalWaterStatus(water_status) {
    await this.ctx.model.GlobalStatus.update(
      { water_status },
      { where: { id: 1 } } // 1-放水
    );
    return await this.saveKillLog('全局放水状态', '全局放水开关', water_status == 0 ? 1 : 0, water_status);
  }

  /**
     * 保存游戏杀数
     * @param {*} room_id 房间id
     * @param {*} kill_number  游戏杀数
     */
  async saveRoomKill(room_id, kill_number, room_name) {
    return await this.ctx.model.KillNumber.findOrCreate({
      where: {
        room_id,
      },
      defaults: {
        is_global: 0,
        room_id,
        kill_number,
        update_time: new Date(),
      },
    }).spread(async (data, created) => {
      const result = await this.ctx.model.RoomInfo.findOne({
        where: { room_id },
        include: [{
          model: this.ctx.model.GameInfo,
          attributes: [ 'game_name' ],
        }],
      });
      if (created === false) {
        this.saveKillLog('房间杀放', `${result.game_info.game_name}-${room_name},房间期望杀数`, data.kill_number, kill_number);
        return await this.ctx.model.KillNumber.update(
          {
            kill_number,
          },
          {
            where: {
              room_id,
            },
          }
        );
      }
      this.saveKillLog('房间杀放', `${room_name}房间期望杀数`, 0, kill_number);
      return data;
    });
  }

  async saveKillLog(func, target, pre_kill_number, cur_kill_number) {
    if (pre_kill_number != cur_kill_number) {
      return await this.ctx.model.KillNumberLog.create({
        func,
        target,
        pre_kill_number,
        cur_kill_number,
        operator: this.ctx.session.admin.username,
        create_time: new Date(),
      });
    }
  }

  /**
     * 获取所有杀数的操作日志
     * @param {*} page  第几页
     * @param {*} limit 每页显示多少数据
     */
  async findKillLogList(page, limit, func, operator, s_start_date, s_end_date) {
    const where = {};
    const Op = this.ctx.model.Sequelize.Op;
    if (func) {
      where.func = func;
    }
    if (operator) {
      where.operator = operator;
    }
    if (s_start_date && s_end_date) {
      where.create_time = {
        [Op.gt]: s_start_date,
        [Op.lt]: s_end_date,
      };
    } else if (s_start_date) {
      where.create_time = {
        [Op.gt]: s_start_date,
      };
    } else if (s_end_date) {
      where.create_time = {
        [Op.lt]: s_end_date,
      };
    }

    return await this.ctx.model.KillNumberLog.findAndCountAll({
      where,
      order: [
        [ 'create_time', 'DESC' ],
      ],
      offset: (parseInt(page) - 1) * parseInt(limit), // 每页起始位置
      limit: parseInt(limit), // 每页的数据条数
    });
  }

  async findStatus() {
    return await this.ctx.model.GlobalStatus.findOne({
      where: { id: 1 },
    });
  }

}

module.exports = KillNumberService;
