'use strict';

const Service = require('egg').Service;
const moment = require('moment');
class UserAgentSettlementService extends Service {
  // 查找查询会员业绩明细
  async getList(params) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    let date = moment();
    if (params.s_end_date != '') {
      date = moment(params.s_end_date).format('YYYY-MM-DD');
    } else {
      date = moment().format('YYYY-MM-DD');
    }
    console.log(date, '------------------');
    const where = {};
    if (params.s_uid != '') {
      where.id = {
        [Op.like]: '%' + params.s_uid + '%',
      };
    }
    if (params.s_pid != '') {
      where.pid = {
        [Op.like]: '%' + params.s_pid + '%',
      };
    }
    if (params.s_end_date != '') {
      where.createdate = {
        [Op.lt]: date + ' 23:59:59',
      };
    }
    if (params.s_agent_id != 0) {
      where.agent_id = params.s_agent_id;
    }
    return await this.ctx.model.UserAccount.findAndCountAll({
      where,
      order: [[ 'id', 'ASC' ]],
      group: 'user_account.id',
      // distinct: true,
      offset: (parseInt(params.page) - 1) * parseInt(params.limit), // 每页起始位置
      limit: parseInt(params.limit),
      include: [
        {
          model: this.ctx.model.Orders,
          attributes: [
            [ Sequelize.literal(`(SELECT SUM(score) count FROM orders o where user_account.id = o.user_id and type in (-2,-4,-6,-7,-8) and update_time < '${date} 23:59:59')`), 'cash_amount' ],
            [ Sequelize.literal(`(SELECT SUM(score) count FROM orders o where user_account.id = o.user_id and type in (2,4,6,7,8,9,11,12) and update_time < '${date} 23:59:59')`), 'deposited_amount' ],
            [ Sequelize.literal(`(SELECT SUM(service_charge) FROM orders o where user_account.id = o.user_id and type in (-2,-4,-6,-7,-8) and update_time < '${date} 23:59:59')`), 'cash_charge' ],
            [ Sequelize.literal(`(SELECT SUM(score) FROM orders o where user_account.id = o.user_id and type = 0 and update_time < '${date} 23:59:59')`), 'win_amount' ],
            [ Sequelize.literal(`(SELECT SUM(score) FROM orders o where user_account.id = o.user_id and type = 1 and update_time < '${date} 23:59:59')`), 'lose_amount' ],
          ],
        },
      ],
      attributes: Object.keys(this.ctx.model.UserAccount.rawAttributes).concat([
        [
          Sequelize.literal('(SELECT count(*) count FROM user_account u where user_account.id = u.pid)'),
          'user_count',
        ],
        [
          Sequelize.literal(`(SELECT count(*) count FROM user_account u where user_account.id = u.pid and createdate  between '${date} 00:00:00' and '${date} 23:59:59')`),
          'new_user',
        ]]),
      // subQuery: false, // 不让在子查询里分页，全局处理
    });
  }
  async getUserInfo(params) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    let date = moment();
    if (params.s_end_date != '') {
      date = moment(params.s_end_date).format('YYYY-MM-DD');
    } else {
      date = moment().format('YYYY-MM-DD');
    }
    const where = {
      id: params.id,
    };
    if (params.s_end_date != '') {
      where.createdate = {
        [Op.lt]: date + ' 23:59:59',
      };
    }
    if (params.s_agent_id != 0) {
      where.agent_id = params.s_agent_id;
    }
    return await this.ctx.model.UserAccount.findAndCountAll({
      where,
      include: [
        {
          model: this.ctx.model.Orders,
          attributes: [
            [ Sequelize.literal(`(SELECT SUM(score) count FROM orders o where user_account.id = o.user_id and type in (-2,-4,-6,-7,-8) and update_time < '${date} 23:59:59')`), 'cash_amount' ],
            [ Sequelize.literal(`(SELECT SUM(score) count FROM orders o where user_account.id = o.user_id and type in (2,4,6,7,8,9,11,12) and update_time < '${date} 23:59:59')`), 'deposited_amount' ],
            [ Sequelize.literal(`(SELECT COUNT(score) FROM orders o where user_account.id = o.user_id and type in (-2,-4,-6,-7,-8) and update_time < '${date} 23:59:59')`), 'cash_num' ],
            [ Sequelize.literal(`(SELECT COUNT(score) FROM orders o where user_account.id = o.user_id and type in (2,4,6,7,8,9,11,12) and update_time < '${date} 23:59:59')`), 'deposited_num' ],
          ],
        },
        {
          model: this.ctx.model.PlayerData,
          as: 'PlayerData',
          distinct: true,
          attributes: [
            [ Sequelize.literal(`(SELECT SUM(valid_bet) FROM  player_data o where  username = '${params.username}' and update_time < '${date} 23:59:59')`), 'valid_bet' ],
          ],
          required: false,
        },
        {
          model: this.ctx.model.UserLoginHall,
          distinct: true,
          attributes: [
            [ Sequelize.literal(`(SELECT ip FROM  user_login_hall o where user_id = '${params.id}' and lastlogintime = '${params.lastlogintime}' limit 1)`), 'ip' ],
            [ Sequelize.literal(`(SELECT region FROM  user_login_hall o where user_id = '${params.id}' and  lastlogintime = '${params.lastlogintime}' limit 1)`), 'region' ],
          ],
          required: false,
        },
      ],
      attributes: Object.keys(this.ctx.model.UserAccount.rawAttributes).concat([
        [
          Sequelize.literal('(SELECT username FROM user_account u where u.id = user_account.pid)'),
          'pusername',
        ]]),
    });
  }
}
module.exports = UserAgentSettlementService;
