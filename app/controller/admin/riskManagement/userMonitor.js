'use strict';

const Controller = require('egg').Controller;
const { OPERATION_TYPE_UPDATE, USER_MONITOR, SYSTEM } = require('../../../tools/constant');

class UserMonitorController extends Controller {
  async index() {
    const platformInfos = await this.ctx.service.platformInfo.findListByStatus(0);
    const userMonitor = await this.service.userMonitor.findById(1);
    await this.ctx.render('riskManagement/user_monitor', {
      title: '会员监控',
      userMonitor: userMonitor ? JSON.stringify(userMonitor) : '{}',
      platformInfos,
    });
  }


  /**
   * 获取玩家数据列表
   */
  async list() {
    const { username, page, limit, platform_id, userMonitor } = this.ctx.query;
    const data = await this.service.user.findUserMonitor(username, page, limit, platform_id, userMonitor);
    this.ctx.body = {
      data: data.result,
      msg: '',
      count: data.count,
      code: 0,
    };
  }

  /**
   * 获取玩家数据和玩家在线情况
   */
  async findUserDataInfoByPlatform() {
    try {
      const { username, platform_id, page, limit, userMonitor, agent_id, usernames } = this.ctx.request.body;
      const data = await this.service.user.findUserDataInfoByPlatform(username, platform_id, page, limit, userMonitor, agent_id, usernames);
      this.ctx.body = {
        status: 0,
        data,
      };
    } catch (error) {
      this.ctx.body = {
        status: 0,
        data: {},
      };
    }
  }

  /**
  */
  async findUserDataInfoByPlatformAll() {
    try {
      const { usernames, platform_id } = this.ctx.request.body;
      const data = await this.service.user.findUserDataInfoByPlatformAll(usernames, platform_id);
      this.ctx.body = {
        status: 0,
        data,
      };
    } catch (error) {
      this.ctx.body = {
        status: 0,
        data: {},
      };
    }
  }

  /**
   * 保存监控值
   */
  async saveMonitor() {
    const params = this.ctx.request.body;
    params.id = 1;
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, USER_MONITOR);
    await this.service.userMonitor.save(params);
    this.ctx.body = {
      status: 0,
    };
  }

}

module.exports = UserMonitorController;
