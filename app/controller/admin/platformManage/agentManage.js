/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const { AGENT, OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE,
  OPERATION_TYPE_DELETE, DEFAULT_PASSWORD, ACCOUNT } = require('../../../tools/constant');
const ErrorManage = require('../../../tools/errorManage');

class AgentManageController extends Controller {
  async index() {
    await this.ctx.render('platformManage/agent_manage', {
      title: '代理账户管理',
    });
  }

  async list() {
    try {
      const { page, limit, s_start_date, s_end_date, username, status } = this.ctx.query;
      console.log(`this.ctx.query: ${JSON.stringify(this.ctx.query)}`);
      // const params = this.ctx.query;
      const params = {};
      const Op = this.ctx.model.Sequelize.Op;
      if (username) {
        const usernameArr = username.split(';');
        params.username = { [Op.in]: usernameArr };
      }
      if (s_start_date && s_end_date) {
        params.create_time = {
          [Op.gt]: s_start_date,
          [Op.lt]: s_end_date,
        };
      } else if (s_start_date) {
        params.create_time = {
          [Op.gt]: s_start_date,
        };
      } else if (s_end_date) {
        params.create_time = {
          [Op.lt]: s_end_date,
        };
      }
      if (status) {
        params.status = status;
      }
      const { data, count } = await this.service.agent.getAgentList(params, page, limit);
      this.ctx.body = { data, msg: '', count, code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }

  async createAccount() {
    try {
      const params = this.ctx.request.body;
      console.log('params: ', params);
      this.ctx.body = { data: '', msg: '', code: 0, status: 0 };
      await this.service.agent.creataAccount(params);
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, params, ACCOUNT, AGENT);
    } catch (error) {
      console.log('#################error: ', error);
      this.ctx.body = { data: '', msg: 'id或者账户名重复', status: '1' };
    }
  }
  async getTheAgentAccount() {
    const id = this.ctx.params.id;
    console.log(id);
    const result = await this.service.agent.getTheAgentAccount(id, AGENT);
    // console.log('#############: ', result.id);
    this.ctx.body = {
      data: result,
      msg: '成功',
      count: 1,
      status: 0,
    };
  }

  async editTheAccount() {
    try {
      const id = this.ctx.params.id;
      const params = this.ctx.request.body;
      params.id = id;
      // const changeParam = await this.service.operationLog.getChangeList(AGENT, params);
      // const content = `${this.ctx.session.admin.username} 修改了账号 ${params.username}的 ${changeParam}`;
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, ACCOUNT, AGENT);
      await this.service.agent.editTheAgentAccount(params, id);

      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };
    } catch (error) {
      const { msg, status } = ErrorManage.errorMessage(error);
      this.ctx.body = { data: '', msg, status };
    }
  }

  async deleteTheAccount() {
    const id = this.ctx.params.id;
    const params = this.ctx.request.body;
    params.id = id;
    await this.service.agent.deleteTheAgentAccount(id);
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_DELETE, params, ACCOUNT, AGENT);
    this.ctx.body = {
      data: '',
      msg: '删除成功',
      count: 1,
      status: 0,
    };
  }

  async resetPassword() {
    try {
      const id = this.ctx.params.id;
      const params = this.ctx.request.body;
      params.id = id;
      params.password = (DEFAULT_PASSWORD);
      await this.service.agent.resetPassword(id);
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, ACCOUNT, AGENT);
      this.ctx.body = { data: '', msg: '重置密码成功,密码重置为:' + DEFAULT_PASSWORD, status: 0 };
    } catch (error) {
      const { msg, status } = ErrorManage.errorMessage(error);
      this.ctx.body = { data: '', msg, status };
    }
  }

  /**
   * 查询这个代理的授权菜单
   */
  async authMenu() {
    const id = this.ctx.params.id;
    const result = await this.service.menu.findListTree({ is_agent: 1, status: 0 }); // 查询代理能拥有的菜单
    let treeData = await this.service.tools.recombinationMenuTree(result, 0);
    const agentResult = await this.service.agent.findById(id);
    const menuIds = agentResult.menu_ids ? agentResult.menu_ids.split(',').map(item => +item) : [];
    await this.service.tools.selectAuthorizationMenu(treeData, menuIds);
    treeData = [
      {
        id: 0,
        name: '顶级菜单',
        open: true,
        checked: (menuIds.length > 0),
        children: treeData,
      },
    ];
    this.ctx.body = {
      status: 0,
      tree: treeData,
    };
  }

  /**
   * 保存授权菜单
   */
  async saveMenu() {
    const { id, menu_ids } = this.ctx.request.body;
    const params = this.ctx.request.body;
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, ACCOUNT, AGENT);
    await this.service.agent.saveMenu(id, menu_ids);
    this.ctx.body = {
      status: 0,
    };
  }

  /**
   * 代理结算
   */
  async changeStatus() {
    const { date, agent_id, rate, platform_id } = this.ctx.request.body;
    // console.log('################');
    // console.log(this.ctx.request.body);
    await this.ctx.service.agent.changeAgentStatus(date, agent_id, rate, platform_id);
    this.ctx.body = {
      status: 0,
    };
  }

  async changeStatusAll() {
    const { datas, platform_id } = this.ctx.request.body;
    const res = [];
    console.log('datas: ', datas);
    for (const d of datas) {
      res.push(this.ctx.service.agent.changeAgentStatus(d.date, d.agentId, d.rate, platform_id));
    }
    await Promise.all(res);
    this.ctx.body = {
      status: 0,
    };
  }
}

module.exports = AgentManageController
;
