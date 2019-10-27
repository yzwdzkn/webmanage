/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const ErrorManage = require('../../../tools/errorManage');
const { OPERATION_TYPE_CREATE, SYSTEM, USER_AGENT, OPERATION_TYPE_UPDATE } = require('../../../tools/constant');
class AgentManageController extends Controller {


  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('platformManage/user_agent_manage', {
      title: '全民代管理',
      agents,
    });
  }

  // 获取全民代列表
  async list() {
    const params = this.ctx.query;
    console.log(this.ctx.session.admin);
    console.log('this.params: ', params);
    // if (this.ctx.session.admin.type == 2) { // 判断是否是代理
    //   params.agent_id == this.ctx.session.admin.username;
    // }
    const data = await this.service.userAgent.getUserAgentInfo(parseInt(params.page), parseInt(params.limit));
    this.ctx.body = {
      code: '0',
      data: data.rows,
      count: data.count,
    };
  }

  // 添加全民代等级
  async addUserAgent() {
    try {
      const params = this.ctx.request.body;
      console.log(params);
      const result = await this.service.userAgent.creataAccount(params);
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, result, SYSTEM, USER_AGENT);
      this.ctx.body = { data: '', msg: '', code: 0, status: 0 };
    } catch (error) {
      console.log('#################error: ', error);
      this.ctx.body = { data: '', msg: '请输入时不要携带特殊符号和空格', status: '1' };
    }
  }
  // 修改会员等级
  async editUserAgent() {
    try {
      const params = this.ctx.request.body;
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, USER_AGENT);
      await this.service.userAgent.editUserLevel(params);
      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };
    } catch (error) {
      const { msg, status } = ErrorManage.errorMessage(error);
      this.ctx.body = { data: '', msg, status };
    }
  }
}

module.exports = AgentManageController;
