'use strict';

const Service = require('egg').Service;

class AccountUpChangeService extends Service {
  // 查询会员上分账单
  async findUpList(params) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {};
    const where1 = {};// 用于连表查询搜索代理下面的用户
    if (params.order_id) {
      where.order_id = {
        [Op.like]: '%' + params.order_id + '%',
      };
    }
    if (params.user_id) { // 会员id
      where.user_id = {
        [Op.in]: params.user_id.split(',').map(item => +item),
      };
    }
    if (params.agents != '0') { // 代理
      where1.agent_id = params.agents;
    }
    if (params.type != '-1') { // 类型
      where.type = params.type;
    } else {
      where.type = {
        [Op.in]: [ 2, 4, 6, 7, 8, 9, 11, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000 ],
      };
    }
    if (params.status != '-1') { // 状态
      where.status = params.status;
    }
    if (params.start_time && params.end_time) { // 创建时间
      where.create_time = {
        [Op.between]: [ params.start_time, params.end_time ],
      };
    }
    return await this.ctx.model.Orders.findAndCountAll({
      where,
      offset: (parseInt(params.page) - 1) * parseInt(params.limit), // 每页起始位置
      limit: parseInt(params.limit),
      order: [[ 'create_time', 'DESC' ]],
      include: [
        {
          model: this.ctx.model.UserAccount,
          where: where1,
        },
      ],
    });
  }
  async lockOrder(params) {
    return await this.ctx.model.Orders.update({
      lock_type: 1,
      lock_people: params.lock_people,
    }, {
      where: {
        order_id: params.order_id,
      },
    });
  }
}

module.exports = AccountUpChangeService;
