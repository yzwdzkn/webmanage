/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const qs = require('querystring');
const request = require('request');
const { OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE, USER, ACCOUNT } = require('../../../tools/constant');
class UsernameManageController extends Controller {

  async index() {
    const query = this.ctx.query;
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    const { user, tourist } = await this.ctx.service.user.getUsrInfoBase();
    let key;
    switch (query.account_type) {
      case 'Agent':
        key = 's_agent_id';
        break;
      case 'zsUser':
        key = 's_pid';
        break;
      default:
        key = '';
    }
    await this.ctx.render('platformManage/user_manage', {
      title: '会员管理',
      agents,
      user,
      tourist,
      key,
      value: query.account_id,
      is_show: !query.account_id,
    });
  }

  async list() {
    const params = this.ctx.query;

    if (this.ctx.session.admin.type == 2) { // 判断是否是代理
      params.agent_id == this.ctx.session.admin.id;
    }

    const result = await this.service.user.findAll(params);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
   * 添加或者修改会员
   */

  async saveUser() {
    const params = this.ctx.request.body;
    console.log('params:', params);
    if (params.action == 0) {
      const findResult = await this.service.user.findByusername(params.username); // 判断这手机账户是否存在
      if (findResult) {
        this.ctx.body = {
          status: 0,
          msg: '该会员账号已存在！',
        };
        return;
      }
      params.pid = 0;
      const userResult = await this.service.user.create(params); // 新增
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, params, ACCOUNT, USER);
      if (!userResult) {
        this.ctx.body = {
          status: 1,
          msg: '添加失败！',
        };
      }
    } else if (params.action == 1) {
      delete params.action;
      delete params.password;
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, ACCOUNT, USER);
      await this.service.user.edit(params); // 编辑
    }
    this.ctx.body = {
      status: 0,
    };
  }

  async get() {
    const id = this.ctx.params.id;
    const result = await this.service.user.findById(id);
    this.ctx.body = {
      status: 0,
      username: result,
    };
  }

  /**
   * 查看携带
   */
  async seeCarry() {
    const username = this.ctx.query.username;
    const url = this.app.config.gameServerURl + 'getTakesByAccount?account=' + username + '&agent=' + 1;
    const result = await new Promise((resolve, reject) => {
      request({ url, timeout: 10000 }, (error, response, responseData) => {
        const data = JSON.parse(responseData);
        if (error || response.statusCode != 200 || responseData == '' || data.code == 1) {
          resolve({
            status: 1,
            msg: '查看携带分失败,code返回:' + data.code,
          });
        } else {
          resolve({
            status: 0,
            data: data.takes,
          });
        }
      });
    }).then(data => data);

    this.ctx.body = result;
  }

  /**
   * 修改用户状态
   */
  async changeUserStatus() {
    try {
      const { id, status } = this.ctx.request.body;
      const user = await this.ctx.service.user.findById(id);
      const url = this.app.config.gameServerURl + 'updatePlayerStatus?' + qs.stringify({ account: user.username, status, agent: this.app.config.defualtPlatformId });
      await this.service.tools.sendServerGetRequest(url, 10000); // 更新服务器会员状态
      await this.ctx.service.user.changeUserStatus(id, status); // 更新数据库会员状态
      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };

    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }


}

module.exports = UsernameManageController;
