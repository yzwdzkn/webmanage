/* eslint-disable eqeqeq */
'use strict';


const Controller = require('egg').Controller;
const crypto = require('crypto');
const moment = require('moment');
const qs = require('querystring');
const request = require('request');
const statusCode = require('../../../tools/statusCode');

class GameLoginServerController extends Controller {
  async index() {
    const body = this.ctx.request.body;
    console.log('body-:', body);
    const action = parseInt(body.action);
    console.log('action-:', action);
    switch (action) {
      case 0: // 验证服务端发送过来的登录请求
        await this.verifyLogin();
        break;
      case 1:// 收到玩家离线并且可以下分
        await this.logoutGame();
        break;
      default:
        this.ctx.body = {
          code: statusCode.CODE_0.code,
        };
    }
  }

  /**
   * 验证服务端发送过来的登录请求
   */
  async verifyLogin() {
    console.log('验证登录');
    const body = this.ctx.request.body;
    const platform_id = body.platformId;
    const userToken = body.secret_key;

    const key_name = 'secretKey:' + userToken;
    const keyRedis = await this.app.redis.get(key_name);
    if (!keyRedis) {
      this.ctx.body = {
        code: statusCode.CODE_17.code,
      };
      return;
    }
    const username = await this.service.tools.usernameIntercept(body.username, platform_id);
    const user = await this.service.user.findByPlatformAndUsername(platform_id, username);
    if (user.status != 0) {
      this.app.logger.info('登陆失败 username: ' + username + ' 玩家被封停');
      this.ctx.body = {
        code: statusCode.CODE_17.code,
      };
      return;
    }
    if (await this.service.api.platform.getAccActionList(username)) {
      this.app.logger.info('登陆失败 username: ' + username + ' 玩家正在上下分');
      this.ctx.body = {
        code: statusCode.CODE_17.code,
      };
      return;
    }

    if (userToken && await this.service.tools.checkToken(userToken, username)) {

      // // 更新redis 中secret_key 的状态
      // const key_name = 'secretKey:' + userToken;
      // let data = await this.app.redis.get(key_name);
      // data = JSON.parse(data);
      // data.handle = 1;
      // await this.app.redis.set(key_name, JSON.stringify(data));
      // const expireTime = (this.app.config.tokenTimeOut || 120) * 2;
      // this.app.redis.expire(key_name, expireTime);
      this.app.redis.del(key_name);

      console.log('登录成功');
      this.ctx.body = {
        code: statusCode.CODE_0.code,
      };
    } else {
      this.app.logger.info('登陆失败 username: ' + username + ' token 失效');
      console.log('登录失败');
      this.ctx.body = {
        code: statusCode.CODE_17.code,
      };
    }
  }


  /**
   * 收到玩家离线并且可以下分
   */
  async logoutGame() {
    const body = this.ctx.request.body;
    console.log('玩家下线:', body.username);
    if (body.agent === '') {
      return;
    }
    const platform = body.agent.toString();
    const platformInfo = await this.service.platformInfo.findById(platform);
    const username = await this.service.tools.usernameIntercept(body.username, platform); // 截取用户名
    if (platformInfo && platformInfo.ofline_back_url && platformInfo.ofline_back_url.indexOf('http') != -1 && username) {
      const timestamp = moment().utcOffset(8).unix() * 1000;
      const data = {
        platform,
        timestamp,
        param: await this.service.tools.desEncode(platformInfo.des_key, JSON.stringify({ username, money: body.gold ? (parseInt(body.gold) / 100).toFixed(2) : '0' })),
        key: crypto.createHash('md5').update(platform + timestamp + platformInfo.md5_key).digest('hex'),
      };
      console.log('data:', data);
      const url = platformInfo.ofline_back_url + escape('?' + qs.stringify(data));
      this.app.logger.info('玩家下线通知平台:  account: ' + username + ' url: ' + url);

      request({
        url, timeout: 60000,
      }, (error, response, data) => {
        console.log('data:', data);
        if (!error) {
          this.app.logger.info('statusCode: ' + response.statusCode + ' account: ' + username + ' data: ' + data);
        } else {
          this.app.logger.info('[error]-', error);
        }
      });
    }
  }

}

module.exports = GameLoginServerController;
