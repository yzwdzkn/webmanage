/* eslint-disable no-loop-func */
/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class historyDataService extends Service {
  async initData() {
    const startDate = moment().subtract(31, 'days').startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().subtract(1, 'days').endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const sql = `select DATE_FORMAT(create_time, '%Y-%m-%d') as date,(SUM(lost_gold) - SUM(win_gold)) as gold from agent_data 
    where create_time BETWEEN '${startDate}' AND '${endDate}' GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d') ORDER BY date ASC`;

    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return result;
  }

  /**
   * 近游戏30日 游戏累计下注 和 下注人数
   */
  async gameBet() {
    const startDate = moment().subtract(31, 'days').startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().subtract(1, 'days').endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const sql = `SELECT gd.create_time,gd.game_type,gi.game_name,gd.bet_number,gd.valid_bet from game_data gd LEFT JOIN game_info gi on gi.game_code = gd.game_type where gd.create_time BETWEEN '${startDate}' AND '${endDate}' ORDER BY gd.create_time ASC`;

    const sqlAll = `SELECT create_time,SUM(bet_number) as bet_number,SUM(valid_bet) as valid_bet from game_data where create_time BETWEEN '${startDate}' AND '${endDate}' GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d') ORDER BY create_time ASC;`;

    const [ result, resultAll ] = await Promise.all([
      (
        this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.SELECT,
        })
      ), (
        this.app.model.query(sqlAll, {
          type: this.app.Sequelize.QueryTypes.SELECT,
        })
      ),
    ]);

    const dateArr = [];
    const gameArr = [ '全部' ];
    const gameBetValueArr = { // 游戏累计下注
      全部: [],
    };
    const gameBetNumberValueArr = { // 游戏投注人数
      全部: [],
    };

    for (let i = 0; i < resultAll.length; i++) {
      gameBetValueArr['全部'].push(parseFloat((resultAll[i].valid_bet / 100).toFixed(2)));
      gameBetNumberValueArr['全部'].push(resultAll[i].bet_number);
    }

    for (let i = 0; i < result.length; i++) {
      const create_time = moment(result[i].create_time).format('YYYY-MM-DD');
      if (!dateArr.includes(create_time)) dateArr.push(create_time);
      if (!gameArr.includes(result[i].game_name)) {
        gameArr.push(result[i].game_name);
        gameBetValueArr[result[i].game_name] = [];
        gameBetNumberValueArr[result[i].game_name] = [];
      }
      gameBetValueArr[result[i].game_name][dateArr.indexOf(create_time)] = parseFloat((result[i].valid_bet / 100).toFixed(2));
      gameBetNumberValueArr[result[i].game_name][dateArr.indexOf(create_time)] = result[i].bet_number;
    }

    // 游戏累计下注
    Object.keys(gameBetValueArr).forEach(key => {
      for (let i = 0; i < dateArr.length; i++) {
        if (gameBetValueArr[key][i] == undefined) {
          gameBetValueArr[key][i] = 0;
        }
      }
    });

    // 游戏投注人数
    Object.keys(gameBetNumberValueArr).forEach(key => {
      for (let i = 0; i < dateArr.length; i++) {
        if (gameBetNumberValueArr[key][i] == undefined) {
          gameBetNumberValueArr[key][i] = 0;
        }
      }
    });

    return { dateArr, gameArr, gameBet: gameBetValueArr, gameBetNumber: gameBetNumberValueArr };
  }

  /**
   * 近游戏30日游戏活跃
   */
  async userActive() {
    const startDate = moment().subtract(31, 'days').startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().subtract(1, 'days').endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const sql = `SELECT DATE_FORMAT(u.login_time, '%Y-%m-%d') login_time ,COUNT(*) count from ( SELECT * from user_login_hall where login_time BETWEEN '${startDate}' AND '${endDate}' GROUP BY user_id, DATE_FORMAT(login_time, '%Y-%m-%d')) as u  GROUP BY  DATE_FORMAT(u.login_time, '%Y-%m-%d') ORDER BY u.login_time ASC`;
    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const dateArr = [];
    const valueArr = [];
    for (let i = 0; i < result.length; i++) {
      dateArr.push(result[i].login_time);
      valueArr.push(result[i].count);
    }
    return { dateArr, valueArr };
  }

  /**
   * 近30日注册人数
   */
  async userRegisterCount() {
    const startDate = moment().subtract(31, 'days').startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().subtract(1, 'days').endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const sql = `SELECT DATE_FORMAT(createdate, '%Y-%m-%d') as createdate , COUNT(*) count from user_account where createdate BETWEEN '${startDate}' AND '${endDate}' GROUP BY  DATE_FORMAT(createdate, '%Y-%m-%d') ORDER BY createdate ASC`;
    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });

    const dateArr = [];
    const valueArr = [];
    for (let i = 0; i < result.length; i++) {
      dateArr.push(result[i].createdate);
      valueArr.push(result[i].count);
    }
    return { dateArr, valueArr };

  }
}


module.exports = historyDataService
;
