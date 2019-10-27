'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;

class UserBlacklistManageController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/user_blacklist_manage', {
      title: '会员登录游戏IP黑名单',
    });
  }

  /**
     * 获取会员黑名单列表
     */
  async list() {
    const { ip, page, limit } = this.ctx.query;
    const result = await this.service.userBlacklist.findList(ip, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
     * 根据id获取会员黑名单
     */
  async get() {
    const id = this.ctx.params.id;
    const result = await this.service.userBlacklist.findById(id);
    this.ctx.body = {
      status: 0,
      userBlacklist: result,
    };
  }

  /**
   * 添加或者修改会员黑名单
   */
  async saveUserBlacklist() {
    const params = this.ctx.request.body;
    const result = await this.service.userBlacklist.findByIp(params.ip); // 判断这个会员黑名单是否存在
    if (result) {
      this.ctx.body = {
        status: 1,
        msg: '该IP地址已经存在！',
      };
      return;
    }
    if (params.action == 0) { // 添加会员黑名单
      params.create_operator = this.ctx.session.admin.username;
      await this.service.userBlacklist.addUserBlacklist(params);
    } else if (params.action == 1) { // 修改会员黑名单
      await this.service.userBlacklist.editUserBlacklist(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id删除会员黑名单
     */
  async deleteUserBlacklist() {
    const id = this.ctx.params.id;
    await this.service.userBlacklist.deleteUserBlacklist(id);
    this.ctx.body = {
      status: 0,
    };
  }

}

module.exports = UserBlacklistManageController;
