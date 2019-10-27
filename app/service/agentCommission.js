'use strict';

const Service = require('egg').Service;
const { BONUS_TYPE, BONUS_PERIOD, AGENT_COMMISSION_STATUS } = require('../tools/constant');
class AgentCommissionService extends Service {

  /**
   * 代理结算列表
   * @param {*} params
   * @param {*} page
   * @param {*} limit
   */
  async list(params, page, limit) {
    console.log('############################');
    return await this.ctx.model.AgentCommission.findAndCountAll({
      where: params,
      offset: (page - 1) * limit,
      limit,
      include: [{
        model: this.ctx.model.AgentAccount,
        attributes: [ 'id', 'username', 'nickname', 'bonus_type', 'bonus_percent', 'bonus_period', 'coin_type' ],
      }],
    });
  }

  /**
   * 导出功能
   * @param {*} params
   */
  async export(params) {
    const rows = await this.ctx.model.AgentCommission.findAll({
      where: params,
      include: [{
        model: this.ctx.model.AgentAccount,
        attributes: [ 'id', 'username', 'nickname', 'bonus_type', 'bonus_percent', 'bonus_period', 'coin_type' ],
      }],
    });
    const result = [[
      '代理id', '代理账号', '代理名称', '分成类型', '业绩总量', '分成比例', '结算金额', '结算周期', '币种', '结算日期', '状态',
    ]];
    for (const row of rows) {
      const agent_account = row.agent_account;
      const filed = [
        row.agent_id, agent_account.username, agent_account.nickname, BONUS_TYPE[agent_account.bonus_type], row.commission,
        agent_account.bonus_percent + '%', row.settlement_commisson, BONUS_PERIOD[agent_account.bonus_period], agent_account.coin_type,
        row.create_date, AGENT_COMMISSION_STATUS[row.status],
      ];
      result.push(filed);
    }
    return result;
  }

  async changeStatus(id) {
    return await this.ctx.model.AgentCommission.update(
      { status: 1 },
      { where: { id } }
    );
  }
}

module.exports = AgentCommissionService;
