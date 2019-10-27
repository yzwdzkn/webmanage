/* eslint-disable jsdoc/require-param */
'use strict';

const Service = require('egg').Service;

class PlatformOrderService extends Service {

  /**
     * 查询平台账户列表
     */
  async findList(platform_id, order_state, order_id, type, start_date, end_date, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {};
    // const date = order_time.split(',');
    // if (one_day !== '汇总' && one_day !== 'huizong') {
    //   where.order_time = {
    //     [Op.between]: [ one_day + ' 00:00:00', one_day + ' 23:59:59' ],
    //   };
    // } else {
    //   where.order_time = {
    //     [Op.between]: [ date[0] + ' 00:00:00', date[1] + ' 23:59:59' ],
    //   };
    // }

    where.order_time = {
      [Op.between]: [ start_date, end_date ],
    };
    if (platform_id !== '-1' && platform_id !== '') {
      where.platform_id = platform_id;
    }

    if (order_id !== '') {
      where.order_id = order_id;
    }
    if (order_state !== '0') {
      where.order_state = order_state;
    }
    if (type !== '-1') {
      where.type = type;
    }
    if (page && limit) {
      return await this.ctx.model.PlatformOrder.findAndCountAll({
        where,
        offset: (page - 1) * limit, // 每页起始位置
        order: [[ 'order_time', 'desc' ]],
        limit,
        include: [{
          model: this.ctx.model.PlatformInfo,
          attributes: [ 'platform_name' ],
        }],
      });
    }
    return await this.ctx.model.PlatformOrder.findAll({
      where,
      order: [[ 'order_time', 'desc' ]],
      include: [{
        model: this.ctx.model.PlatformInfo,
        attributes: [ 'platform_name' ],
      }],
    });
  }

  /**
   * 添加平台上下分订单记录
   * @param {*} platform_id 平台ID
   * @param {*} pre_score 上下分之前的金额
   * @param {*} add_score 要上下分的金额
   * @param {*} current_score 上下分之后的金额
   * @param {*} type 订单类型 0 会员上分 1 会员下分 2 后台上分 3.后台下分,4 平台下分失败 ,5 平台上分失败，6 回滚平台分数失败，7 回滚平台分数成功
   * @param {*} order_state 处理状态：1 处理中 2 处理完成
   * @param {*} ip 该上下分操作的IP地址
   */
  async savePlatfromOrder(platform_id, pre_score, add_score, current_score, type, order_state, ip, create_operator, order_id, remark = '') {
    // 订单规则: 平台id + 当前时间年月日时分秒毫秒 ;
    order_id = order_id ? order_id : `HT${platform_id}${Date.now()}`;
    return await this.ctx.model.PlatformOrder.create({
      order_id,
      platform_id,
      pre_score,
      add_score,
      current_score,
      type,
      order_state,
      ip: ip ? ip : '-',
      order_time: new Date(),
      create_operator,
      remark,
    });
  }

  /**
   * 修改平台订单状态
   * @param {*} order_id
   * @param {*} platform_id
   * @param {*} order_state 处理状态：1 处理中 2 处理完成
   */
  async updatePlatfromOrderState(order_id, platform_id, order_state) {
    return await this.ctx.model.PlatformOrder.update({
      order_state,
    }, {
      where: {
        order_id,
        platform_id,
      },
    });
  }

