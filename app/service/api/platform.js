/* eslint-disable jsdoc/check-param-names */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-promise-reject-errors */

'use strict';
const Service = require('egg').Service;
const request = require('request');
const qs = require('querystring');
const statusCode = require('../../tools/statusCode');

class PlatformService extends Service {

  async addOrUpdateAccount(params) {
    // 是否存在传过来的这个账号
    const isExistAccount = await this.service.user.findByPlatformAndUsername(params.platform, params.username);
    let user_id;
    if (isExistAccount) {
      this.service.user.updateVariableParam({ lastlogintime: new Date() }, { id: isExistAccount.id }); // 更新会员最后登录时间
      user_id = isExistAccount.id;
    } else {
      // 不存在新增
      const addResult = await this.ctx.model.UserAccount.create({
        username: params.username,
        platform_id: params.platform,
        agent_id: params.agent,
        createdate: new Date(),
        lastlogintime: new Date(),
      });
      user_id = addResult.id;
    }
    this.service.userLoginHall.create({
      id: user_id,
      username: params.username,
      platform_id: params.platform,
    }, params.ip); // 添加登录记录

    const returnData = {
      status: statusCode.CODE_0.code,
    };
    const serverResult = await this.reqGameServerPlayerInfo(params);// 更新游戏服务器玩家信息
    returnData.serverData = serverResult;
    return returnData;

  }

  /**
   * 更新游戏服务器玩家信息
   * money 和 lineCode 后面要进行下修改
   * @param {*} params
   */
  async reqGameServerPlayerInfo(params) {
    const url = this.app.config.gameServerURl + 'onPlayerlogin?' + qs.stringify({ account: params.username, agent: params.platform, lineCode: params.agent, lang: params.lang, regIp: params.ip });
    this.ctx.logger.info('reqGameServerPlayerInfo-url:', url);
    return await new Promise((resolve, reject) => {
      request({ url, timeout: 600000 }, (error, response, responseData) => {
        this.ctx.logger.info('服务端响应responseData:', responseData, error);
        if (error || response.statusCode != 200 || responseData == '') {
          reject('更新游戏服务器玩家信息失败1');
          return;
        }

        responseData = JSON.parse(responseData);
        if (responseData.code != 0) {
          reject('更新游戏服务器玩家信息失败2');
          return;
        }
        const lang = responseData.lang == '' ? 'zh-CN' : responseData.lang;
        resolve({ usernameCurMoney: responseData.money, lang });

      });
    }).then(async data => {
      this.ctx.logger.info('reqGameServerPlayerInfo-data:', data);
      return data;
    }).catch(error => {
      this.ctx.logger.error(error);
      return null;
    });
  }

  /**
   * 根据账号发送请求给服务端踢玩家下线
   */
  async kickAccountLogout(username, platform) {
    const url = this.app.config.gameServerURl + 'kickOffInPlayerByAccount?' + qs.stringify({ account: username, agent: platform });
    this.ctx.logger.info('kickAccountLogout-url:', url);
    return await new Promise((resolve, reject) => {
      request({ url, timeout: 600000 }, (error, response, responseData) => {
        if (error || response.statusCode != 200 || responseData == '') {
          reject();
          return;
        }
        responseData = JSON.parse(responseData);
        if (responseData.code != 0) {
          reject();
          return;
        }
        // responseData.code 等于0 表示成功
        resolve(responseData);

      });
    }).then(data => {
      return data;
    }).catch(() => {
      return null;
    });
  }

  /**
   * 更新游戏服务器玩家分数
   * @param {*} username
   * @param {*} money
   * @param {*} agent
   * @param {*} ip
   * @param {*} type 0 会员上分 1会员下分
   */
  async updateGameServerAccountMoney(username, money, agent, type, order_id) {
    const method = type == 0 ? 'addPlayerMoney' : 'cutBackPlayerMoney';
    const url = this.app.config.gameServerURl + method + '?' + qs.stringify({ account: username, money, agent, order_id });
    this.ctx.logger.info('上下分URL:', url);
    return await new Promise((resolve, reject) => {
      request({ url, timeout: 60000 }, (error, response, responseData) => {
        this.ctx.logger.info('服务器返回responseData:', responseData);
        if (error || response.statusCode != 200 || responseData == '') {
          reject({ code: statusCode.CODE_511.code, usernameCurMoney: 0, msg: statusCode.CODE_511.msg });
          return;
        }
        responseData = JSON.parse(responseData);
        if (responseData.code == 0) {
          resolve({ code: 0, usernameCurMoney: responseData.money, sn: responseData.sn });
        } else {
          if (responseData.code == 2) {
            reject({ code: statusCode.CODE_513.code, usernameCurMoney: 0, msg: '登录的瞬间不能下分限制' });
          } else if (responseData.code == 3) {
            reject({ code: statusCode.CODE_514.code, usernameCurMoney: 0, msg: '余额不足导致下分失败' });
          } else {
            reject({ code: statusCode.CODE_511.code, usernameCurMoney: 0, msg: statusCode.CODE_511.msg });
          }
        }
      });
    }).then(async data => {
      try {
        if (data.code == 0) { //  更新一份会员分数到redis 中
          await this.updateRedisUserMoney({
            username,
            platform_id: agent,
            usernameCurMoney: data.usernameCurMoney || 0,
            sn: data.sn || 0,
          }, 1);
        }
      } catch (e) {
        this.ctx.logger.error('处理玩家分数报错:', e);
      }

      return {
        code: 0,
        data,
      };
    }).catch(error => {
      this.ctx.logger.error('上下分报错:', error);
      return {
        code: error.code,
        data: error,
      };
    });
  }

