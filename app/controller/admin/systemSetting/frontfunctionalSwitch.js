'use strict';

const Controller = require('egg').Controller;

class FrontfunctionalSwitchController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/front_functional_switch', {
      title: '前端功能开发',
    });
  }

  async get() {
    const id = this.ctx.params.id;
    const frontToggle = await this.service.frontToggle.findById(id);
    this.ctx.body = {
      status: 0,
      frontToggle,
    };
  }

  /**
   * 保存数据
   */
  async save() {
    const { id, status, data } = this.ctx.request.body;
    await this.service.frontToggle.update(id, status, data);
    this.ctx.body = {
      status: 0,
    };
  }

}

module.exports = FrontfunctionalSwitchController;
