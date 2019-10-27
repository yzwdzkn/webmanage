/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const svgCaptcha = require('svg-captcha'); // dq
const { ADMIN, AGENT } = require('../tools/constant');
class HomeController extends Controller {
  async index() {
    const authMenus = await this.ctx.service.menu.findAuthList(this.ctx.session.admin.is_super, this.ctx.session.admin.menu_ids);
    let htmlStr = '<ul class="sidebar-menu" data-widget="tree">';
    htmlStr += await this.service.tools.generateMenuHtml(authMenus, 0);
    htmlStr += ' </ul>';
    let menu;
    for (let i = 0; i < authMenus.length; i++) {
      if (authMenus[i].type == 1) {
        menu = authMenus[i];
        break;
      }
    }
    await this.ctx.render('index', {
      menuHtml: htmlStr,
      menu,
    });
  }


  /**
     * 登录页面
     */
  async login() {
    const verifNum = this.ctx.session.verifNum || 0;
    await this.ctx.render('login', {
      csrf: this.ctx.csrf,
      verifNum,
    });
  }

  /**
     * 请求登录
     */
  async doLogin() {
    const { username, password, verifCode } = this.ctx.request.body;
    let verifNum = this.ctx.session.verifNum || 0;
    if (verifNum != 0 && verifCode.toLowerCase() != this.ctx.session.verifCode) { // dq
      this.ctx.body = {
        status: 1,
        msg: '验证码错误!',
      };
    } else {
      const accountMapResult = await this.service.accountMap.getAccountType(username);
      if (accountMapResult) {
        if (accountMapResult.account_type == ADMIN) {
          await this.adminLogin(username, password, accountMapResult.account_type); // 管理员登录
        } else if (accountMapResult.account_type == AGENT.en) {
          await this.agentLogin(accountMapResult, password); // 代理登录
        }
      } else {
        this.ctx.body = {
          status: 1,
          msg: '账号或密码错误!',
        };
      }
    }
    // dq
    if (this.ctx.body.status != 0) {
      verifNum = verifNum + 1;
    } else {
      verifNum = 0;
    }
    this.ctx.session.verifNum = verifNum;
    this.ctx.body.verifNum = verifNum;
  }

