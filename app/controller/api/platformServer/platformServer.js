/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const qs = require('querystring');
const statusCode = require('../../../tools/statusCode');

class PlatformServerController extends Controller {
  async index() {
    const query = this.ctx.query;
    this.app.logger.log('query:', query);
    switch (query.action) {
      case '1': // 请求玩家登录
        await this.requestLogin();
        break;
      case '2': // 根据账号踢玩家下线
        await this.kickAccountLogout();
        break;
      case '3': // 会员上分
        await this.playerUpperScore();
        break;
      case '4': // 会员下分
        await this.playerLowerScore();
        break;
      case '5': // 查询玩家状态信息
        await this.queryPlayerStatusInfo();
        break;
      case '6': // 查询订单号状态
        await this.queryOrderStatus();
        break;
      case '7': // 查询平台积分
        await this.queryAgentScore();
        break;
      case '8': // 查询订单列表
        await this.queryOrderList();
        break;
      case '9': // 查询玩家输赢列表
        await this.queryPlayerLostWinList();
        break;
      case '10': // 确认订单
        await this.confirmOrder();
        break;
      default:
        this.ctx.body = {
          status: statusCode.CODE_13.code,
        };

    }
  }

  /**
       * 请求玩家登录
       */
  async requestLogin() {
    // http://localhost:7001/platformApi?action=1&username=1_zhangsan1&agent=1&platform=1&language=zh_CN&ip=192.168.1.2
    const query = this.ctx.query;
    query.log = '请求玩家登录';
    const resultData = {};
    const data = {
      username: query.username.trim(),
      agent: query.agent,
      platform: query.platform,
      money: query.money ? (query.money * 100) : 0,
      language: query.language || 'zh_CN',
      ip: query.ip != undefined ? query.ip : '',
    };
    const version = query.platform_version || ''; // 版本号
    // 添加或更新玩家信息
    const result = await this.service.api.platform.addOrUpdateAccount(data);
    if (!result) { // 返回结果等于null时失败
      resultData.status = statusCode.CODE_510.code;
    } else {
      const secret_key = await this.service.tools.createToken(data.username);
      const key_name = 'secretKey:' + secret_key;
      await this.app.redis.set(key_name, JSON.stringify(data));
      const expireTime = (this.app.config.tokenTimeOut || 120) * 2;
      this.app.redis.expire(key_name, expireTime);
      this.service.tools.setTimeOutCallbackLowerScore(key_name); // 添加定时器


      resultData.status = statusCode.CODE_0.code;
      resultData.secret_key = secret_key;
      resultData.version = version;
      resultData.platform = data.platform;

    }

    await this.service.tools.resEnd(resultData, query);
  }

  /**
   * 根据账号踢玩家下线
   */
  async kickAccountLogout() {
    // http://localhost:7001/platformApi?action=2&platform=1&username=1_zhangsan1
    const query = this.ctx.query;
    query.log = '根据账号踢玩家下线';
    const resultData = {};
    // 发送请求给服务端踢玩家下线
    const result = await this.service.api.platform.kickAccountLogout(query.username, query.platform);
    if (!result) { // 返回结果等于null时失败
      resultData.status = statusCode.CODE_512.code;
    } else {
      resultData.status = statusCode.CODE_0.code;
    }
    await this.service.tools.resEnd(resultData, query);
  }

