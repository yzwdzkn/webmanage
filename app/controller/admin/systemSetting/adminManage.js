'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const crypto = require('crypto');
const { SYSTEM, ADMINT } = require('../../../tools/constant');
class AdminManageController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/admin_manage', {
      title: '用户管理',
    });
  }

  /**
     * 获取账户列表
     */
  async list() {
    const { username, page, limit, status } = this.ctx.query;

    const result = await this.service.admin.findList(username, parseInt(page), parseInt(limit), status);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
     * 根据id获取账户
     */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.admin.findById(id);
    this.ctx.body = {
      status: 0,
      admin: result,
    };
  }

  /**
     * 添加或者修改账户
     */
  async saveAdmin() {
    try {
      const params = this.ctx.request.body;
      console.log(params);
      if (params.action == 0) { // 添加账户
        const result = await this.service.accountMap.getAccountType(params.username);// 判断这个账户是否存在
        if (!result) {
          const admin = await this.service.admin.findByUsername(params.username);
          if (admin) {
            this.ctx.body = {
              status: 1,
              msg: '该账户名称已经存在！',
            };
            return;
          }
          await this.service.admin.addAdmin(params);
        } else {
          this.ctx.body = {
            status: 1,
            msg: '该账户名称已经存在！',
          };
          return;
        }
      } else if (params.action == 1) { // 修改账户
        await this.service.admin.editAdmin(params);
      }
      this.ctx.body = {
        status: 0,
      };
    } catch (error) {
      this.ctx.body = {
        status: 1,
        msg: '操作失败！',
      };
    }
  }

  /**
     * 根据id删除账户(软删除)
     */
  async deleteAdmin() {
    try {
      const id = this.ctx.request.body.id;
      await this.service.admin.deleteAdmin(id);
      const params = { id };
      await this.service.recycleBin.saveRecycleBin(params, SYSTEM, ADMINT);
      this.ctx.body = {
        status: 0,
      };
    } catch (error) {
      this.ctx.body = {
        status: 1,
        msg: '操作失败！',
      };
    }
  }
  /**
     * 根据id删除账户
     */
  // async deleteAdmin() {
  //   try {
  //     const id = this.ctx.request.body.id;
  //     await this.service.admin.deleteAdmin(id);
  //     this.ctx.body = {
  //       status: 0,
  //     };
  //   } catch (error) {
  //     this.ctx.body = {
  //       status: 1,
  //       msg: '操作失败！',
  //     };
  //   }
  // }

  /**
     * 获取角色
     */
  async findRoles() {
    try {
      const type = this.ctx.query.type;
      const roles = await this.service.role.findRoles(type);
      this.ctx.body = {
        status: 0,
        roles,
      };
    } catch (error) {
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    }
  }

  /**
     * 重置密码
     */
  // async resetPassword() {
  //   try {
  //     const id = this.ctx.request.body.id;
  //     const password = parseInt(Math.random() * 1000000);
  //     console.log(password);
  //     const md5 = crypto.createHash('md5');
  //     md5.update(String(password));
  //     const passwordMd5 = md5.digest('hex');
  //     await this.service.admin.editPassword(id, passwordMd5);
  //     this.ctx.body = {
  //       status: 0,
  //       password,
  //     };
  //   } catch (error) {
  //     this.ctx.body = {
  //       status: 1,
  //       msg: '操作失败',
  //     };
  //   }
  // }
  // 修改密码
  async savePassword() {
    const id = this.ctx.request.body.id;
    const passwordMd5 = this.ctx.request.body.password;
    await this.service.admin.editPassword(id, passwordMd5);
    this.ctx.body = {
      status: '0',
    };
  }
}

module.exports = AdminManageController;
