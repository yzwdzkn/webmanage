'use strict';
/* eslint-disable eqeqeq */
const Service = require('egg').Service;
const moment = require('moment');
class UserOnlineService extends Service {

  async getUserByTime(time, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const Sequelize = this.ctx.model.Sequelize;
    const date = moment(time).format('YYYY-MM-DD');
    // console.log('##########################date: ', date);
    return await this.ctx.model.UserLoginHall.findAndCountAll({
      where: {
        login_time: { [Op.lte]: time },
        logout_time: { [Op.or]: [{ [Op.gte]: time }, null ] },
      },
      offset: (parseInt(page) - 1) * parseInt(limit), // 每页起始位置
      limit: parseInt(limit),
      include: [{
        model: this.ctx.model.UserAccount,
        attributes: [ 'nickname', 'mobile_phone', 'createdate' ],
      }],
      attributes: Object.keys(this.ctx.model.UserLoginHall.rawAttributes).concat([
        [
          Sequelize.literal(`(SELECT count(user_id) count FROM user_login_hall u WHERE
          user_login_hall.user_id = u.user_id AND user_login_hall.login_time >= '${date} 00:00:00' AND
          (user_login_hall.logout_time <= '${date} 23:59:59' OR user_login_hall.logout_time is null))`),
          'day_count',
        ]]),
      group: 'user_id',
    });
  }


  async getOnlineNumberByDay() {
    const Op = this.ctx.model.Sequelize.Op;
    // const Sequelize = this.ctx.model.Sequelize;
    const startToday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const startYesterday = moment().subtract(1, 'days').startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endYesterday = moment().subtract(1, 'days').endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const todayData = await this.ctx.model.OnlineAll.findAll({
      where: {
        create_time: {
          [Op.gte]: startToday,
          [Op.lte]: endToday,
        },
      },
      order: [
        [ 'create_time', 'ASC' ],
      ],
    });

    const yesterdayData = await this.ctx.model.OnlineAll.findAll({
      where: {
        create_time: {
          [Op.gte]: startYesterday,
          [Op.lte]: endYesterday,
        },
      }, order: [
        [ 'create_time', 'ASC' ],
      ],
    });
    return { todayData, yesterdayData };
  }


  async getOnlineNumberByMonth(startDate, endDate) {
    const start_date = moment(startDate || new Date()).subtract(31, 'days').startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const end_date = moment(endDate || new Date()).subtract(1, 'days').endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    // console.log('####################################');
    const sql = `SELECT DATE_FORMAT(create_time,"%Y-%m-%d") as date,  
    MAX(value) as number from online_all where create_time BETWEEN '${start_date}' and '${end_date}' 
    GROUP BY DATE_FORMAT(create_time,"%Y-%m-%d") ORDER BY date ASC`;

    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    // console.log('getOnlineNumberByMonth: ', result);
    return result;
  }

  dataTransfer(rows) {
    // console.log('rows: ', JSON.stringify(rows));
    const result = [];
    if (rows.length === 0) {
      return Array.apply(null, Array(24)).map(() => 0);
    }
    for (let i = 0; i < rows.length; i++) {
      const time = moment(rows[i].create_time).format('HH:00:00');
      let k = time.split(':')[0];
      if (k[0] === '0') {
        k = k.substr(1, 1);
      }
      //   console.log(k);
      result[k] = rows[i].value;
    }
    for (let n = 0; n < 24; n++) {
      if (result[n] === undefined) {
        result[n] = 0;
      }
    }
    return result;
  }

  /**
   * 获取最后一条会员在线信息
   */
  async getLastData() {
    return await this.ctx.model.OnlineAll.findOne({
      order: [
        [ 'create_time', 'DESC' ],
      ],
      limit: 1,
    });
  }

  /**
   * 数据总览中存取款信息, 展示先放到该service上
   */

  async getDepositingAndWithdrawing(start_date, end_date) {
    start_date = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    end_date = moment(end_date).format('YYYY-MM-DD HH:mm:ss');
    const sql = `select 
    (select COALESCE(sum(score),0) as total from orders where type in('2','4') and create_time between '${start_date}' and '${end_date}') as deposit_total,
    (select count(distinct user_id) as count_user from orders where type in('2','4') and create_time between '${start_date}' and '${end_date}') as deposit_count,
    (select COALESCE(sum(score),0) as total from orders where type in('3','5') and create_time between '${start_date}' and '${end_date}') as withdrawal_total,
    (select count(distinct user_id) as count_user from orders where type in('3','5') and create_time between '${start_date}' and '${end_date}') as withdrawal_count,
    0 as total_service_charge
    from orders limit 1`;
    // (select COALESCE(sum(service_charge),0) as total_service_charge from orders where create_time between '${start_date}' and '${end_date}') as total_service_charge
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }

  async getSafeBoxBalance() {
    const sql = 'select sum(safe_box_money) as safe_box_balance from user_account';
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }

  async getSafeBoxBalance2() {
    const res = await this.app.model.UserAccount.findAll({ attributes: [[ this.app.Sequelize.fn('SUM', this.app.Sequelize.col('safe_box_money')), 'safe_box_balance' ]] });
    return res;
  }

  async getRemain(start_date, end_date) {
    const ONEDAY = 1000 * 60 * 60 * 24;
    const start_date_sub = moment(start_date - ONEDAY * 2).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const end_date_sub = moment(end_date - ONEDAY * 2).endOf('day').format('YYYY-MM-DD HH:mm:ss');
    start_date = moment(start_date - ONEDAY).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    end_date = moment(end_date - ONEDAY).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    const users = await this.service.user.findRegisterUserByDate(start_date_sub, end_date_sub);
    const user_count = users.length;
    if (user_count == 0) {
      return 0;
    }
    const Op = this.ctx.model.Sequelize.Op;
    const user_id_arr = [];
    for (const user of users) {
      user_id_arr.push(user.id);
    }
    const remain_count = await this.ctx.model.UserLoginHall.count({
      where: {
        login_time: {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        },
        user_id: {
          [Op.in]: user_id_arr,
        },
      },
    });
    return (remain_count / user_count).toFixed(2);
  }

}

module.exports = UserOnlineService;
