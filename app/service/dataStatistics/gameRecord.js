/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const util = require('util');
const tools = require('../../tools/tools');
class GameRecordService extends Service {
  /**
     * 解析数据
     * @param {*} data
     * record.gamesn 房间流水号
     * att.name 玩家账号
     * record.room 房间ID
     * record.roomType 房间类型
     * data.gameId 游戏ID
     * record.tableId 桌号ID
     * att.pos 座位号
     * att.pub1 旧版牌型，这里用来获取最后一位值表示庄家的座位号 banker
     * record.att.length 玩家人数
     * att.card 玩家手牌
     * att.validBet 有效投注
     * att.total 总投注
     * att.changes  利润(输、赢)
     * att.ownChip 玩家身上剩余分数
     * att.chip 玩家携带金额
     * att.deduct 抽水
     * record.tm 游戏开始时间
     * record.td 游戏结束时间
     * att.platform 平台id
     * att.lineCode 代理
     * att.gameNo 牌局编号
     * dataStr 原数据
     */

  async parseRecord(data) {
    let tableName = '';
    let sql = '';
    try {
      const record = data.record;
      tableName = 'game_record_' + moment(record.td * 1000).utcOffset(8).format('YYYYMM');
      sql = 'insert into ' + tableName + '(gamesn,username,room_id,room_type,game_id,table_Id,pos_id,banker,number,cart,valid_bet,all_bet,profit,current_score,take_score,deduct,start_time,end_time,platform,agent,game_no,data,create_time) values';
      let length = 0;
      if (Object.prototype.toString.call(record.att) === '[object Object]') {
        length = Object.keys(record.att).length;
      } else if (Object.prototype.toString.call(record.att) === '[object Array]') {
        length = record.att.length;
      }
      const banker = (record.pub1 == undefined || record.pub1 == '') ? 0 : record.pub1.substr(record.pub1.length - 1); // 庄家的座位号
      const dataStr = JSON.stringify(data);
      for (const key in record.att) {
        const att = record.att[key];
        if (att && att.isRobot === false) {
          sql += `(
            ${record.gamesn},
            '${att.name}',
            ${record.room},
            ${record.roomType},
            ${data.gameId},
            ${record.tableId},
            ${att.pos == undefined ? null : att.pos},
            ${banker},
            ${length},
            '${att.card == undefined ? '' : JSON.stringify(att.card)}',
            ${att.validBet == undefined ? null : parseInt(att.validBet)},
            ${att.total == undefined ? null : parseInt(att.total)},
            ${att.changes == undefined ? null : parseInt(att.changes)},
            ${att.ownChip == undefined ? null : parseInt(att.ownChip)},
            ${att.chip == undefined ? null : parseInt(att.chip)},
            ${att.deduct == undefined ? null : parseInt(att.deduct)},
            '${moment(record.tm * 1000).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}',
            '${moment(record.td * 1000).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}',
            ${att.platform},
            '${att.lineCode}',
            '${att.gameNo}',
            '${dataStr}',
            now()),`;
        }

      }
      sql = sql.substring(0, sql.length - 1);
      await this.app.model.query(sql, {
        type: this.app.Sequelize.QueryTypes.INSERT,
      });
    } catch (e) {
      this.ctx.logger.info('插入数据失败:', e.message);
      if (e.message == `Table '${this.app.config.sequelize.database}.` + tableName + "' doesn't exist") {
        this.ctx.logger.info('数据表不存在：', tableName, ',开始创建表重新执行sql');
        const createTableSql = await tools.createRecordTableSql(tableName);
        // 创建表
        await this.app.model.query(createTableSql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        this.ctx.logger.info('创建表成功：', tableName);
        // 重新执行sql
        await this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.INSERT,
        });
        this.ctx.logger.info('重新执行sql成功');
      } else {
        this.ctx.logger.info('其他错误,保存错误日志！');
        try {
          await this.app.model.GameRecordError.create({
            message: e.message,
            data: JSON.stringify(data),
            sql,
            status: 0,
            create_time: new Date(),
          });
        } catch (error) {
          console.log('保存游戏记录错误日志失败：', error);
        }
        return false;
      }
    }

    return true;
  }

  async findAndCount(params) {
    const tableName = 'game_record_' + moment(new Date(params.start_time)).utcOffset(8).format('YYYYMM');
    let where = '';
    if (params.platform_id != '' && params.platform_id != undefined && params.platform_id != '0') {
      where += ' and r.platform = ' + params.platform_id;
    }
    if (params.game_id != '' && params.game_id != undefined && params.game_id != 0) {
      where += ' and r.game_id = ' + params.game_id;
    }
    if (params.room_id != '' && params.room_id != undefined && params.room_id != 0) {
      where += ' and r.room_id = ' + params.room_id;
    }
    if (params.agent_id) {
      where += ' and r.agent = ' + params.agent_id;
    }
    if (params.username) {
      where += util.format(' and r.username like %s', "'%" + params.username + "%'");
    }
    if (params.game_no) {
      where += util.format(' and r.game_no like %s', "'%" + params.game_no + "%'");
    }
    // if (params.e_platform_id) {
    //   where += ' and r.platform = ' + params.e_platform_id;
    // }
    where += util.format(" and r.start_time >= '%s' and r.start_time <= '%s' ", params.start_time, params.end_time);
    // dq 10-16
    let sql = `SELECT r.id,
              r.username,
              r.room_id,
              r.room_type,
              r.game_id,
              r.pos_id,
              r.valid_bet,
              r.profit,
              r.deduct,
              r.start_time,
              r.end_time,
              r.platform,
              r.agent,
              r.game_no,
              g.game_name,
              f.room_name,
              p.platform_name
            from ${tableName} as r LEFT JOIN game_info as g ON r.game_id = g.game_id LEFT JOIN room_info as f ON r.room_id = f.room_id LEFT JOIN platform_info as p on p.platform_id=r.platform  where 1 = 1 ${where} order by start_time DESC`;
    const countSql = 'SELECT COUNT(*) as count from ' + tableName + ' as r where 1 = 1' + where;
    console.log(sql);
    if (params.page != undefined && params.limit != undefined) {
      sql += util.format(' limit %d , %d', ((parseInt(params.page) - 1) * parseInt(params.limit)), parseInt(params.limit));
    }

    return await Promise.all([ (
      this.app.model.query(sql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      })
    ), (
      this.app.model.query(countSql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      })
    ) ]);
  }

  /**
   * 根据局号查询这局信息
   * @param {*} game_no
   * @param {*} platform_id
   */
  async findByGameNo(game_no, platform_id) {
    const tableName = 'game_record_' + game_no.substring(0, 6);
    let sql = `select * from ${tableName} where game_no = '${game_no}'`;
    if (platform_id != '' && platform_id != undefined) {
      sql += `platform_id = ${platform_id}`;
    }
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }

}

module.exports = GameRecordService;

