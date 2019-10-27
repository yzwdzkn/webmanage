/* eslint-disable eqeqeq */

'use strict';
const moment = require('moment');
const statusCode = require('../tools/statusCode');

/**
 * 参数验证中间件
 */
module.exports = app => {
  return async (ctx, next) => {
    console.log('验证');
    const query = ctx.query;
    console.log('query:', query);
    const action = parseInt(query.action);
    const platform = parseInt(query.platform);// 平台id
    // const agent = parseInt(query.agent);// 代理编号        (linecode就是代理)
    const tm = query.tm;// 请求时间
    const ak = query.ak;
    let code = 0;
    const time = moment().utcOffset(8).unix();

    // 是否存在tm和ak 加密串
    if (code == 0 && (!ak || !tm)) {
      code = statusCode.CODE_502.code;
      app.logger.error('code: ' + code + ' 验证字段丢失');
    }

    // 请求时间是否超过一个小时
    if (code == 0 && ((time - parseInt(tm)) > 360)) {
      code = statusCode.CODE_16.code;
      app.logger.error('code: ' + code + ' 验证时间超时');
    }

    const platformInfo = await ctx.service.platformInfo.findById(platform);

    // 验证平台是否存在
    if (code == 0 && !platformInfo) {
      code = statusCode.CODE_501.code;
      app.logger.error('code: ' + code + ' 平台不存在');
    }
    // 验证平台状态
    if (code == 0 && platformInfo.status != 0) {
      code = statusCode.CODE_507.code;
      app.logger.error('code: ' + code + ' 平台状态错误');
    }

    // 验证ak是否正确
    if (code == 0) {
      const params = JSON.parse(JSON.stringify(query));
      delete params.ak;
      // 将请求的除tm和ak两个参数之外的所有参数按照参数名进行排序转成JOSN格式的字符串,在与平台mk5key 组合进行md5加密。
      const serverKey = await ctx.service.tools.createEncryptionAk(params, platformInfo.md5_key);
      if (ak != serverKey) {
        code = statusCode.CODE_503.code;
        app.logger.error('code: ' + code + ' 平台验证错误 ak: ' + ak + ' ,serverKey: ' + serverKey);
      }
    }

    // 验证玩家是否在黑名单列表或者停封
    if (code == 0 && (action == 1 || action == 2 || action == 3 || action == 4 || action == 5)) {
      if (query.username == '') {
        code = statusCode.CODE_520.code;
        app.logger.error('code: ' + code + '参数为空 username : ' + query.username);
      } else {
        const user = await ctx.service.user.findByPlatformAndUsername(platform, query.username);
        if (query.username != '' && (user && user.status != 0)) {
          code = statusCode.CODE_504.code;
          app.logger.error('code: ' + code + ' 账号禁用 username: ' + query.username);
        }
      }

    }

    // 验证订单规则符合
    if (code == 0 && (action == 3 || action == 4 || action == 6) && (!query.order_id || query.order_id.length < 8)) { // dq
      code = statusCode.CODE_505.code;
      app.logger.error('code: ' + code + ' 订单不符合规则 orderid: ' + query.order_id);
    }
    if (code == 0 && (action == 3 || action == 4)) {
      if (query.money == '') query.money = 0;
      if (!(await ctx.service.tools.isPositiveNumber(query.money))) {
        code = statusCode.CODE_521.code;
        app.logger.error('code: ' + code + ' 非法数值');
      } else {
        const money = code == 0 ? parseFloat(query.money) : NaN;
        // 验证上分下分数量
        if ((isNaN(money) || money < 0)) {
          code = statusCode.CODE_506.code;
          app.logger.error('code: ' + code + ' 上分下分数量小于0');
        }

        // 验证上分下分上额
        if (money > 10000000) {
          code = statusCode.CODE_508.code;
          app.logger.error('code: ' + code + ' 上分下分数量大于10000000');
        }
      }
    }

    if (code == 0) {
      query.platform_version = platformInfo.version || app.config.server_version; // dq
      await next(); // 继续
    } else {
      ctx.body = {
        status: code,
      };
    }

  };
};
