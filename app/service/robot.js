/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
class RobotService extends Service {

  async findRobotMonitor(params, page, limit) {
    const Sequelize = this.ctx.model.Sequelize;
    // const Op = this.ctx.model.Sequelize.Op;
    // const where = {
    //   params: {
    //     [Op.like]: '%' + params + '%',
    //   },
    // };
    const rows = await this.ctx.model.RobotData.findAll({
      where: params,
      offset: (page - 1) * limit,
      limit,
      attributes: [
        'username',
        [ Sequelize.fn('SUM', Sequelize.col('total_games')), 'total_games' ],
        [ Sequelize.fn('SUM', Sequelize.col('valid_bet')), 'valid_bet' ],
        [ Sequelize.fn('SUM', Sequelize.col('win_gold')), 'win_gold' ],
        [ Sequelize.fn('SUM', Sequelize.col('lost_gold')), 'lost_gold' ],
      ],
      group: 'username',
      subQuery: false, // 不让在子查询里分页，全局处理
    });
    const count = await this.ctx.model.RobotData.count({
      distinct: 'uesrname',
      where: params,
      col: 'username',
    });
    return { rows, count };
  }

  async findRobotById() {
    return await this.ctx.model.RobotMonitor.findOne();
  }

  async save(params) {
    const result = await this.ctx.model.RobotMonitor.findOne({
      where: { id: 1 },
    });
    if (result) {
      return await this.ctx.model.RobotMonitor.update(
        params,
        {
          where: { id: 1 },
        });
    }
    params.id = 1;
    return await this.ctx.model.RobotMonitor.create(params);
  }

  async export(params) {
    const Sequelize = this.ctx.model.Sequelize;
    const rows = await this.ctx.model.RobotData.findAll({
      where: params,
      attributes: [
        'username',
        [ Sequelize.fn('SUM', Sequelize.col('total_games')), 'total_games' ],
        [ Sequelize.fn('SUM', Sequelize.col('valid_bet')), 'valid_bet' ],
        [ Sequelize.fn('SUM', Sequelize.col('win_gold')), 'win_gold' ],
        [ Sequelize.fn('SUM', Sequelize.col('lost_gold')), 'lost_gold' ],
      ],
      group: 'username',
      subQuery: false, // 不让在子查询里分页，全局处理
    });
    // console.log('row: ', JSON.stringify(rows));
    const template = [
      [ '机器人id', '局数', '投注', '输赢', '输', '赢' ],
    ];
    for (const row of rows) {
      const filed = [ row.username, row.total_games, row.valid_bet, row.win_gold - row.lost_gold, row.lost_gold, row.win_gold ];
      template.push(filed);
    }
    return template;
  }

  async getDetailLog(params) {
    let str;
    if (params.game_no) {
      str = params.game_no.substr(0, 6);
    } else {
      str = moment().format('YYYYMM');
    }
    if (params.start_time.length === 10) {
      params.start_time = params.start_time + ' 00:00:00';
    }
    if (params.end_time.length === 10) {
      params.end_time = params.end_time + ' 23:59:59';
    }

    let sql = `select a.create_time,a.game_no, a.game_id, a.valid_bet,a.data, a.profit,b.game_name 
    from game_record_${str} a left join  game_info b on  b.game_id =  a.game_id 
    where a.create_time between '${params.start_time}' and '${params.end_time}' and username='${params.username}'`;
    let sql_count = `select count(*) as count from  game_record_${str} 
    where create_time between '${params.start_time}' and '${params.end_time}' and username='${params.username}'`;
    if (params.game_no) {
      sql += ` and game_no='${params.game_no}'`;
      sql_count += ` and game_no='${params.game_no}'`;
    }
    console.log('params:', params);
    if (params.platform_id != '' && params.platform_id != undefined && params.platform_id != '0') {
      sql += ` and platform=${params.platform_id}`;
      sql_count += ` and platform=${params.platform_id}`;
    }
    sql += ` limit ${(params.page - 1) * params.limit}, ${params.limit}`;

    console.log('sql: ', sql);
    console.log('sql_count: ', sql_count);

    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    for (const row of rows) {
      const name_arr = [];
      const att = JSON.parse(row.data).record.att;
      for (const key in att) {
        if (Object.prototype.hasOwnProperty.call(att, key)) {
          name_arr.push(att[key].name);
        }
      }
      row.name_list = name_arr.join(',');
      delete row.data;
    }
    const count = await this.app.model.query(sql_count, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return { rows, count: count[0].count };
  }

  async detailExport(params) {
    let str;
    if (params.game_no) {
      str = params.game_no.substr(0, 6);
    } else {
      str = moment().format('YYYYMM');
    }
    let sql = `select a.create_time,a.game_no, a.game_id, a.valid_bet,a.data, a.profit,b.game_name 
    from game_record_${str} a left join  game_info b on  b.game_id =  a.game_id 
    where a.create_time between '${params.start_time}' and '${params.end_time}' and username='${params.username}'`;

    if (params.game_no) {
      sql += ` and game_no='${params.game_no}'`;
    }

    console.log('sql: ', sql);

    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    // console.log(JSON.stringify(rows));

    // console.log('rows: ', JSON.stringify(rows));
    const template = [
      [ '日期', '牌局编号', '游戏名称', '参与id', '投注', '输赢' ],
    ];

    for (const row of rows) {
      const name_arr = [];
      for (const temp of JSON.parse(row.data).record.att) {
        name_arr.push(temp.name);
      }
      row.name_list = name_arr.join(',');
      const filed = [ row.create_time, row.game_no, row.game_name, row.name_list, row.valid_bet, row.profit ];
      template.push(filed);
    }
    // console.log('template: ', template);
    return template;
  }

}
module.exports = RobotService
;