  /**
   * 会员上分
   */
  async playerUpperScore() {
    // http://localhost:7001/platformApi?action=3&platform=1&agent=1&username=1_zhangsan1&money=10&order_id=S1101222009
    const query = this.ctx.query;
    query.log = '会员上分';
    const resultData = {};
    const money = parseFloat(query.money);
    const username = query.username;
    const order_id = query.order_id;
    const big_data = { username, platform: query.platform };
    // 判断玩家是否在上下分列表中
    if (await this.service.api.platform.addAccountByAccActionList(username + '@' + query.platform)) {
      resultData.status = statusCode.CODE_515.code;
    } else {
      try {
        const orderResult = await this.service.orders.findByOrderIdAndPlatformId(order_id, query.platform);
        if (orderResult) { // 订单重复
          if (orderResult.order_state == 3 || (orderResult.order_state == 1 && orderResult.status != -1) || (orderResult.order_state == 2 && orderResult.status != 0)) {
            resultData.status = statusCode.CODE_509.code;
            await this.service.tools.resEnd(resultData, query);
            return;
          } else if (orderResult.order_state == 2) { // 订单已确认
            resultData.status = statusCode.CODE_0.code;
            resultData.score = parseFloat(await this.service.tools.goldToMoney(orderResult.current_score));
            await this.service.tools.resEnd(resultData, query);
            return;
          }
        }
        // 增加订单到正在处理中列表
        if (await this.service.api.platform.addDealOrders(order_id, money)) { // 存在相同订单则报错
          resultData.status = statusCode.CODE_516.code;
          await this.service.tools.resEnd(resultData, query);
          return;
        }
        const moneyScore = await this.service.tools.moneyToGold(money);
        const user = await this.service.user.findByPlatformAndUsername(query.platform, username);

        if (user == null) {
          resultData.status = statusCode.CODE_524.code;
          await this.service.tools.resEnd(resultData, query);
          return;
        }

        if (orderResult == null) {
          await this.service.orders.addUserOrder(order_id, user.id, user.agent_id, 0, moneyScore, 0, 1, -1, 1, query.platform); // 添加订单
        }

        // 平台下分
        const platformResult = await this.service.platformInfo.updatePlatformMoneyToUser(query.platform, moneyScore, 0);
        const plateformOrder = `${query.platform}${order_id}`;
        if (platformResult.errorcode != 0) { // 平台下分失败
          await this.service.platformOrder.savePlatfromOrder(query.platform, 0, moneyScore, 0, 4, 2, '-', '-', plateformOrder);
          await this.service.orders.updateUserOrder(order_id, query.platform, 0, 0, 4, 2);
          resultData.status = platformResult.errorcode;
          await this.service.tools.resEnd(resultData, query);
          return;
        }
        // 添加平台订单
        await this.service.platformOrder.savePlatfromOrder(query.platform, platformResult.platformPreMoney, moneyScore, platformResult.platformCurMoney, 0, 1, '-', '-', plateformOrder);

        big_data.platformCurMoney = platformResult.platformCurMoney;
        big_data.errorcode = platformResult.errorcode;
        // 会员上分
        const result = await this.service.api.platform.updateGameServerAccountMoney(username, moneyScore, query.platform, 0, order_id);
        this.app.logger.log('result:', result);
        if (result.code != 0) {
          // /会员上分失败，钱还回平台
          resultData.status = result.code;
          await this.service.api.platform.updatePlayerMoneyErrorBackAgentMoney(query.platform, plateformOrder, money);
          await this.service.tools.resEnd(resultData, query);
          return;
        }
        big_data.usernameCurMoney = parseFloat(result.data.usernameCurMoney);

        await this.service.platformOrder.updatePlatfromOrderState(plateformOrder, query.platform, 2); // 修改平台订单处理状态为处理完成
        await this.service.orders.updateUserOrder(order_id, query.platform, parseInt(big_data.usernameCurMoney) - parseInt(moneyScore), big_data.usernameCurMoney, 0, 2); // 添加玩家订单
        const url = this.app.config.gameServerURl + 'completeModifyMoney?' + qs.stringify({ order_id, platform_id: query.platform });
        await this.service.tools.sendServerGetRequest(url); // 向服务端确认订单

        if (user.is_upper_score == 0) { // 没有上分记录
          await this.service.user.updateIsUpperScore(user.platform_id, user.username);
        }

        resultData.status = statusCode.CODE_0.code;
        resultData.score = parseFloat(await this.service.tools.goldToMoney(big_data.usernameCurMoney));

      } catch (error) {
        this.app.logger.error(error);
        resultData.status = statusCode.CODE_18.code;
      } finally {
        await this.service.api.platform.removeDealOrders(order_id);// 从正在处理订单列表中删除正在处理的订单
        await this.service.api.platform.removeAccountByAccActionList(username + '@' + query.platform); // 删除账号到玩家上下分列表中
      }
    }

    await this.service.tools.resEnd(resultData, query);
  }