  /**
   * 代理登录
   */
  async agentLogin(accountMapResult, password) {
    const result = await this.service.agent.findAgentByUsername(accountMapResult.username);
    // 验证密码
    if (result && result.password == password) {
      let menu_ids;
      if (result.menu_ids != null && result.menu_ids != '') { // 代理自己存在权限的话，就用自己的权限
        menu_ids = result.menu_ids;
      } else { // 没得权限就找默认代理的权限
        const menuResult = await this.service.menu.findAgentTree();
        menu_ids = [];
        for (let i = 0; i < menuResult.length; i++) {
          menu_ids.push(menuResult[i].id);
        }
        menu_ids = menu_ids.join(',');
      }
      this.service.agent.updateLastLoginTime(result.id); // 更新最后登录时间
      this.ctx.session.admin = { // 将登录信息存入session 中
        id: result.id,
        username: result.username,
        nickname: result.nickname,
        is_super: 0,
        menu_ids,
        type: 2,
        account_type: accountMapResult.account_type,
      };
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
        msg: '账号或密码错误!',
      };
    }
  }

  /**
   * 后台管理员登录 （平台管理员）
   */
  async adminLogin(username, password, account_type) {
    const ip = this.ctx.ip;
    // dq
    // if ((ip === '192.168.1.57' || ip === '127.0.0.1') && this.app.config.env === 'local') {
    //   const admin = await this.service.admin.findByUsername(username);
    //   this.service.admin.updateLastLoginTime(admin.id); // 更新最后登录时间
    //   const role = await this.service.role.findById(admin.role_id); // 查询账户角色权限

    //   this.ctx.session.admin = { // 将登录信息存入session 中
    //     id: admin.id,
    //     username: admin.username,
    //     nickname: admin.nickname,
    //     is_super: admin.is_super,
    //     menu_ids: role ? role.menu_ids || '' : '',
    //     type: admin.type, // 0 系统管理员  1 平台管理员  2 代理
    //     account_type,
    //   };
    //   this.ctx.body = {
    //     status: 0,
    //   };
    //   return;
    // }
    // 验证IP白名单
    if (!(await this.service.tools.checkAdminWhitelist(ip))) {
      this.ctx.body = {
        status: 1,
        msg: '验证IP地址不在登录范围内!',
      };
      return;
    }
    // 验证登录
    const admin = await this.service.admin.findByUsername(username);
    if (admin && admin.password == password) {
      if (admin.is_super != 1 && admin.status != 0) {
        this.ctx.body = {
          status: 1,
          msg: '该账户已被禁用!',
        };
      } else {
        this.service.admin.updateLastLoginTime(admin.id); // 更新最后登录时间
        const role = await this.service.role.findById(admin.role_id); // 查询账户角色权限

        this.ctx.session.admin = { // 将登录信息存入session 中
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          is_super: admin.is_super,
          menu_ids: role ? role.menu_ids || '' : '',
          type: admin.type, // 0 系统管理员  1 平台管理员  2 代理
          account_type,
        };
        this.ctx.body = {
          status: 0,
        };
      }
    } else {
      this.ctx.body = {
        status: 1,
        msg: '账号或密码错误!',
      };
    }
  }


  async editPassword() {
    const { password, newPassword } = this.ctx.request.body;
    const admin = await this.service.admin.findById(this.ctx.session.admin.id);
    if (admin.password == password) {
      await this.service.admin.editPassword(admin.id, newPassword);
      this.ctx.session.admin = null;
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
        msg: '原密码不正确！',
      };
    }
  }

  async welcome() {
    await this.ctx.render('welcome');
  }

  /**
     * 退出登录
     */
  async logout() {
    this.ctx.session.admin = null; // 清除session
    await this.ctx.redirect('/login');
  }

  /**
   * dq生成验证码 10-14
   */
  async generateVerifCode() {
    const codeConfig = {
      size: 4, // 验证码长度
      ignoreChars: '0oO1ilI', // 验证码字符中排除 0oO1ilI
      noise: 2, // 干扰线条的数量
      width: 160,
      height: 50,
      fontSize: 50,
      color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
      background: '#eee',
    };
    const captcha = svgCaptcha.create(codeConfig);
    this.ctx.session.verifCode = captcha.text.toLowerCase(); // 存session用于验证接口获取文字码
    this.ctx.body = captcha.data;
  }

  async test() {
    const data = '{"record":{"tm":1567396859,"roomType":3,"act":[{"time":1,"ty":1},{"time":2,"ty":2},{"bet":500000,"ty":11,"time":3,"pos":2},{"bet":500000,"ty":11,"time":5,"no":3,"pos":2},{"bet":500000,"ty":11,"time":6,"pos":5},{"bet":285000,"ty":11,"time":6,"pos":4},{"bet":380000,"ty":11,"time":10,"pos":1},{"time":11,"ty":3},{"bet":[49,7],"ty":3,"time":11,"pos":0},{"bet":[9,25],"ty":3,"time":11,"pos":1},{"bet":[16,34],"ty":3,"time":11,"pos":2},{"bet":[3,43],"ty":3,"time":11,"pos":3},{"bet":[24,19],"ty":3,"time":11,"pos":4},{"bet":[5,31],"ty":3,"time":11,"pos":5},{"time":16,"ty":6},{"ty":16,"time":19,"pos":1},{"bet":33,"ty":13,"time":20,"no":1,"pos":2},{"bet":7,"ty":13,"time":24,"no":1,"pos":3},{"ty":16,"time":26,"pos":3},{"ty":16,"time":30,"pos":4},{"bet":22,"ty":14,"time":32,"no":1,"pos":5},{"bet":15,"ty":14,"time":32,"no":2,"pos":5},{"no":1,"ty":16,"time":34,"pos":5},{"bet":50,"ty":13,"time":35,"no":2,"pos":5},{"no":2,"ty":16,"time":39,"pos":5},{"bet":"184907","ty":8,"time":41,"pos":0}],"att":[{"allOwnInfo":[{"win":true,"card":[{"type":20,"card":[9,25]}],"validBet":380000,"changes":361000,"seatNo":1}],"platform":0,"ownChip":0,"chip":446922,"gameNo":"20190902120059-60421986751","deduct":19000,"changes":361000,"win":true,"lineCode":0,"total":380000,"name":"121673081","card":[],"rid":251000004876,"aid":6000,"validBet":380000,"pos":1},{"allOwnInfo":{},"platform":0,"ownChip":0,"chip":13792340,"gameNo":"20190902120059-60421986752","deduct":0,"changes":0,"win":false,"lineCode":"1","total":1000000,"name":"user#916","card":[],"rid":51000000916,"aid":0,"validBet":0,"pos":2},null,{"allOwnInfo":{},"platform":0,"ownChip":0,"chip":3398752,"gameNo":"20190902120059-60421986754","deduct":0,"changes":-285000,"win":false,"lineCode":0,"total":285000,"name":"12134624","card":[],"rid":251000004832,"aid":6000,"validBet":285000,"pos":4},{"allOwnInfo":{},"platform":0,"ownChip":0,"chip":2199866,"gameNo":"20190902120059-60421986755","deduct":0,"changes":0,"win":false,"lineCode":0,"total":1000000,"name":"13189413","card":[],"rid":251000004838,"aid":6000,"validBet":0,"pos":5}],"tableId":120800001,"room":604,"td":1567396900,"blink":5000,"pub1":"049:7,19:25,216:34:33|33:43:7,424:19,55:22-31:15:50","gamesn":2198675},"gameType":"esyd","action":3,"gameId":6}';
    const result = await this.service.dataStatistics.gameRecord.parseRecord(JSON.parse(data));
    this.ctx.body = {
      status: 0,
      result,
    };
  }

}

module.exports = HomeController;