  async findTotalList(start_date, end_date, platform_id, page, limit) {
    let sql = '';
    let countSql = sql;
    if (platform_id !== '') {
      sql = `SELECT DATE(order_time) as date, po.platform_id,
     (SELECT pre_score FROM platform_order WHERE order_id = (SELECT order_id FROM platform_order WHERE order_time = MIN(po.order_time) and platform_id = po.platform_id order by order_time asc limit 1)) as pre,
     (SELECT current_score FROM platform_order WHERE order_id = (SELECT order_id FROM platform_order WHERE order_time = MAX(po.order_time) and platform_id = po.platform_id order by order_time desc limit 1)) as current,
     b.*, c.rate as platRate, c.platform_name
     FROM platform_order po 
     LEFT JOIN platform_data b on po.platform_id = b.platform and DATE(po.order_time) = b.create_time 
     LEFT JOIN platform_info c on po.platform_id = c.platform_id
     where po.order_time between '${start_date}' and '${end_date} 23:59:59' and po.platform_id = ${platform_id} GROUP BY DATE(po.order_time),po.platform_id ORDER BY order_time`;
      countSql = `select count(order_id) from platform_order where order_time between '${start_date}' and '${end_date} 23:59:59' and  platform_id = ${platform_id} GROUP BY DATE(order_time),platform_id ORDER BY order_time;`;
    } else {
      sql = `SELECT DATE(order_time) as date, po.platform_id,
      (SELECT pre_score FROM platform_order WHERE order_id = (SELECT order_id FROM platform_order WHERE order_time = MIN(po.order_time) and platform_id = po.platform_id order by order_time asc limit 1)) as pre,
      (SELECT current_score FROM platform_order WHERE order_id = (SELECT order_id FROM platform_order WHERE order_time = MAX(po.order_time) and platform_id = po.platform_id order by order_time desc limit 1)) as current,
      b.*, c.rate as platRate, c.platform_name
      FROM platform_order po 
      LEFT JOIN platform_data b on po.platform_id = b.platform and DATE(po.order_time) = b.create_time 
      LEFT JOIN platform_info c on po.platform_id = c.platform_id
      where po.order_time between '${start_date}' and '${end_date} 23:59:59' GROUP BY DATE(po.order_time),po.platform_id ORDER BY po.order_time`;
      countSql = `select count(order_id) as count from platform_order where order_time between '${start_date}' and '${end_date} 23:59:59' GROUP BY DATE(order_time),platform_id ORDER BY order_time;`;
    }
    if (page && limit) {
      sql += ` limit ${(page - 1) * limit}, ${limit}`;
      let rows = this.ctx.model.query(sql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
      let count = this.ctx.model.query(countSql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
      [ rows, count ] = await Promise.all([ rows, count ]);
      return {
        count: count && count.length || 0,
        rows: rows || [],
      };
    }
    const res = await this.ctx.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return res;
  }

  /**
   * 平台报表数据
   * @param {*} platform_id dq
   */
  async listReport(platform_id) {
    return await this.ctx.model.PlatformData.findAll({
      where: {
        platform: platform_id,
        status: 0,
      },
      order: [[ 'create_time', 'desc' ]],
      include: [
        {
          model: this.ctx.model.PlatformInfo,
          attributes: [[ 'rate', 'platform_rate' ]],
          where: {
            cooperation_type: 0,
          },
        },
      ],
    });
  }

  async findAgentList(start_date, end_date, platform_id, agent) {
    let insert = '';
    if (platform_id !== '') {
      insert = ` and platform_id = ${platform_id}`;
    }
    const sql = `SELECT win_gold,lost_gold,deduct_gold,DATE(create_time) as date,agent_id,rate,settlement,status from agent_data 
     where create_time between '${start_date}' and '${end_date} 23:59:59' ${insert} and agent_id in (${agent})
     GROUP BY DATE(create_time),agent_id ORDER BY FORMAT(create_time,'Y%-%M-%D')`;
    const res = await this.ctx.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return res;
  }

  // 平台账变统计 header
  async getMoneyChange(start_date, end_date, platform_id) {
    let where = `where order_time between '${start_date}' and '${end_date} 23:59:59'`;
    if (platform_id !== '' && platform_id !== undefined && platform_id != null) {
      where += ` and platform_id = ${platform_id} `;
    }
    const sql = `SELECT platform_id, 
    (SELECT pre_score FROM platform_order WHERE order_time = MIN(po.order_time) order by order_time asc limit 1) as pre,
    (SELECT current_score  FROM platform_order WHERE order_time = MAX(po.order_time) order by order_time desc limit 1) as current
    FROM platform_order po ${where} ORDER BY order_time`;
    const res = await this.ctx.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return res;
  }

}


module.exports = PlatformOrderService;