  /**
   * 会员下分
   */
  async playerLowerScore() {
    // http://localhost:7001/platformApi?action=4&platform=1&agent=1&username=1_zhangsan1&money=10&order_id=S1101222019
    const query = this.ctx.query;
    query.log = '会员下分';
    const resultData = {};
    const money = parseFloat(query.money);
    const username = query.username;
    const order_id = query.order_id;
    const big_data = { username, agent: query.platform };
    // 判断玩家是否在上下分列表中
    if (await this.service.api.platform.addAccountByAccActionList(username + '@' + query.platform)) {
      resultData.status = statusCode.CODE_515.code;
      await this.service.tools.resEnd(resultData, query);
      return;
    }
    try {

      const orderResult = await this.service.orders.findByOrderIdAndPlatformId(order_id, query.platform);
      if (orderResult) { // 订单重复
        if (orderResult.order_state == 3 || (orderResult.order_state == 1 && orderResult.status != -1) || (orderResult.order_state == 2 && orderResult.status != 0)) {
          resultData.status = statusCode.CODE_509.code;
          await this.service.tools.resEnd(resultData, query);
          return;
        } else if (orderResult.order_state == 2) { // 订单已确认
          resultData.status = statusCode.CODE_0.code;
          resultData.score = parseFloat(await this.service.tools.goldToMoney(orderResult.current_score));
          await this.service.tools.resEnd(resultData, query);
          return;
        }
      }
      // 增加订单到正在处理中列表
      if (await this.service.api.platform.addDealOrders(order_id, money)) { // 存在相同订单则报错
        resultData.status = statusCode.CODE_516.code;
        await this.service.tools.resEnd(resultData, query);
        return;
      }
      const moneyScore = await this.service.tools.moneyToGold(money);
      const user = await this.service.user.findByPlatformAndUsername(query.platform, username);
      if (user == null) { // 判断玩家是否存在
        resultData.status = statusCode.CODE_524.code;
        await this.service.tools.resEnd(resultData, query);
        return;
      }

      if (orderResult == null) {
        await this.service.orders.addUserOrder(order_id, user.id, user.agent_id, 0, moneyScore, 0, -1, -1, 1, query.platform); // 添加订单
      }
      // 会员下分
      const result = await this.service.api.platform.updateGameServerAccountMoney(username, moneyScore, query.platform, 1, order_id);
      big_data.usernameCurMoney = parseFloat(result.data.usernameCurMoney || 0);
      if (result.code != 0) {
        await this.service.orders.updateUserOrder(order_id, query.platform, 0, 0, 2, 2);
        resultData.status = result.code;
        await this.service.tools.resEnd(resultData, query);
        return;
      }
      const plateformOrder = `${query.platform}${order_id}`;
      // 平台上分
      const platformResult = await this.service.platformInfo.updatePlatformMoneyToUser(query.platform, moneyScore, 1);
      if (platformResult.errorcode != 0) { // 平台上分失败
        // 添加平台订单
        await this.service.platformOrder.savePlatfromOrder(query.platform, 0, moneyScore, 0, 5, 2, '-', '-', plateformOrder);
        await this.service.orders.updateUserOrder(order_id, query.platform, parseInt(big_data.usernameCurMoney) + parseInt(moneyScore), big_data.usernameCurMoney, 3, 2);

        resultData.status = platformResult.errorcode;
        await this.service.tools.resEnd(resultData, query);
        return;
      }
      big_data.platformCurMoney = platformResult.platformCurMoney;
      big_data.errorcode = platformResult.errorcode;

      // 添加平台订单
      await this.service.platformOrder.savePlatfromOrder(query.platform, platformResult.platformPreMoney, moneyScore, platformResult.platformCurMoney, 1, 2, '-', '-', plateformOrder);

      await this.service.orders.updateUserOrder(order_id, query.platform, parseInt(big_data.usernameCurMoney) + parseInt(moneyScore), big_data.usernameCurMoney, 0, 2);
      const url = this.app.config.gameServerURl + 'completeModifyMoney?' + qs.stringify({ order_id, platform_id: query.platform });
      await this.service.tools.sendServerGetRequest(url); // 向服务端确认订单

      resultData.status = statusCode.CODE_0.code;
      resultData.score = parseFloat(await this.service.tools.goldToMoney(big_data.usernameCurMoney));
    } catch (error) {
      this.app.logger.error(error);
      resultData.status = statusCode.CODE_18.code;
    } finally {
      await this.service.api.platform.removeDealOrders(order_id);// 从正在处理订单列表中删除正在处理的订单
      await this.service.api.platform.removeAccountByAccActionList(username + '@' + query.platform);
    }
    await this.service.tools.resEnd(resultData, query);
  }

