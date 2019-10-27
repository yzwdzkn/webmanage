'use strict';

const Service = require('egg').Service;
const { AGENT, ADMIN, DEFAULT_PASSWORD } = require('../tools/constant');
const md5 = require('md5');
class AgentService extends Service {
/**
 * 分页查询代理账户信息
 * @param {string} params 页数
 * @param {number} page 页数
 * @param {number} limit 每页个数
 */

  async getAgentList(params, page, limit = 10) {
    const Sequelize = this.ctx.model.Sequelize;
    const { rows, count } = await this.ctx.model.AgentAccount.findAndCountAll({
      where: params,
      offset: (parseInt(page) - 1) * parseInt(limit), // 每页起始位置
      limit: parseInt(limit),
      attributes: Object.keys(this.ctx.model.AgentAccount.rawAttributes).concat([
        [
          Sequelize.literal('(select count(user_account.agent_id) from user_account where agent_account.id = user_account.agent_id)'),
          'vip_count',
        ],
      ]),
      subQuery: false, // 不让在子查询里分页，全局处理,
    });
    return { data: rows, count };
  }

  /**
   * 创建代理账户
   * @param {*} params 传参
   */
  async creataAccount(params) {
    const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      const result = await this.ctx.model.AgentAccount.create({
        username: params.username,
        nickname: params.nickname,
        password: params.password,
        bonus_type: params.bonus_type,
        bonus_percent: params.bonus_percent,
        bonus_period: params.bonus_period,
        bonus_date: params.bonus_date,
        coin_type: params.coin_type,
        status: params.status,
        create_time: new Date(),
      }, { transaction });
      await this.service.accountMap.add(result.id, result.username, AGENT.en, transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      throw new Error(error.original.errno);
    }
  }

  /**
   * 根据id获取制定代理账户
   * @param {*} id
   */
  async getTheAgentAccount(id) {
    console.log(id);
    return await this.ctx.model.AgentAccount.findOne({
      where: { id },
    });
  }

  /**
   * 修改代理账户
   * @param {*} params
   * @param {*} id
   */

  async editTheAgentAccount(params, id) {
    const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      await this.ctx.model.AgentAccount.update(params, { where: { id } }, { transaction });
      await this.service.accountMap.update(params.username, id, AGENT.en, transaction);
      await transaction.commit();
      return;
    } catch (error) {
      await transaction.rollback();
      console.log('error.original.errno: ', error);
      throw new Error(error.original.errno);
    }
  }

  /**
   * 删除代理账户
   * @param {*} id
   */
  async deleteTheAgentAccount(id) {
    const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      await this.ctx.model.AgentAccount.destroy({ where: { id } }, { transaction });
      await this.service.accountMap.delete(id, AGENT.en, transaction);
      await transaction.commit();
      return;
    } catch (error) {
      await transaction.rollback();
      console.log('error.original.errno: ', error);
      throw new Error(error.original.errno);
    }
  }

  /**
   * 根据代理名称查询
   * @param {*} username
   */
  async findAgentByUsername(username) {
    return await this.ctx.model.AgentAccount.findOne({
      where: { username },
    });
  }

  /**
   * 根据账户类型获取代理账户列表
   * @param {*} account_type 账户类型 admin or agent
   * @param {*} id
   */
  async getAgentInfo(account_type, id) {
    if (account_type === ADMIN) {
      return await this.ctx.model.AgentAccount.findAll({});
    }
    return await this.ctx.model.AgentAccount.findAll({
      where: { id },
    });
  }

  /**
   * 根据状态查询代理列表
   * @param {*} status
   */
  async findAgentByStatus(status) {
    return await this.ctx.model.AgentAccount.findAll({
      where: {
        status,
      },
    });
  }

  /**
   * 代理账户密码重置
   * @param {*} id
   * @param {*} password
   */
  async resetPassword(id, password = md5(DEFAULT_PASSWORD)) {
    const params = { password };
    return await this.ctx.model.AgentAccount.update(params, { where: { id } });
  }

  /**
   * 根据id获取代理
   * @param {*} id 代理id
   */
  async findById(id) {
    return await this.ctx.model.AgentAccount.findOne({
      where: {
        id,
      },
    });
  }

  /**
  * 保存代理授权菜单
  * @param {*} id 代理id
  * @param {*} menuIds 菜单集合
  */
  async saveMenu(id, menuIds) {
    return await this.ctx.model.AgentAccount.update({
      menu_ids: menuIds,
    }, {
      where: {
        id,
      },
    });
  }

  /**
   * 修改登录时间
   * @param {*} id
   */
  async updateLastLoginTime(id) {
    return await this.ctx.model.AgentAccount.update({
      last_login_time: new Date(),
    }, {
      where: {
        id,
      },
    });
  }

  async changeAgentStatus(date, agent_id, rate, platform_id) {
    const where = {
      create_time: date + ' 00:00:00',
      platform_id,
      agent_id: Number(agent_id),
    };
    await this.ctx.model.AgentData.update(
      { status: 1, rate },
      {
        where,
      }
    );
  }
}
module.exports = AgentService;
