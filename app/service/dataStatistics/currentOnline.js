/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const request = require('request');
const url = require('url');
const moment = require('moment');
class CurrentOnlineController extends Controller {
  /**
     * 请求当前在线
     */
  async requestOnlineInfo() {
    request({ url: this.app.config.gameServerURl + 'getGameOnline', timeout: 10000 }, (error, response, responseData) => {
      if (error || response.statusCode != 200 || responseData == '') {
        return;
      }
      responseData = JSON.parse(responseData);
      this.parseRecord(responseData.data);
    });
  }

  /**
     * 解析数据
     * @param {*} data
     */
  async parseRecord(data) {
    const ip = url.parse(this.app.config.gameServerURl).hostname;
    this.calculationGame(data.totalGameIdPlayer, ip);
  }

  /**
   * 计算游戏和总的在线人数
   * @param {*} totalGameIdPlayer
   * @param {*} ip
   */
  async calculationGame(totalGameIdPlayer, ip) {
    let totalCount = 0; // 总在线人数
    let sql = 'insert into online_game(game_id,value,ip,create_time) values';
    const create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    Object.keys(totalGameIdPlayer).forEach(item => {
      const game_id = item.substr(item.indexOf('@') + 1);
      sql += `(${game_id},${totalGameIdPlayer[item]},'${ip}','${create_time}'),`;
      totalCount += totalGameIdPlayer[item];
    });
    sql = sql.substring(0, sql.length - 1);

    // 保存游戏在线人数
    this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.INSERT,
    });

    // 保存总在线人数
    this.ctx.model.OnlineAll.create({
      value: totalCount,
      ip,
      create_time,
    });
  }

  /**
     * 获取最后一条数据
     */
  async getTotalCurrentOnline(tm) {
    const create_time = moment(new Date(tm)).format('YYYY-MM-DD HH:mm:ss');
    const Op = this.ctx.model.Sequelize.Op;
    return await this.ctx.model.OnlineAll.findOne({
      where: {
        create_time: {
          [Op.lte]: create_time, // Op.lte 小于等于 操作
        },
      },
      attributes: [ 'value' ],
      order: [
        [ 'create_time', 'DESC' ],
      ],
    });
  }
}

module.exports = CurrentOnlineController;
