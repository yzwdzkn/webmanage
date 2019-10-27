'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const { SYSTEM, ADMIN_WHITELIST } = require('../../../tools/constant');
class WhitelistManageController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/whitelist_manage', {
      title: 'IP白名单',
    });
  }

  /**
     * 获取白名单列表
     */
  async list() {
    const { ip, page, limit } = this.ctx.query;
    const result = await this.service.adminWhitelist.findList(ip, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
     * 根据id获取白名单
     */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.adminWhitelist.findById(id);
    this.ctx.body = {
      status: 0,
      adminWhitelist: result,
    };
  }

  /**
     * 添加或者修改白名单
     */
  async saveWhitelist() {
    const params = this.ctx.request.body;
    const result = await this.service.adminWhitelist.findByIp(params.ip); // 判断这个白名单是否存在
    if (result) {
      this.ctx.body = {
        status: 1,
        msg: '该IP地址已经存在！',
      };
      return;
    }
    if (params.action == 0) { // 添加白名单
      params.create_operator = this.ctx.session.admin.username;
      await this.service.adminWhitelist.addWhitelist(params);
    } else if (params.action == 1) { // 修改白名单
      await this.service.adminWhitelist.editWhitelist(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id删除白名单(软删除)
     */
  async deleteWhitelist() {
    const id = this.ctx.request.body.id;
    await this.service.adminWhitelist.deleteWhitelist(id);
    const params = { id };
    await this.service.recycleBin.saveRecycleBin(params, SYSTEM, ADMIN_WHITELIST);
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id删除白名单
     */
  // async deleteWhitelist() {
  //   const id = this.ctx.request.body.id;
  //   await this.service.adminWhitelist.deleteWhitelist(id);
  //   this.ctx.body = {
  //     status: 0,
  //   };
  // }

}

module.exports = WhitelistManageController;
