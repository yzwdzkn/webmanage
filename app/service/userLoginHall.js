/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const libqqwry = require('lib-qqwry');
const qqwry = libqqwry(); // 初始化IP库解析器
qqwry.speed(); // 启用急速模式;

class UserLoginHallService extends Service {
  // 查询登录详情
  async getLoginInfo(parms) {
    const data = {};
    const s_platform_id = parms.platform_id != 0 ? 'AND platform_id = ' + parms.platform_id : '';
    let sql = `select (Count(region)* 100 / (Select Count(*) From user_login_hall WHERE region LIKE '%${parms.region}%' AND  login_time BETWEEN '${parms.s_start_date + ' 00:00:00'}'
      AND '${parms.s_end_date + ' 23:59:59'}'  ${s_platform_id})) as percentage, region,count(region) as no_region from user_login_hall WHERE region LIKE '%${parms.region}%' 
      AND  login_time BETWEEN '${parms.s_start_date + ' 00:00:00'}' AND '${parms.s_end_date + ' 23:59:59'}' ${s_platform_id}
      group by region`;
    if (parms.page && parms.limit) {
      sql += ` LIMIT ${(parms.page - 1) * parms.limit},${parms.limit}`;
    }
    const sql0 = `select count(distinct region) as count from user_login_hall where region LIKE '%${parms.region}%' AND  login_time BETWEEN '${parms.s_start_date + ' 00:00:00'}' AND '${parms.s_end_date + ' 23:59:59'}' ${s_platform_id} `;
    data.count = await this.app.model.query(sql0, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    data.rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return data;
  }
  // 查询导出数据
  async getExportFile(parms) {
    const s_platform_id = parms.platform_id != 0 ? 'AND platform_id = ' + parms.platform_id : '';
    const sql = `select (Count(region)* 100 / (Select Count(*) From user_login_hall WHERE region LIKE '%${parms.region}%' AND  login_time BETWEEN '${parms.s_start_date + ' 00:00:00'}' AND '${parms.s_end_date + ' 23:59:59'}' ${s_platform_id})) as percentage, region,count(region) as no_region from user_login_hall WHERE region LIKE '%${parms.region}%' AND  login_time BETWEEN '${parms.s_start_date + ' 00:00:00'}' AND '${parms.s_end_date + ' 23:59:59'}' ${s_platform_id}
          group by region`;
    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const template = [
      [ '登录地区', '数量', '占比%' ],
    ];
    for (const row of rows) {
      const region = row.region;
      const no_region = row.no_region;
      const percentage = row.percentage;
      const filed = [ region, no_region, percentage ];
      template.push(filed);
    }
    return template;
  }
  // 查询用户登录列表
  async getuserLoginList(region, page, limit, s_start_date, s_end_date, platform_id) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      region,
      login_time: { [Op.between]: [ s_start_date + ' 00:00:00', s_end_date + ' 23:59:59' ] },
    };
    if (platform_id != '0') {
      where.platform_id = platform_id;
    }
    console.log(where);
    const data = await this.ctx.model.UserLoginHall.findAndCountAll({

      where,
      include: [{
        model: this.ctx.model.UserAccount,
        attributes: [ 'createdate' ],
      }],
      offset: (page - 1) * parseInt(limit), // 每页起始位置
      limit: parseInt(limit),
    });
    return data;
  }
  async getRetainInfo(start_time, end_time, platform_id) {
    let extra = '';
    if (platform_id) extra = ` where uh.platform_id = ${platform_id}`;
    const sql = `SELECT
            first_day,
            sum(case when by_day = 0 then 1 else 0 end) day_0,
            sum(case when by_day = 1 then 1 else 0 end) day_1,
            sum(case when by_day = 2 then 1 else 0 end) day_2,
            sum(case when by_day = 3 then 1 else 0 end) day_3,
            sum(case when by_day = 4 then 1 else 0 end) day_4,
            sum(case when by_day = 5 then 1 else 0 end) day_5,
            sum(case when by_day = 6 then 1 else 0 end) day_6,
            sum(case when by_day = 7 then 1 else 0 end) day_7,
            sum(case when by_day = 15 then 1 else 0 end) day_15,
            sum(case when by_day = 30 then 1 else 0 end) day_30,
            sum(case when by_day > 30 then 1 else 0 end) day_30plus
        FROM
            (
                SELECT
                    user_id,
                    login_time,
                    first_day,
                    DATEDIFF(login_time, first_day) AS by_day
                FROM
                    (
                        SELECT
                            b.user_id,
                            b.login_time,
                            c.first_day
                        FROM
                            (
                                SELECT
                                    user_id,
                                    DATE_FORMAT(login_time, '%Y-%m-%d') login_time
                                FROM
                                    user_login_hall  as uh INNER JOIN user_account u on uh.user_id = u.id and u.is_upper_score = 1
                                ${extra}
                                GROUP BY
                                    1,
                                    2
                            ) b
                        LEFT JOIN (
                            SELECT
                                user_id,
                                min(login_time) AS first_day
                            FROM
                                (
                                    SELECT
                                        user_id,
                                        DATE_FORMAT(login_time, '%Y-%m-%d') login_time
                                    FROM
                                        user_login_hall  as uh INNER JOIN user_account u on uh.user_id = u.id and u.is_upper_score = 1
                                        ${extra}    
                                    GROUP BY
                                        1,
                                        2
                                ) a
                            GROUP BY
                                1
                        ) c ON b.user_id = c.user_id
                        ORDER BY
                            1,
                            2
                    ) e
                ORDER BY
                    1,
                    2
            ) f
            where f.first_day >= '${start_time}' and f.first_day <= '${end_time}'
        group by
            1
        order by 1`;
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });

  }


  async getRetainTotal(platform_id) {
    const date = moment().format('YYYY-MM-DD') + ' 00:00:00';
    let sql = `SELECT
            count(
              DISTINCT (user_login_hall.user_id)
            ) AS login_count
          FROM
            user_login_hall
          LEFT JOIN user_account ON user_login_hall.user_id = user_account.id
          WHERE login_time >= '${date}'
          AND user_account.createdate < '${date}'`;

    let sql_total = `select count(*) as total from user_account where is_upper_score = 1 and createdate<'${date}'`;
    if (platform_id) {
      sql += ` and user_login_hall.platform_id = ${platform_id}`;
      sql_total += ` and platform_id = ${platform_id}`;
    }
    const [ row1, row2 ] = await Promise.all([
      this.app.model.query(sql, { // 计算总登录人数
        type: this.app.Sequelize.QueryTypes.SELECT,
      }),
      this.app.model.query(sql_total, { // 会员总人数
        type: this.app.Sequelize.QueryTypes.SELECT,
      }),
    ]);
    const rate = ((row2[0].total != 0 ? row1[0].login_count / row2[0].total : 0) * 100).toFixed(2);
    return rate;
  }

  /**
   * 获取每天登录人数
   * @param {*} start_date
   * @param {*} end_date
   * @param {*} platformId
   */
  async getDateLogin(start_date, end_date, platformId) {
    if (start_date.length == 10) {
      start_date = start_date + ' 00:00:00';
    }
    if (end_date.length == 10) {
      end_date = end_date + ' 23:59:59';
    }
    let sqlwhere = '';
    if (platformId) {
      sqlwhere = `and uh.platform_id = ${platformId}`;
    }

    const sql = `
    SELECT
        DATE_FORMAT(uh.login_time, '%Y-%m-%d') login_time,
        count(DISTINCT(uh.user_id)) AS login_count
      FROM
        user_login_hall as uh INNER JOIN user_account u on uh.user_id = u.id and u.is_upper_score = 1
      WHERE
        uh.login_time >= '${start_date}'
      AND uh.login_time <= '${end_date}' ${sqlwhere}
      GROUP BY
        DATE_FORMAT(uh.login_time, '%Y-%m-%d')`;

    const data = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return data.reduce(function(result, item, index, array) { // 将数组转为对象
      result[item.login_time] = item.login_count;
      return result;
    }, {});
  }

  // /**
  //  * 获取每日投注人数
  //  * @param {*} start_date
  //  * @param {*} end_date
  //  */
  // async getDateBetnumber(start_date, end_date, platformId) {
  //   if (start_date.length == 10) {
  //     start_date = start_date + ' 00:00:00';
  //   }
  //   if (end_date.length == 10) {
  //     end_date = end_date + ' 00:00:00';
  //   }
  //   let sqlwhere = '';
  //   if (platformId) {
  //     sqlwhere = `and platform = ${platformId}`;
  //   }

  //   const sql = `SELECT
  //     DATE_FORMAT(create_time, '%Y-%m-%d') create_time,
  //       SUM(bet_number) AS bet_number
  //     FROM
  //       platform_data
  //     WHERE
  //       create_time >= '${start_date}'
  //     AND create_time <= '${end_date}' ${sqlwhere}

  //     GROUP BY
  //       create_time`;

  //   const data = await this.app.model.query(sql, {
  //     type: this.app.Sequelize.QueryTypes.SELECT,
  //   });
  //   return data.reduce(function(result, item, index, array) { // 将数组转为对象
  //     result[item.create_time] = item.bet_number; // a, b, c
  //     return result;
  //   }, {});
  // }


  /**
   * 获取今日登录
   * @param {*} platform_id
   */
  async getTodayLogin(platform_id) {
    const date = moment().format('YYYY-MM-DD') + ' 00:00:00';
    let sql = `SELECT
      count( DISTINCT ( user_login_hall.user_id ) ) AS login_count
    FROM
      user_login_hall
      INNER JOIN user_account u ON user_login_hall.user_id = u.id 
      AND u.is_upper_score = 1
    WHERE
      login_time >= '${date}'`;
    if (platform_id) {
      sql += ` and user_login_hall.platform_id = ${platform_id}`;
    }
    const todayLogin = await this.app.model.query(sql, { // 今日登录人数
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return todayLogin[0].login_count;
  }

  /**
  * 添加登录记录
  * @param {*} params
  * @param {*} ip
  */
  async create(params, ip) {
    const ip1 = ip ? qqwry.searchIP(ip) : { Country: '' }; // 根据ip查询所在区域
    return await this.ctx.model.UserLoginHall.create({
      user_id: params.id,
      username: params.username,
      platform_id: params.platform_id,
      ip,
      region: ip1.Country || '',
      login_time: new Date(),
    });
  }

  /**
   * 用户退出更新退出时间
   * @param {*} username
   */
  async updateUserLogout(username) {
    return await this.ctx.model.UserLoginHall.update({
      logout_time: new Date(),
    }, {
      where: {
        username,
      },
      order: [[ 'login_time', 'DESC' ]],
    });
  }

  /**
   *查询时间段内登录数量
   * @param {*} start
   * @param {*} end
   */
  async findUserLoginCountByDate(platform_id, start, end) {
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      login_time: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    };
    if (platform_id) {
      where.platform_id = platform_id;
    }
    return await this.ctx.model.UserLoginHall.count({
      where,
      group: 'user_id',
    });
  }
}

module.exports = UserLoginHallService;
