'use strict';

const Service = require('egg').Service;
const sequelize = require('sequelize');
const moment = require('moment');

class gameOverviewService extends Service {
  async initData(date) {
    const date1 = moment(date || new Date()).format('YYYY-MM-DD 00:00:00');
    const sql2 = `SELECT DATE_FORMAT(gd.create_time,'%Y-%m-%d') as create_time,gi.game_name,sum(gd.deduct_gold) as total FROM game_data gd join game_info gi ON gd.game_type = gi.game_code WHERE DATEDIFF('${date1}',gd.create_time)< 31 GROUP BY gd.create_time,game_type`;
    const pump = await this.ctx.model.query(sql2, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });

    const sql3 = `SELECT SUM(total_games) as count, sum(valid_bet) as num,win_gold - lost_gold as gold ,DATE_FORMAT(gd.create_time,'%Y-%m-%d') as create_time,game_name from game_data gd JOIN game_info gi on gd.game_type = gi.game_code where DATEDIFF('${date1}', gd.create_time)< 31  GROUP BY create_time,game_type `;
    const betCount = await this.ctx.model.query(sql3, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });


    return {
      pump,
      betCount,
    };
  }

  async onlineUsers(date = new Date()) {
    const date1 = moment(date).format('YYYY-MM-DD 00:00:00');
    const sql = `SELECT gi.game_id,gi.game_name,gi.game_code,sum(value) as total,DATE_FORMAT(og.create_time, '%m/%e %H:%i') as create_time
    from game_info gi JOIN online_game og on gi.game_id = og.game_id
    WHERE gi.is_delete = 0 AND TIMEDIFF('${date1}', og.create_time) <24 GROUP BY DATE_FORMAT(og.create_time, '%m/%e %H:%i'),game_id;`;
    const online = await this.ctx.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return online;
  }
}

module.exports = gameOverviewService;
