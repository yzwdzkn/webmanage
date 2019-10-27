/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
class OrdersService extends Service {

  /**
   * 保存会员每局游戏金额变动详情
   * @param {*} record
   * @param {*} gameId
   * @param {*} sn
   */
  async saveUserGameOrder(record, gameId, sn) {
    // console.log('添加游戏对局订单：', record);
    const user = await this.service.user.findByPlatformAndUsername(record.platformId || 0, record.name);
    let userRedis = await this.app.redis.hget('userMoneyAll', `${record.name}@${record.platformId}`) || '{}';
    userRedis = JSON.parse(userRedis);
    if (user) {
      const win = record.win - record.deduct; // 输赢钱
      const current_score = (userRedis.currentMoney || 0) + win; // 账单后的金额
      const data = {
        order_id: `${user.id}${Date.now()}`,
        user_id: user.id,
        agent_id: user.agent_id,
        platform_id: user.platform_id,
        pre_score: parseInt(sn) < parseInt(userRedis.sn) ? 0 : (userRedis.currentMoney || 0),
        score: Math.abs(win),
        deduct: record.deduct,
        current_score: parseInt(sn) < parseInt(userRedis.sn) ? 0 : current_score,
        service_charge: record.deduct,
        type: win >= 0 ? 2 : -2,
        game_id: gameId,
        ip: '-',
        status: 0,
        create_operator: `牌局编号：${record.gameNo}`,
      };

      const addResult = await this.create(data);

      await this.service.api.platform.updateRedisUserMoney({
        username: user.username,
        platform_id: record.platformId,
        usernameCurMoney: data.current_score,
      });

      // await this.service.dataStatistics.userData.saveUserData(params);
      return addResult;
    }
  }