  /**
       * 查询玩家状态信息
       */
  async queryPlayerStatusInfo() {
    // http://localhost:7001/platformApi?action=5&platform=1&agent=1&username=1_zhangsan1
    const query = this.ctx.query;
    query.log = '查询玩家状态信息';
    let resultData = {};
    const username = query.username;
    const result = await this.service.api.platform.queryPlayerStatusInfo(username, query.platform);
    if (result.code != 0) {
      resultData.status = result.code;
      await this.service.tools.resEnd(resultData, query);
      return;
    }
    const data = result.data;
    const money = data.code == 0 ? parseFloat(data.money) + parseFloat(data.lockGold) : 0;
    const state = data.code == 0 ? data.isOnline ? data.isOnline : 0 : -1;
    resultData = {
      status: statusCode.CODE_0.code,
      all_score: parseFloat(await this.service.tools.goldToMoney(parseFloat(money))),
      left_score: data.code == 0 ? parseFloat(await this.service.tools.goldToMoney(parseFloat(data.money))) : 0,
      state, // 在线状态（-1：账号不存在，0：不在线，1：在线，2：黑名单）
    };
    await this.service.tools.resEnd(resultData, query);
  }

  /**
       * 查询订单号状态
       * 订单状态（-1:订单不存在， 0：完成，2：失败，3-处理中）
       */
  async queryOrderStatus() {
    // http://localhost:7001/platformApi?action=6&platform=1&agent=1&order_id=S1101222005
    const query = this.ctx.query;
    query.log = '查询订单号状态';
    let resultData = {};
    if (await this.service.api.platform.getOrderidbyDealOrders(query.order_id)) { // 判断订单是否正在处理中
      resultData = { status: statusCode.CODE_0.code, order_state: 3, score: await this.service.api.platform.getOrderidbyDealOrders(query.order_id) };
      await this.service.tools.resEnd(resultData, query);
      return;
    }
    const orderResult = await this.service.orders.findByOrderId(query.order_id);
    if (!orderResult) {
      resultData = { status: statusCode.CODE_0.code, order_state: -1, score: 0 };
      await this.service.tools.resEnd(resultData, query);
      return;
    }
    let score = parseFloat(await this.service.tools.goldToMoney(parseFloat(orderResult.score)));
    if (orderResult.type < 0) { // type 小于0 下分 大于0 上分
      score = parseFloat(score) * -1;
    }
    resultData = {
      status: statusCode.CODE_0.code,
      order_state: orderResult.status == 0 ? 0 : 2,
      score, // 上分为正，下分为负
    };
    await this.service.tools.resEnd(resultData, query);
  }

  /**
       * 查询平台积分
       */
  async queryAgentScore() {
    // http://localhost:7001/platformApi?action=7&platform=1&agent=1
    const query = this.ctx.query;
    query.log = '查询平台积分';
    let resultData = {};
    const platformResult = await this.service.platformInfo.findById(query.platform);
    resultData = { status: statusCode.CODE_0.code, score: await this.service.tools.goldToMoney(parseInt(platformResult.money)) };
    resultData.score = parseFloat(resultData.score);
    await this.service.tools.resEnd(resultData, query);
  }

