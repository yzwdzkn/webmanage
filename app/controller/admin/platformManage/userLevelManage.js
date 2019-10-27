/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const ErrorManage = require('../../../tools/errorManage');
const { OPERATION_TYPE_CREATE, SYSTEM, USER_AGENT, OPERATION_TYPE_UPDATE } = require('../../../tools/constant');
class UserLevelManageController extends Controller {


  async index() {
    // const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('platformManage/user_level_manage', {
      title: '会员等级管理',
    //   agents,
    });
  }

  // 获取会员等级
  async list() {
    const params = this.ctx.query;
    // console.log(this.ctx.session.admin);
    // if (this.ctx.sesssion.admin.type == 2) { // 判断是否是代理
    //   params.agent_id == this.ctx.session.admin.username;
    // }
    const data = await this.service.userLevel.getLevelList(params);
    console.log(data);
    this.ctx.body = {
      code: '0',
      data,
      count: data[0].count_no,
    };
  }
  // 添加或编辑
  async saveUserLevel() {
    const params = this.ctx.request.body;
    console.log(params);
    if (params.action == 0) { // 添加等级
      await this.service.userLevel.addUserLevel(params);
      console.log('11111');
    } else if (params.action == 1) { // 修改等级
      await this.service.userLevel.editUserLevel(params);
      console.log('2222');
    }
    this.ctx.body = {
      status: '0',
    };
  }
  async delUserLevel() {
    const params = this.ctx.request.body;
    await this.service.userLevel.delUserLevel(params.id);
    this.ctx.body = {
      status: '0',
    };
  }
}

module.exports = UserLevelManageController;