  /**
   * 添加订单
   * @param {*} params
   */
  async create(params) {
    await this.app.redis.lpush('MQ:order', JSON.stringify(params));
    // return await this.ctx.model.Orders.create({
    //   order_id: params.order_id,
    //   user_id: params.user_id,
    //   agent_id: params.agent_id,
    //   pre_score: params.pre_score,
    //   score: params.score,
    //   current_score: params.current_score,
    //   type: params.type,
    //   game_id: params.game_id,
    //   platform_id: params.platform_id,
    //   ip: params.ip,
    //   status: params.status,
    //   create_time: new Date(),
    //   update_time: new Date(),
    //   create_operator: params.create_operator,
    // });
  }
  // 查询会员账单
  async findList(params) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {};
    const userAccountWhere = {};
    const platWhere = {};// 用于连表查询搜索平台下面的用户
    if (params.start_time == '') {
      params.start_time = moment(new Date()).format('YYYY-MM-DD');
    }
    if (params.end_time == '') {
      params.end_time = moment(new Date()).format('YYYY-MM-DD');
    }
    if (params.order_id) {
      where.order_id = {
        [Op.like]: '%' + params.order_id + '%',
      };
    }
    if (params.order_state != '0') {
      where.order_state = params.order_state;
    }
    if (params.username) { // 会员
      if (params.match) { // dq 10-15
        userAccountWhere.username = params.username;
      } else {
        userAccountWhere.username = {
          [Op.like]: '%' + params.username + '%',
        };
      }
    }
    if (params.platform_id != '0') { // 平台
      where.platform_id = params.platform_id;
    }
    if (params.type != '0') { // 类型
      where.type = params.type;
    }
    if (params.status != '-2') { // 类型
      where.status = params.status;
    }
    if (params.start_time && params.end_time) { // 创建时间
      where.create_time = {
        [Op.between]: [ params.start_time + ' 00:00:00', params.end_time + ' 23:59:59' ],
      };
    }
    // if (params.e_platform_id) { // 平台
    //   where.platform_id = params.e_platform_id;
    // }
    // if (params.e_platform_name) {
    //   platWhere.platform_name = {
    //     [Op.like]: [ '%' + params.e_platform_name + '%' ],
    //   };
    // }
    if (params.page && params.limit) {
      return await this.ctx.model.Orders.findAndCountAll({
        where,
        offset: (parseInt(params.page) - 1) * parseInt(params.limit), // 每页起始位置
        limit: parseInt(params.limit),
        order: [[ 'create_time', 'DESC' ]],
        include: [
          {
            model: this.ctx.model.UserAccount,
            where: userAccountWhere,
            attributes: [ 'username' ],
          },
          {
            model: this.ctx.model.GameInfo,
            attributes: [ 'game_id', 'game_name' ],
          },
          {
            model: this.ctx.model.PlatformInfo,
            where: platWhere,
            attributes: [ 'platform_id', 'platform_name' ],
          },
        ],
      });
    }
    return await this.ctx.model.Orders.findAll({
      where,
      order: [[ 'create_time', 'DESC' ]],
      include: [
        {
          model: this.ctx.model.UserAccount,
          where: userAccountWhere,
          attributes: [ 'username' ],
        },
        {
          model: this.ctx.model.GameInfo,
          attributes: [ 'game_id', 'game_name' ],
        },
        {
          model: this.ctx.model.PlatformInfo,
          attributes: [ 'platform_id', 'platform_name' ],
        },
      ],
    });
  }

  /**
   * 查询订单
   * @param {*} order_id
   */
  async findByOrderId(order_id) {
    return await this.ctx.model.Orders.findOne({
      where: {
        order_id,
      },
    });
  }

  /**
   * 根据平台查询订单
   * @param {*} order_id
   * @param {*} platform_id
   */
  async findByOrderIdAndPlatformId(order_id, platform_id) {
    return await this.ctx.model.Orders.findOne({
      where: {
        order_id,
        platform_id,
      },
    });
  }
  /**
   * 根据平台查询收益
   * @param {*} platform_id
   * @param {*} start
   * @param {*} end
   */
  async findByDateAndPlatformId(platform_id, start, end) {
    const Op = this.ctx.model.Sequelize.Op;
    const Sequelize = this.ctx.model.Sequelize;
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    const where = {
      create_time: {
        [Op.between]: [ start, end ],
      },
    };
    if (platform_id) {
      where.platform_id = platform_id;
    }

    const data = await this.ctx.model.Orders.findAndCountAll({
      where,
      attributes: [[ Sequelize.fn('SUM', Sequelize.col('score')), 'money' ]],
    });
    return data.rows[0];
  }
  /**
   * 查询活跃玩家
   * @param {*} platform_id
   * @param {*} start
   * @param {*} end
   */
  async findUserLoginCountByDate(platform_id, start, end) {
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      create_time: {
        [Op.between]: [ start, end ],
      },
      type: {
        [Op.in]: [ 2, -2 ],
      },
    };
    if (platform_id) {
      where.platform_id = platform_id;
    }
    // const Sequelize = this.ctx.model.Sequelize;
    const data = await this.ctx.model.Orders.findAndCountAll({
      where,
      attributes: [ 'user_id' ],
      group: 'user_id',
    });
    return data.rows;
  }
  /**
   * 添加订单
   * @param {*} order_id 订单号
   * @param {*} username 用户名
   * @param {*} money 分数
   * @param {*} status 状态 0成功 1 失败 2 会员下分失败 3 平台上分失败
   * @param {*} type 0 上分 1 下分
   * @param {*} big_data 订单账变数据
   * @param {*} platform_id 平台id
   * @param {*} create_operator
   * @param {*} ip
   */
  async addOrder(order_id, username, money, status, type, big_data, platform_id, create_operator, ip) {
    const user = await this.service.user.findByPlatformAndUsername(platform_id, username);
    const data = JSON.parse(big_data);
    let user_pre_score = 0;
    if (status == 0) {
      let pre_score = 0;
      if (type == 0) {
        pre_score = data.platformCurMoney + parseInt(money);
        user_pre_score = parseInt(data.usernameCurMoney) - parseInt(money);
      } else {
        pre_score = data.platformCurMoney - parseInt(money);
        user_pre_score = parseInt(data.usernameCurMoney) + parseInt(money);
      }
      // 将订单添加到平台订单数据中
      await this.service.platformOrder.savePlatfromOrder(platform_id, pre_score, money, data.platformCurMoney, type, 2, ip ? ip : '-', create_operator ? this.ctx.session.admin.username : '', order_id);
    }

    // 添加到会员订单里去
    return await this.ctx.model.Orders.create({
      order_id,
      user_id: user.id,
      agent_id: user.agent_id,
      pre_score: user_pre_score,
      score: money,
      current_score: data.usernameCurMoney,
      type: type === 0 ? 1 : -1,
      status,
      platform_id,
      create_time: new Date(),
      create_operator: create_operator ? create_operator : `玩家【${username}】`,
    });
  }

  /**
   * 添加订单
   * @param {*} order_id 订单号
   * @param {*} money 分数
   * @param {*} status 状态 0成功 1 失败 2 会员下分失败 3 平台上分失败
   * @param {*} type 0 上分 1 下分
   * @param {*} data 订单账变数据
   * @param {*} platform_id 平台id
   */
  async addPlatformOrder(order_id, money, status, type, data, platform_id) {
    if (status == 0) {
      let pre_score = 0;
      if (type == 0) { // 上分时： 当前金额 + 操作金额
        pre_score = data.platformCurMoney + parseInt(money);
      } else { // 下分时： 当前金额 - 操作金额
        pre_score = data.platformCurMoney - parseInt(money);
      }
      // 将订单添加到平台订单数据中
      return await this.service.platformOrder.savePlatfromOrder(platform_id, pre_score, money, data.platformCurMoney, type, '-', '', `${order_id}${platform_id}`);
    }
  }

  /**
   * 添加玩家订单
   * @param {*} order_id
   * @param {*} user_id 会员id
   * @param {*} agent_id 代理id
   * @param {*} pre_score 变账之前金额
   * @param {*} moneyScore 操作的金额
   * @param {*} current_score 变账之后的金额
   * @param {*} type 订单类型: 1 游戏上分, -1 游戏下分,  2 游戏赢分,  -2游戏输分 3 现金网上分 ,-3 现金网下分 , 4 代理给会员上分，-4 代理给会员下分
   * @param {*} status 订单状态：-1 处理中 0成功 1 失败 2 会员下分失败 3 平台上分失败
   * @param {*} order_state 订单处理状态：1 订单创建 2 订单完成 3 确定完成
   * @param {*} platform_id 平台id
   */
  async addUserOrder(order_id, user_id, agent_id, pre_score, moneyScore, current_score, type, status, order_state, platform_id) {
    // 添加到会员订单里去
    return await this.ctx.model.Orders.create({
      order_id,
      user_id,
      agent_id,
      pre_score,
      score: moneyScore,
      current_score,
      type,
      status,
      order_state,
      platform_id,
      create_time: new Date(),
      create_operator: '',
    });
  }

  /**
   * 添加玩家订单
   * @param {*} order_id
   * @param {*} platform_id
   * @param {*} pre_score 变账之前金额
   * @param {*} current_score 变账之后的金额
   * @param {*} status 订单状态：-1 处理中 0成功 1 失败 2 会员下分失败 3 平台上分失败 4 平台下分失败
   * @param {*} order_state 订单处理状态：1 订单创建 2 订单完成 3 确定完成
   */
  async updateUserOrder(order_id, platform_id, pre_score, current_score, status, order_state) {
    // 添加到会员订单里去
    return await this.ctx.model.Orders.update(
      {
        pre_score,
        current_score,
        status,
        order_state,
        update_time: new Date(),
      }, {
        where: {
          order_id,
          platform_id,
        },
      });
  }

  /**
   * 更改订单处理状态
   * @param {*} order_id
   * @param {*} platform_id
   * @param {*} order_state
   */
  async updateOrderState(order_id, platform_id, order_state) {
    // 添加到会员订单里去
    return await this.ctx.model.Orders.update(
      {
        order_state,
        update_time: new Date(),
      }, {
        where: {
          order_id,
          platform_id,
        },
      });
  }


  async getOrderList(platform_id, startTime, entTime) {
    const Op = this.ctx.model.Sequelize.Op;
    return await this.app.model.Orders.findAll({
      where: {
        platform_id,
        create_time: {
          [Op.between]: [ startTime, entTime ],
        },
        type: {
          [Op.in]: [ 1, -1 ],
        },
      },
    });
  }

  /**
   * 同步orders 表的数据
   * @param {*} platform_id
   * @param {*} index
   * @param {*} limit
   */
  async syncOrder(platform_id, index, limit) {
    return await this.app.model.Orders.findAll({
      where: {
        platform_id,
      },
      include: [
        {
          model: this.ctx.model.UserAccount,
          attributes: [ 'username' ],
        },
      ],
      order: [[ 'create_time', 'ASC' ]],
      offset: parseInt(index),
      limit: parseInt(limit),
    });
  }

}


module.exports = OrdersService;
