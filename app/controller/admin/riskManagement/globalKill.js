'use strict';

const Controller = require('egg').Controller;
const request = require('request');
const { OPERATION_TYPE_UPDATE, SYSTEM, GLOBAL_KILL } = require('../../../tools/constant');

class GlobalKillController extends Controller {

  async index() {
    const result = await this.service.killNumber.findGlobalKill();
    const killRate = await this.service.killNumber.findKillRate(); // 总盈利率 总盈利/总投注
    const status = await this.service.killNumber.findStatus(); // 获取追杀放水状态
    console.log('############: ', JSON.stringify(status));
    await this.ctx.render('riskManagement/global_kill', {
      title: '全局杀放',
      kill: result, // 预期杀数
      killRate, // 实际杀数
      killStatus: status.kill_status,
      waterStatus: status.water_status,
    });
  }

  /**
     * 保存全局杀数
     */
  async saveGlobalKill() {
    const kill_number = this.ctx.request.body.kill_number;
    const params = { id: 1, kill_number };
    const killResult = await this.ctx.service.killNumber.findGlobalKill();
    if (killResult && killResult.kill_number == kill_number) {
      console.log('杀数没有变化,不需要做更新操作');
      this.body = {
        status: 0,
      };
      return;
    }
    const url = this.app.config.gameServerURl + 'setKillRate?killRate=' + kill_number;
    console.log('url:', url);
    const result = await new Promise((resolve, reject) => {
      request({ url, timeout: 10000 }, function(error, response, responseData) {
        console.log(error, response, responseData);
        if (error || response.statusCode != 200 || responseData == '') {
          resolve({ code: 1 });
        } else {
          const data = JSON.parse(responseData);
          resolve(data);
        }
      });
    });
    console.log('result:', result);
    if (result.code == 0) {
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, GLOBAL_KILL);
      await this.service.killNumber.saveGlobalKill(kill_number);
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    }
  }

  async saveKillStatus() {
    const status = this.ctx.request.body.status;
    const url = this.app.config.gameServerURl + 'setKillStatus?status=' + status;
    console.log('url:', url);
    const result = await new Promise((resolve, reject) => {
      request({ url, timeout: 10000 }, function(error, response, responseData) {
        // console.log(error, response, responseData);
        if (error || response.statusCode != 200 || responseData == '') {
          resolve({ code: 1 });
        } else {
          const data = JSON.parse(responseData);
          resolve(data);
        }
      });
    });
    console.log('result:', result);
    if (result.code == 0) {
      // await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, GLOBAL_KILL);
      // await this.service.killNumber.saveGlobalKill(kill_number);
      await this.service.killNumber.saveGlobalKillStatus(status);
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    }
  }

  async saveWaterStatus() {
    const status = this.ctx.request.body.status;
    const url = this.app.config.gameServerURl + 'setDiveStatus?status=' + status;
    console.log('url:', url);
    const result = await new Promise((resolve, reject) => {
      request({ url, timeout: 10000 }, function(error, response, responseData) {
        // console.log(error, response, responseData);
        if (error || response.statusCode != 200 || responseData == '') {
          resolve({ code: 1 });
        } else {
          const data = JSON.parse(responseData);
          resolve(data);
        }
      });
    });
    console.log('result:', result);
    if (result.code == 0) {
      // await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, GLOBAL_KILL);
      // await this.service.killNumber.saveGlobalKill(kill_number);
      await this.service.killNumber.saveGlobalWaterStatus(status);
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    }
  }
}

module.exports = GlobalKillController;
