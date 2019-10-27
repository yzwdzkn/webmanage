'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const { SYSTEM, MENU } = require('../../../tools/constant');
class MenuManageController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/menu_manage', {
      title: '菜单管理',
    });
  }

  /**
     * 获取菜单列表
     */
  async list() {
    const module_id = this.ctx.query.module_id || 0;
    const result = await this.service.menu.findList(module_id);
    this.ctx.body = {
      data: result,
      msg: '',
      count: result.length,
      code: 0,
    };
  }

  /**
     * 根据id获取菜单
     */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.menu.findById(id);
    this.ctx.body = {
      status: 0,
      menu: result,
    };
  }

  /**
     * 获取菜单树节点
     */
  async showMenuTree() {
    const module_id = this.ctx.request.body.module_id;
    const result = await this.service.menu.findListTree();
    const treeData = await this.service.tools.recombinationMenuTree(result, module_id);
    this.ctx.body = {
      status: 0,
      treeData,
    };
  }


  /**
     * 添加或者修改菜单
     */
  async saveMenu() {
    const params = this.ctx.request.body;
    if (params.action == 0) { // 添加菜单
      await this.service.menu.addMenu(params);
    } else if (params.action == 1) { // 修改菜单
      await this.service.menu.editMenu(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id删除菜单（软删除）
     */
  async deleteMenu() {
    const id = this.ctx.request.body.id;
    await this.service.menu.deleteMenu(id);
    const params = { id };
    await this.service.recycleBin.saveRecycleBin(params, SYSTEM, MENU);
    this.ctx.body = {
      status: 0,
    };
  }
  /**
     * 根据id删除菜单
     */
  // async deleteMenu() {
  //   const id = this.ctx.request.body.id;
  //   await this.service.menu.deleteMenu(id);
  //   this.ctx.body = {
  //     status: 0,
  //   };
  // }

}

module.exports = MenuManageController;
