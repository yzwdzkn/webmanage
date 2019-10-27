'use strict';

const Service = require('egg').Service;

class userAgentService extends Service {
  // eslint-disable-next-line jsdoc/check-param-names
  /**
     * 分页查询站点账户信息
     * @param {string} params 页数
     * @param {number} page 页数
     * @param {number} limit 每页个数
     */
  async getUserAgentInfo(page, limit) {
    console.log('getUserAgentInfo==============');
    const data = await this.ctx.model.UserAgent.findAndCountAll({
      offset: (page - 1) * limit, // 每页起始位置
      limit,
    });
    console.log(JSON.stringify(data));
    return data;
  }
  // 添加
  async creataAccount(params) {
    // const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      return await this.ctx.model.UserAgent.create({
        // agent_id: params.agent_id,
        level: params.level,
        level_name: params.level_name,
        achievement: params.achievement,
        commission: params.commission,
        create_time: params.create_time,
      });
    } catch (error) {
      // await transaction.rollback();
      console.log(error);
      throw new Error(error.original.errno);
    }
  }
  // 修改
  async editUserLevel(params) {
    try {
      await this.ctx.model.UserAgent.update({
        level: params.level,
        level_name: params.level_name,
        achievement: params.achievement,
        commission: params.commission,
        update_time: params.update_time,

      }, {
        where: {
          id: params.id,
        },
      });
      return;
    } catch (error) {
      console.log('error.original.errno: ', error);
      throw new Error(error.original.errno);
    }
  }

  /**
   * 获取
   */
  async getUserAgentLevel() {
    const rows = await this.ctx.model.UserAgent.findAll(
      { order: [
        [ 'achievement', 'ASC' ],
      ] }
    );
    const obj = {};
    for (const row of rows) {
      obj[row.achievement] = row.commission;
    }
    console.log('getUserAgentLevel', JSON.stringify(obj));
    return obj;
  }
}

module.exports = userAgentService;
