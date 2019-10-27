'use strict';

const { Service } = require('egg');

/**
 * 玩家监控service
 */
class UserMonitorService extends Service {

  /**
   * 查询玩家监控值
   * @param {*} id id
   */
  async findById(id) {
    return await this.ctx.model.UserMonitor.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * 保存监控数据
   * @param {*} params
   */
  async save(params) {
    return await this.ctx.model.UserMonitor.findOrCreate({
      where: {
        id: params.id,
      },
      defaults: {
        id: params.id,
        kill_number_gt: params.kill_number_gt,
        kill_number_lt: params.kill_number_lt,
        today_kill_number_gt: params.today_kill_number_gt,
        today_kill_number_lt: params.today_kill_number_lt,
        bet_count: params.bet_count,
        today_bet_count: params.today_bet_count,
        h_kill_number_gt: params.h_kill_number_gt,
        h_kill_number_lt: params.h_kill_number_lt,
        h_today_kill_number_gt: params.h_today_kill_number_gt,
        h_today_kill_number_lt: params.h_today_kill_number_lt,
        h_bet_count: params.h_bet_count,
        h_today_bet_count: params.h_today_bet_count,
      },
    }).spread(async (data, created) => {
      if (created === false) {
        return await this.ctx.model.UserMonitor.update(
          {
            kill_number_gt: params.kill_number_gt,
            kill_number_lt: params.kill_number_lt,
            today_kill_number_gt: params.today_kill_number_gt,
            today_kill_number_lt: params.today_kill_number_lt,
            bet_count: params.bet_count,
            today_bet_count: params.today_bet_count,
            h_kill_number_gt: params.h_kill_number_gt,
            h_kill_number_lt: params.h_kill_number_lt,
            h_today_kill_number_gt: params.h_today_kill_number_gt,
            h_today_kill_number_lt: params.h_today_kill_number_lt,
            h_bet_count: params.h_bet_count,
            h_today_bet_count: params.h_today_bet_count,
          },
          {
            where: {
              id: params.id,
            },
          }
        );
      }
      return data;
    });
  }
}

module.exports = UserMonitorService;