  /**
   * 更新玩家在redis 中的金额
   * @param {*} data
   * @param {*} type
   */
  async updateRedisUserMoney(data, type) {
    const name = `${data.username}@${data.platform_id}`;
    let userRedis = await this.app.redis.hget('userMoneyAll', name);
    const params = {
      currentMoney: data.usernameCurMoney || 0,
    };
    if (userRedis !== null) {
      userRedis = JSON.parse(userRedis);
      params.sn = userRedis.sn;
    }
    if (userRedis === null || (type == 1 && parseInt(data.sn) > parseInt(userRedis.sn))) {
      params.sn = data.sn;
    }
    // if (userRedis === null || (data.sn !== undefined && parseInt(data.sn) > parseInt(userRedis.sn))) {
    //   params.sn = data.sn;
    // }
    await this.app.redis.hset('userMoneyAll', name, JSON.stringify(params));
  }

  /**
   * 会员上分失败回滚代理分数
   * @param {*} platform_id
   * @param {*} orderid
   * @param {*} money
   * @param {*} big_data
   */
  async updatePlayerMoneyErrorBackAgentMoney(platform_id, orderid, money) {
    money = await this.service.tools.moneyToGold(money);
    const platformResult = await this.service.platformInfo.updatePlatformMoneyToUser(platform_id, money, 1);
    if (!platformResult || platformResult.errorcode != 0) {
      this.ctx.logger.error('回滚平台分数失败 platform_id :' + platform_id + ' ,orderid :' + orderid + ', money :' + money);
      // 添加订单
      await this.service.platformOrder.savePlatfromOrder(platform_id, 0, money, 0, 6, 2, '', '-', `HG_${orderid}`, `回滚订单数据失败：${orderid}`);
      return;
    }
    this.ctx.logger.error('回滚平台分数成功 platform_id :' + platform_id + ' ,orderid: ' + orderid + ', money: ' + money);
    // 添加订单
    await this.service.platformOrder.savePlatfromOrder(platform_id, platformResult.platformPreMoney, money, platformResult.platformCurMoney, 7, 2, '', '-', `HG_${orderid}`, `回滚订单数据成功：${orderid}`);
  }

  /**
   * 发送请求给服务端查询玩家状态信息
   * @param {*} username
   * @param {*} platform
   */
  async queryPlayerStatusInfo(username, platform) {
    const url = this.app.config.gameServerURl + 'getAccountMoney?' + qs.stringify({ account: username, agent: platform });
    return await new Promise((resolve, reject) => {
      request({ url, timeout: 600000 }, (error, response, responseData) => {
        if (error || response.statusCode != 200 || responseData == '') {
          reject({ code: statusCode.CODE_512.code });
          return;
        }
        resolve(JSON.parse(responseData));
      });
    }).then(data => {
      return {
        code: 0,
        data,
      };
    }).catch(error => {
      return {
        code: error.code,
      };
    });
  }

  /**
   * 增加账号到玩家上下分列表中
   * @param {*} username
   */
  async addAccountByAccActionList(username) {
    const flag = await this.app.redis.get(`accActionList:${username}`);
    if (flag == 1) {
      return true;
    }
    await this.app.redis.set(`accActionList:${username}`, 1);
    return false;
  }

  /**
   * 删除账号到玩家上下分列表中
   * @param {*} username
   */
  async removeAccountByAccActionList(username) {
    await this.app.redis.del(`accActionList:${username}`);
  }

  async getAccActionList(username) {
    const flag = await this.app.redis.get(`accActionList:${username}`);
    if (flag == 1) return true;
    return false;
  }

  /**
   * 增加订单到正在处理中
   * @param {*} orderid
   * @param {*} money
   */
  async addDealOrders(orderid, money) {
    const flag = await this.app.redis.get(`orderActionList:${orderid}`);
    if (flag != null) {
      return true;
    }
    await this.app.redis.set(`orderActionList:${orderid}`, money);

    return false;
  }

  /**
   * 删除正在处理中的订单
   * @param {*} orderid
   */
  async removeDealOrders(orderid) {
    await this.app.redis.del(`orderActionList:${orderid}`);
  }

  /**
   * 判断订单是否正在处理中
   * @param {*} orderid
   */
  async getOrderidbyDealOrders(orderid) {
    return await this.app.redis.get(`orderActionList:${orderid}`);
  }

}

module.exports = PlatformService;
