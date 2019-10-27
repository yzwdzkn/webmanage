/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const qs = require('querystring');
const request = require('request');
const moment = require('moment');
const { OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE, USER, ACCOUNT } = require('../../../tools/constant');
class UsernameManageController extends Controller {

  async index() {
    const query = this.ctx.query;
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    const platforms = await this.ctx.service.user.findPlatformInfo();
    const { user, tourist } = await this.ctx.service.user.getUsrInfoBase();
    console.log('------------------');
    console.log(await this.app.redis.get('deductGold'));
    let key;
    switch (query.account_type) {
      case 'Agent':
        key = 's_agent_id';
        break;
      case 'zsUser':
        key = 's_pid';
        break;
      default:
        key = '';
    }
    await this.ctx.render('userManage/user_manage', {
      title: '会员列表',
      agents,
      platforms: platforms.rows,
      user,
      tourist,
      key,
      value: query.account_id,
      is_show: !query.account_id,
      deductGold: await this.app.redis.get('deductGold'),
    });
  }

  async list() {
    const params = this.ctx.query;
    const result = await this.service.user.findAll(params);
    console.log(result);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  async get() {
    const params = this.ctx.request.body;
    const result = await this.service.user.findById(params.id);
    this.ctx.body = {
      status: 0,
      data: result,
    };
  }

  async findByPlatAndUsername() {
    const { username, platform_id } = this.ctx.request.body;
    const result = await this.service.user.findByPlatformAndUsername(platform_id, username);
    this.ctx.body = {
      status: 0,
      data: result,
    };
  }

  /**
   * 查看携带
   */
  // async seeCarry() {
  //   const username = this.ctx.query.username;
  //   const url = this.app.config.gameServerURl + 'getTakesByAccount?account=' + username + '&agent=' + 1;
  //   const result = await new Promise((resolve, reject) => {
  //     request({ url, timeout: 10000 }, (error, response, responseData) => {
  //       const data = JSON.parse(responseData);
  //       if (error || response.statusCode != 200 || responseData == '' || data.code == 1) {
  //         resolve({
  //           status: 1,
  //           msg: '查看携带分失败,code返回:' + data.code,
  //         });
  //       } else {
  //         resolve({
  //           status: 0,
  //           data: data.takes,
  //         });
  //       }
  //     });
  //   }).then(data => data);

  //   this.ctx.body = result;
  // }

  /**
   * 查看携带
   */
  async seeCarry() {
    let { user_id, username, platform_id } = this.ctx.query;
    if (user_id != undefined && user_id != '') {
      const user = await this.service.user.findById(user_id);
      username = user.username;
      platform_id = user.platform_id;
    }
    const url = this.app.config.gameServerURl + 'getTakesByAccount?account=' + username + '&agent=' + platform_id;
    const result = await new Promise((resolve, reject) => {
      request({ url, timeout: 10000 }, (error, response, responseData) => {
        const data = JSON.parse(responseData);
        if (error || response.statusCode != 200 || responseData == '' || data.code == 1) {
          resolve({
            status: 1,
            msg: '查看携带分失败,状态码返回:' + data.code,
          });
        } else {
          resolve({
            status: 0,
            data: data.takes,
          });
        }
      });
    }).then(data => data);

    this.ctx.body = result;
  }

  /**
   * 修改用户状态
   */
  async changeUserStatus() {
    try {
      let { id, status } = this.ctx.request.body;
      status = parseInt(status);
      const user = await this.ctx.service.user.findById(id);
      const url = this.app.config.gameServerURl + 'updatePlayerStatus?' + qs.stringify({ account: user.username, status, agent: user.platform_id });
      await this.service.tools.sendServerGetRequest(url, 10000); // 更新服务器会员状态
      await this.ctx.service.user.changeUserStatus(id, status); // 更新数据库会员状态
      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }


  /**
   * 更加平台修改用户状态
   */
  async updateUserStatusByPlatform() {
    try {
      let { username, platform_id, status } = this.ctx.request.body;
      console.log(this.ctx.request.body);
      status = parseInt(status);
      const user = await this.ctx.service.user.findByPlatformAndUsername(platform_id, username);
      const url = this.app.config.gameServerURl + 'updatePlayerStatus?' + qs.stringify({ account: user.username, status, agent: user.platform_id });
      await this.service.tools.sendServerGetRequest(url, 10000); // 更新服务器会员状态
      await this.ctx.service.user.changeUserStatus(user.id, status); // 更新数据库会员状态
      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: 1,
      };
    }
  }

  /**
   * 清楚携带
   */
  async clearMoney() {
    let { user_id, username, platform_id } = this.ctx.query;
    if (user_id != undefined && user_id != '') {
      const user = await this.service.user.findById(user_id);
      username = user.username;
      platform_id = user.platform_id;
    }
    const url = this.app.config.gameServerURl + 'clearGoldByAccound?account=' + username + '&agent=' + platform_id;
    const result = await new Promise((resolve, reject) => {
      request({ url, timeout: 10000 }, function(error, response, responseData) {
        const data = JSON.parse(responseData);
        if (error || response.statusCode != 200 || responseData == '' || data.code == 1) {
          resolve({
            status: 1,
            msg: '清携带分失败',
          });
        } else {
          resolve({
            status: 0,
          });
        }
      });
    });

    this.ctx.body = result;
  }

  /**
   * 强制下线
   */
  async forcedOffline() {
    let { user_id, username, platform_id } = this.ctx.query;
    if (user_id != undefined && user_id != '') {
      const user = await this.service.user.findById(user_id);
      username = user.username;
      platform_id = user.platform_id;
    }

    const result = await this.service.api.platform.kickAccountLogout(username, platform_id);
    if (!result) { // 返回结果等于null时失败
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    } else {
      this.ctx.body = {
        status: 0,
      };
    }
  }

  /**
   * 玩家上下分
   */
  async saveUserInOutMoney() {
    let { user_id, action, money } = this.ctx.request.body;
    money = money * 100;
    if (money < 0) {
      this.ctx.body = {
        status: 1,
        msg: '分数不能小于等于0',
      };
      return;
    }
    if (money > 100000000) {
      this.ctx.body = {
        status: 1,
        msg: '分数不能超过1000000',
      };
      return;
    }
    const user = await this.service.user.findById(user_id);
    const platform = await this.service.platformInfo.findById(user.platform_id);
    const orderId = `${user.platform_id}${Date.now()}`;
    if (action == 0) { // 会员上分
      // 平台下分
      const platformResult = await this.service.platformInfo.updatePlatformMoneyToUser(user.platform_id, money, 0);
      console.log('platformResult:', platformResult);
      if (platformResult.errorcode != 0) { // 平台下分失败
        this.ctx.body = {
          status: 1,
          msg: '平台余额不足',
        };
        return;
      }
      // 会员上分
      const result = await this.service.api.platform.updateGameServerAccountMoney(user.username, money, user.platform_id, 0, orderId);
      if (result.code != 0) {
        await this.service.api.platform.updatePlayerMoneyErrorBackAgentMoney(user.platform_id, orderId, money);
        this.ctx.body = {
          status: 1,
          msg: '会员上分失败',
        };
        return;
      }
      // 添加订单
      await this.service.orders.addOrder(orderId, user.username, money, 0, 0, JSON.stringify({ platformCurMoney: platformResult.platformCurMoney, usernameCurMoney: parseFloat(result.data.usernameCurMoney) }), user.platform_id, this.ctx.session.admin.username, this.ctx.ip);
      this.ctx.body = {
        status: 0,
      };

    } else {

      // 会员下分
      const result = await this.service.api.platform.updateGameServerAccountMoney(user.username, money, user.platform_id, 1, orderId);
      if (result.code != 0) {
        this.ctx.body = {
          status: 1,
          msg: '会员下分失败',
        };
        return;
      }
      // 平台上分
      const platformResult = await this.service.platformInfo.updatePlatformMoneyToUser(user.platform_id, money, 1);
      if (platformResult.errorcode != 0) { // 平台上分失败

        // 添加订单
        await this.service.orders.addOrder(orderId, user.username, money, 3, 1, JSON.stringify({ platformCurMoney: 0, usernameCurMoney: parseFloat(result.data.usernameCurMoney) }), user.platform_id, this.ctx.session.admin.username, this.ctx.ip);
        this.ctx.body = {
          status: 1,
          msg: '平台上分失败',
        };
        return;
      }

      // 添加订单
      await this.service.orders.addOrder(orderId, user.username, money, 0, 1, JSON.stringify({ platformCurMoney: platformResult.platformCurMoney, usernameCurMoney: parseFloat(result.data.usernameCurMoney) }), user.platform_id, this.ctx.session.admin.username, this.ctx.ip);
      this.ctx.body = {
        status: 0,
      };

    }
  }


  /**
   * 提供给平台的玩家上下分
   */
  async userInOutMoney() {
    try {
      let { username, platform_id, action, money, orderId } = this.ctx.request.body;
      orderId = orderId ? `${orderId}_${platform_id}` : `${platform_id}${Date.now()}`;
      const user = await this.service.user.findByPlatformAndUsername(platform_id, username);

      if (money < 0) {
        this.ctx.body = {
          status: 1,
          msg: '分数不能小于等于0',
        };
        return;
      }
      if (money > 100000000) {
        this.ctx.body = {
          status: 1,
          msg: '分数不能超过1000000',
        };
        return;
      }

      const result = await this.service.api.platform.updateGameServerAccountMoney(username, money, platform_id, action, orderId);
      if (result.code == 0) {
        // 添加订单
        await this.ctx.model.Orders.create({
          order_id: orderId,
          user_id: user.id,
          agent_id: user.agent_id,
          pre_score: result.data.usernameCurMoney,
          score: money,
          current_score: action == 0 ? parseInt(result.data.usernameCurMoney) + parseInt(money) : parseInt(result.data.usernameCurMoney) - parseInt(money),
          type: action === 0 ? 1 : -1,
          status: 0,
          platform_id,
          create_time: new Date(),
          create_operator: '平台操作',
        });
        this.ctx.body = {
          status: 0,
          data: result,
        };
      } else {
        this.ctx.body = {
          status: 1,
          msg: '会员上分失败',
        };
      }
    } catch (error) {
      this.ctx.body = {
        status: 1,
        msg: '会员下分失败',
      };
    }


  }

  /**
     * 同步orders 表的数据
     */
  async syncOrder() {
    try {
      const { platform_id, index, limit } = this.ctx.request.query;
      const ordersResult = await this.service.orders.syncOrder(platform_id, index, limit);
      this.ctx.body = {
        status: 0,
        data: ordersResult,
      };
    } catch (error) {
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    }
  }

  /**
     * 同步player_data 表的数据
     */
  async syncPlayerData() {
    try {
      const { platform_id, index, limit } = this.ctx.request.query;
      const ordersResult = await this.service.dataStatistics.platformData.syncPlayerData(platform_id, index, limit);
      this.ctx.body = {
        status: 0,
        data: ordersResult,
      };
    } catch (error) {
      this.ctx.body = {
        status: 1,
        msg: '操作失败',
      };
    }
  }

  /**
   * B端每小时获取playerData接口
   */
  async agentUserPlayerData() {
    const { platform_id } = this.ctx.request.query;
    const date = moment().format('YYYYMMDD');
    const rows = await this.app.redis.hgetall(`playerDataAll:${date}`);
    const obj = {};
    Object.keys(rows).forEach(index => {
      const nIndex = index.split('-');
      const nPlatform_id = nIndex[1];
      const user_id = nIndex[0];
      const data = JSON.parse(rows[index]);
      if (nPlatform_id === platform_id) {
        if (obj[user_id]) {
          obj[user_id] += data.validBet || 0;
        } else {
          obj[user_id] = data.validBet || 0;
        }
      }
    });
    this.ctx.body = {
      data: obj,
      status: 0,
    };
  }

  async export() {
    const { ctx } = this;
    const params = ctx.request.body;
    const headers = [];
    const { platform_id, is_bet, user_id, s_usernamae } = params;
    let is_bet_str;
    if (is_bet == '') {
      is_bet_str = '所有';
    } else if (is_bet == '0') {
      is_bet_str = '无投注';
    } else if (is_bet == '1') {
      is_bet_str = '有投注';
    }
    const condition = [
      { t: `平台:${platform_id || '所有平台'}`, m1: 'A1', m2: 'A1' },
      { t: `投注数据:${is_bet_str}`, m1: 'B1', m2: 'B1' },
      { t: `会员id:${user_id}`, m1: 'C1', m2: 'C1' },
      { t: `会员账号:${s_usernamae}`, m1: 'D1', m2: 'D1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '会员id', f: 'id', totalRow: true },
      { t: '会员账号', f: 'username', totalRow: true },
      { t: '所属平台', f: 'platform_name', totalRow: true },
      { t: '余额', f: 'server_money', totalRow: true },
      { t: '总投注', f: 'valid_bet', totalRow: true },
      { t: '总赢分', f: 'win_gold', totalRow: true },
      { t: '总输分', f: 'lost_gold', totalRow: true },
      { t: '总抽水', f: 'deduct_gold', totalRow: true },
      { t: '总输赢', f: 'lost_win', totalRow: true },
      { t: '杀数', f: 'kill_number', totalRow: true },
      { t: '是否在线', f: 'isOnline', totalRow: true },
      { t: '创建时间', f: 'createdate', totalRow: true },
      { t: '最后登陆时间', f: 'lastlogintime', totalRow: true },
      { t: '状态', f: 'status', totalRow: true },
    ]);
    // const data = await this.service.dataStatistics.gameRecord.findAndCount(params);
    const data = await this.service.user.exportList(params);
    console.log('####################: ', JSON.stringify(data));

    const workbook = await this.service.exportExcel.generateExcel(headers, data.map(element => {
      // element = element.toJSON();
      element.platform_name = element.platform_info.platform_name;
      element.isOnline = element.isOnline ? '是' : '否';
      element.valid_bet = parseFloat((element.valid_bet / 100).toFixed(2));
      element.win_gold = parseFloat(((element.win_gold - element.deduct_gold) / 100).toFixed(2));
      element.lost_gold = parseFloat(-(element.lost_gold / 100).toFixed(2));
      element.deduct_gold = parseFloat((element.deduct_gold / 100).toFixed(2));
      element.lost_win = parseFloat((element.lost_win / 100).toFixed(2));
      element.kill_number = `${parseFloat((element.valid_bet ? ((element.lost_gold / element.valid_bet) * 100) : 0).toFixed(2))}%`;
      element.status = element.status == 0 ? '正常' : '禁用';
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('会员列表') + '.xlsx');
    ctx.body = workbook;
  }

  // B端查询玩家信息接口
  async bFindUserInfo() {
    // const { usernames, platform_id } = this.ctx.request.body;
    const params = this.ctx.request.body;
    console.log('params: ', params);
    const result = await this.service.user.bFindAll(params);
    // console.log(result);
    this.ctx.body = {
      data: result,
      msg: '',
      code: 0,
    };
  }
}

module.exports = UsernameManageController;
