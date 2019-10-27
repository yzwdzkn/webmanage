/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;

class PlatformManageController extends Controller {
  async index() {
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('platformManage/platform_manage', {
      title: '平台列表',
      platforms,
    });
  }

  /**
   * 获取平台账户列表
   */
  async list() {
    const { platform_id, platform_name, page, limit, orderField, orderType } = this.ctx.query;
    const result = await this.service.platformInfo.findList(platform_id, platform_name, orderField, orderType, parseInt(page), parseInt(limit));
    const data = result[0].map((element, i) => {
      element = element.toJSON();
      element.score = result[2][i].score;
      element.lower_score = result[2][i].lower_score;
      return element;
    });
    this.ctx.body = {
      data,
      msg: '',
      count: result[1],
      code: 0,
    };
  }
  /**
     * 获取平台上下分详情
     */
  async detail() {
    const { platform_id, page, limit } = this.ctx.query;
    const result = await this.service.platformInfo.findByPlatformId(platform_id, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
     * 保存平台数据
     */
  async savePlatform() {
    const params = this.ctx.request.body;
    console.log('params:', params);
    if (params.action == 0) {
      const platform = await this.service.platformInfo.findById(params.platform_id);
      if (platform) {
        this.ctx.body = {
          status: 1,
          msg: '该平台ID已经存在',
        };
        return;
      }

      if (params.md5_key == '') {
        params.md5_key = await this.service.tools.generateRandomStr(16); // 随机生成字符串
      }
      if (params.des_key == '') {
        params.des_key = await this.service.tools.generateRandomStr(16); // 随机生成字符串
      }

      await this.service.platformInfo.addPlatform(params);
      this.ctx.body = {
        status: 0,
      };
    } else if (params.action == 1) {
      await this.service.platformInfo.editPlatform(params);
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
      };
    }
  }

  async get() {
    const platform_id = this.ctx.request.body.platform_id;
    const result = await this.service.platformInfo.findById(platform_id);
    this.ctx.body = {
      status: 0,
      platform: result,
    };
  }

  async saveInOutMoney() {
    let { action, platform_id, money } = this.ctx.request.body;
    const ip = this.ctx.ip;
    const returnData = {
      status: 0,
      msg: '',
    };
    const platform = await this.service.platformInfo.findById(platform_id);

    money = (parseFloat(money) * 100);
    let current_score = 0;
    if (action == 0) {
      // 平台充值上分
      current_score = money + platform.money;
      await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);

    } else if (action == 1) {
      if (money > platform.money) {
        returnData.status = 1;
        returnData.msg = '平台余额不足下分失败！';
      } else {
        // 平台取款下分
        current_score = platform.money - money;
        await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);
      }
    } else {
      returnData.status = 1;
    }
    // 保存平台上下分的订单
    if (returnData.status == 0) {
      let type = -100;
      if (action == 0) {
        type = 2; // 后台上分
      } else if (action == 1) {
        type = 3; // 后台下分
      }
      await this.service.platformOrder.savePlatfromOrder(platform_id, platform.money, money, current_score, type, 2, ip, this.ctx.session.admin.username);
    }
    this.ctx.body = returnData;
  }

  /**
   * B端代理充值,取款,改变平台分数 0-代理充值 平台下分 1-代理取款 平台上分
   */
  async saveInOutMoneyByAgent() {
    const { action, platform_id, money } = this.ctx.request.body;
    const platform = await this.service.platformInfo.findById(platform_id);
    const ip = this.ctx.ip;
    // money = (parseFloat(money) * 100);
    const returnData = {
      status: 0,
      msg: '',
    };
    let current_score = 0;
    if (action == 1) {
      // 代理取款-平台上分
      current_score = money + platform.money;
      await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);

    } else if (action == 0) { // 代理充值,平台下分
      if (money > platform.money) {
        returnData.status = 1;
        returnData.msg = '平台余额不足下分失败！';
      } else {
        // 代理充值 平台下分
        current_score = platform.money - money;
        await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);
      }
    } else {
      returnData.status = 1;
    }
    // 保存平台上下分的订单
    if (returnData.status == 0) {
      let type = -100;
      if (action == 0) {
        type = 8; // 代理充值
      } else if (action == 1) {
        type = 9; // 代理取款
      }
      await this.service.platformOrder.savePlatfromOrder(platform_id, platform.money, money, current_score, type, 2, ip, '');
    }
    this.ctx.body = returnData;
  }

  /**
   * B端信用代理下 玩家上下分 2-信用代理下玩家上分 平台下分 3-信用代理下玩家下分 平台上分
   * dq 10-18 修改
   */
  async saveInOutMoneyByUser() {
    const { action, platform_id, money } = this.ctx.request.body;
    const platform = await this.service.platformInfo.findById(platform_id);
    const returnData = {
      status: 0,
      msg: '',
    };
    let current_score = 0;
    if (action == 3) { // 3-信用代理下玩家下分 平台上分
      current_score = money + platform.money;
      await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);

    } else if (action == 2) { // 2-代理下玩家上分 平台下分
      if (money > platform.money) {
        returnData.status = 1;
        returnData.msg = '平台余额不足上分失败！';
      } else {
        // 代理充值 平台下分
        current_score = platform.money - money;
        await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);
      }
    } else {
      returnData.status = 1;
    }

    returnData.data = {
      current_score,
      money,
      pre_score: platform.money,
    };

    this.ctx.body = returnData;
  }

  /**
   * B端玩家上分失败,回滚平台分数
   */
  async rollbackMoney() {
    const { platform_id, money, type } = this.ctx.request.body;
    const platform = await this.service.platformInfo.findById(platform_id);
    let current_score = 0;
    const ip = this.ctx.ip;


    if (type == 1) { // 玩家上分失败 回滚平台分数 平台上分
      current_score = money + platform.money;
      try {
        await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);
      } catch (error) {
        await this.service.platformOrder.savePlatfromOrder(platform_id, platform.money, money, current_score, 6, 2, ip, 'system');// 回滚平台分数失败
        return;
      }
      await this.service.platformOrder.savePlatfromOrder(platform_id, platform.money, money, current_score, 7, 2, ip, 'system'); // 回滚平台分数成功
    } else if (type == 2) { // 玩家下分失败 回滚平台分数 平台下分
      current_score = platform.money - money;
      try {
        await this.service.platformInfo.updatePlatformMoney(platform_id, current_score);
      } catch (error) {
        await this.service.platformOrder.savePlatfromOrder(platform_id, platform.money, money, current_score, 6, 2, ip, 'system');// 回滚平台分数失败
        return;
      }
      await this.service.platformOrder.savePlatfromOrder(platform_id, platform.money, money, current_score, 7, 2, ip, 'system'); // 回滚平台分数成功
    }
  }

  // 批量更新版本号
  async saveVersion() {
    const params = this.ctx.request.body;
    console.log('params:', params);
    await this.service.platformInfo.editVersion(params);
    this.ctx.body = {
      status: 0,
    };
  }

  /**
   * 信用代理下玩家上下分-添加平台订单
   */
  async addPlatformOrder() {
    const { platform_id, pre_score, add_score, current_score, type } = this.ctx.request.body;
    const ip = this.ctx.ip;
    await this.service.platformOrder.savePlatfromOrder(platform_id, pre_score, add_score, current_score, type, 2, ip, '');
    this.ctx.body = {
      status: 0,
    };
  }

}

module.exports = PlatformManageController;