  /**
       * 查询订单列表
       */
  async queryOrderList() {
    const query = this.ctx.query;
    query.log = '查询订单列表';
    let resultData = {};
    const orderResult = await this.service.orders.getOrderList(parseInt(query.platform), query.start_time, query.end_time);
    const orders = [];
    for (let i = 0; i < orderResult.length; i++) {
      let score = parseFloat(await this.service.tools.goldToMoney(parseFloat(orderResult[i].score)));
      if (orderResult[i].type < 0) { // type 小于0 下分
        score = parseFloat(score) * -1;
      }
      const order = {
        order_id: orderResult[i].order_id,
        order_state: orderResult[i].status == 11 ? 0 : 2,
        score,
        createdate: orderResult[i].createdate,
      };
      orders.push(order);
    }
    resultData = { status: statusCode.CODE_0.code, orders };
    await this.service.tools.resEnd(resultData, query);
  }

  /**
   * 查询玩家输赢列表
   */
  async queryPlayerLostWinList() {
    const query = this.ctx.query;
    query.log = '查询玩家输赢列表';
    let resultData = {};
    const startDate = query.start_time;
    const endDate = query.end_time;
    const start_time = moment(new Date(startDate));
    const end_time = moment(new Date(endDate));

    if (end_time.unix() < start_time.unix()) {
      resultData = { status: statusCode.CODE_519.code };
    }
    if (start_time.date() == end_time.date()) { // 检查是否同一天
      let result;
      try {
        result = await this.service.dataStatistics.gameRecord.findAndCount({
          start_time: startDate,
          end_time: endDate,
          platform_id: query.platform,
          game_id: 0,
          room_id: 0,
        });
      } catch (error) {
        result = [[]];
        this.ctx.logger.error('查询玩家输赢列表:', error);
      }

      const data = result[0];
      const items = [];
      for (let i = 0; i < data.length; i++) {
        const item = {
          end_time: data[i].end_time, // 游戏结束时间
          username: data[i].username, // 玩家账号
          game_name: data[i].game_name, // 游戏类型
          room_name: data[i].room_name, // 房间类型
          desk_id: data[i].table_Id, // 桌子号
          seat_id: data[i].pos_id, // 座位号
          all_bet: data[i].all_bet / 100, // 总投注
          valid_bet: data[i].valid_bet / 100, // 有效投注额
          profit: data[i].profit / 100, // 输赢金额
          tax: data[i].deduct / 100, // 抽水
          game_no: data[i].game_no, // 局号
        };
        if (data[i].banker && data[i].banker == data[i].pos_id) {
          item.result = '庄';
        } else {
          item.result = '闲';
        }
        item.score = await this.service.tools.getInitialScore(data[i].game_name, data[i].current_score, data[i].take_score);// 初始金额
        item.score = item.score / 100;
        items.push(item);
      }
      resultData = { status: statusCode.CODE_0.code, data: items };
    } else {
      resultData = { status: statusCode.CODE_517.code };
    }
    await this.service.tools.resEnd(resultData, query);
  }

  /**
   * 确认订单
   * 订单处理状态：1 订单创建 2 订单完成 3 确定完成
   */
  async confirmOrder() {
    const query = this.ctx.query;
    query.log = '确认订单';
    let resultData = {};
    try {
      const order_id = query.order_id;
      const platform = query.platform;
      const orderResult = await this.service.orders.findByOrderIdAndPlatformId(order_id, platform); // 查询订单
      if (!orderResult) { // 订单不存在
        resultData = { status: statusCode.CODE_522.code };
      } else {
        if (orderResult.order_state == 2) { // 订单完成
          await this.service.orders.updateOrderState(order_id, platform, 3);
          resultData = { status: statusCode.CODE_0.code };
        } else if (orderResult.order_state == 3) { // 确定完成
          resultData = { status: statusCode.CODE_0.code };
        } else {
          resultData = { status: statusCode.CODE_523.code }; // 订单号的状态还未处理
        }
      }
    } catch (error) {
      this.app.logger.log('确认订单报错:', error);
      resultData = { status: statusCode.CODE_10.code };
    }
    await this.service.tools.resEnd(resultData, query);
  }

}

module.exports = PlatformServerController;
