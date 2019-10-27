'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const { SYSTEM, ROLE } = require('../../../tools/constant');
class MenuManageController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/role_manage', {
      title: '权限管理',
    });
  }

  /**
     * 获取菜单列表
     */
  async list() {
    const { page, limit } = this.ctx.query;
    // let type = null; // 获取当前登录账号的类型  0 系统管理员  1 平台管理员  2 代理
    // if (this.ctx.session.admin.type !== 0) {
    //   type = this.ctx.session.admin.type;
    // }
    const result = await this.service.role.findList(parseInt(page), parseInt(limit));// parseInt(page), parseInt(limit)
    const data = JSON.parse(JSON.stringify(result));
    const rows = data.rows;
    const admins = await this.service.admin.findAll();
    const objRoleIdToAdmin = {};
    for (const admin of admins) {
      if (objRoleIdToAdmin[admin.role_id]) {
        objRoleIdToAdmin[admin.role_id].push(admin.username);
      } else {
        objRoleIdToAdmin[admin.role_id] = [ admin.username ];
      }
    }
    console.log(JSON.stringify(objRoleIdToAdmin));
    for (let i = 0; i < rows.length; i++) {
      rows[i].list = objRoleIdToAdmin[rows[i].id] || [];
    }

    // console.log('##########: ', JSON.stringify(rows));
    this.ctx.body = {
      data: rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
     * 根据id获取菜单
     */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.role.findById(id);
    this.ctx.body = {
      status: 0,
      role: result,
    };
  }

  /**
     * 添加或者修改菜单
     */
  async saveRole() {
    const params = this.ctx.request.body;
    if (params.action == 0) { // 添加菜单
      await this.service.role.addRole(params);
    } else if (params.action == 1) { // 修改菜单
      await this.service.role.editRole(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id删除菜单（软删除）
     */
  async deleteRole() {
    const id = this.ctx.request.body.id;
    await this.service.role.deleteRole(id);
    const params = { id };
    await this.service.recycleBin.saveRecycleBin(params, SYSTEM, ROLE);
    this.ctx.body = {
      status: 0,
    };
  }
  /**
     * 根据id删除菜单
     */
  // async deleteRole() {
  //   const id = this.ctx.request.body.id;
  //   await this.service.role.deleteRole(id);
  //   this.ctx.body = {
  //     status: 0,
  //   };
  // }

  /**
     * 获取角色授权的菜单信息
     */
  async authorizationMenu() {
    const id = this.ctx.request.body.id;
    const menuResult = await this.service.role.findById(id);
    let result;
    if (menuResult.type === 0) {
      result = await this.service.menu.findListTree({ status: 0 }); // 获取所有菜单
    } else {
      result = await this.service.menu.findListTree({ is_platform: 1, status: 0 }); // 获取平台能用的菜单
    }

    let treeData = await this.service.tools.recombinationMenuTree(result, 0); // 菜单重新组合

    const menuIds = menuResult.menu_ids ? menuResult.menu_ids.split(',').map(item => +item) : [];
    await this.service.tools.selectAuthorizationMenu(treeData, menuIds); // 选中授权的菜单
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
  async saveAuthorizationMenu() {
    const { id, menuIds } = this.ctx.request.body;
    await this.service.role.updateRoleAuthorizationMenu(id, menuIds);
    this.ctx.body = {
      status: 0,
    };
  }
}

module.exports = MenuManageController;
