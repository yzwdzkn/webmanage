'use strict';

const Service = require('egg').Service;
class totalDataService extends Service {
  async registerNum(limit, platformId, startTime, endTime) {
    let where = '';
    if (platformId) {
      where += `and platform_id = ${platformId}`;
    }
    if (startTime) {
      where += ` and createdate >= ${startTime}`;
    }
    if (endTime) {
      where += ` and createdate <= ${endTime}`;
    }
    const sql = `SELECT count(*) as total,createdate FROM user_account WHERE DATEDIFF(NOW(), createdate) < ${limit + 1} ${where} GROUP BY createdate ;`;
    const res = await this.ctx.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return res;
  }
}

module.exports = totalDataService;
