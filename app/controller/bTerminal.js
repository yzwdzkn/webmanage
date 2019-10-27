'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;

class BterminalController extends Controller {
  async agentOrderStatistic() {
    const { agent_id, start_time, end_time, page, limit, platform_id } = this.ctx.request.query;
    console.log('this.ctx.request.query: ', this.ctx.request.query);
    const { rows, count } = await this.ctx.service.dataStatistics.agentData.getAgentStatisticData(platform_id, agent_id, start_time, end_time, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: rows,
      count,
      status: 0,
      code: 0,
    };
  }
}

module.exports = BterminalController;
