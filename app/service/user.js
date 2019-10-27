/* eslint-disable no-unused-vars */
/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';


const Service = require('egg').Service;
const moment = require('moment');
const request = require('request');
const qs = require('querystring');
const code = require('../tools/statusCode');
const usernameActionList = {};// 正在登录上下分玩家列表
const _ = require('lodash');

class UserService extends Service {

  /**
   * 查询会员列表
   * @param {*} params
   */
  async findAll(params) {
    const { orderField, orderType } = params;
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = { is_upper_score: 1 };
    const where1 = {};
    if (params.s_usernamae) {
      where.username = {
        [Op.like]: `%${params.s_usernamae}%`,
      };
    }
    if (params.user_id) { // 会员id
      where.id = params.user_id;
    }
    if (params.is_bet != undefined && params.is_bet != '') {
      where.is_bet = params.is_bet;
    }
    if (params.agent_id != '0' && params.agent_id != '' && params.agent_id != undefined) { // 代理
      where.agent_id = params.agent_id;
    }
    if (params.platform_id != '0' && params.platform_id != '') { // 代理
      where.platform_id = params.platform_id;
    }
    let { rows, count } = await this.ctx.model.UserAccount.findAndCountAll({
      where,
      order: [[ 'id', 'ASC' ]],
      group: 'user_account.id',
      offset: (parseInt(params.page) - 1) * parseInt(params.limit), // 每页起始位置
      limit: parseInt(params.limit),
      include: [
        {
          where: where1,
          model: this.ctx.model.PlatformInfo,
          attributes: [ 'platform_name' ],
        },
      ],
    });
    rows = JSON.parse(JSON.stringify(rows));
    let usernames = '';
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    for (let i = 0; i < rows.length; i++) {
      usernames += rows[i].username + '@' + rows[i].platform_id; // 拼接用户名
      if (i < rows.length - 1) usernames += ',';

      const item = playerDataAll[rows[i].username + '@' + rows[i].platform_id];
      if (item) {
        rows[i].valid_bet = parseInt(item.validBet || 0); // dq 10-15
        rows[i].win_gold = parseInt(item.winGold || 0);
        rows[i].lost_gold = parseInt(item.lostGold || 0);
        rows[i].lost_win = (parseInt(item.winGold || 0) - parseInt(item.lostGold || 0)) - parseInt(item.deductGold || 0); // dq
        rows[i].deduct_gold = parseInt(item.deductGold || 0);
      } else {
        rows[i].valid_bet = 0;
        rows[i].win_gold = 0;
        rows[i].lost_gold = 0;
        rows[i].lost_win = 0;
        rows[i].deduct_gold = 0;
      }
    }

    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerData = await this.service.tools.sendServerGetRequest(url, 5000);
    // 拼接是否在线;
    if (playerData && playerData.players) {
      for (let i = 0; i < rows.length; i++) {
        const item = playerData.players[rows[i].username + '@' + rows[i].platform_id];
        if (item) {
          rows[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
          rows[i].server_money = item.gold || 0;
        } else { // dq
          rows[i].isOnline = false;
          rows[i].server_money = 0;
        }
      }
    }
    count = count.length;
    // console.log('rows: ', JSON.stringify(rows));
    const result = _.sortBy(rows, function(o) {
      if (orderType == 'asc') {
        return o[orderField];
      }
      return -1 * o[orderField];
    });
    // console.log(result);
    return { rows: result, count };
  }


  async bFindAll(params) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = { is_upper_score: 1 };
    if (params.usernames) {
      where.username = {
        [Op.in]: params.usernames.split(','),
      };
    }
    if (params.is_bet != undefined && params.is_bet != '') {
      where.is_bet = params.is_bet;
    }
    if (params.platform_id) {
      where.platform_id = params.platform_id;
    }
    let rows = await this.ctx.model.UserAccount.findAll({
      where,
    });
    rows = JSON.parse(JSON.stringify(rows));
    console.log('#############: ', rows);
    let usernames = '';
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    for (let i = 0; i < rows.length; i++) {
      usernames += rows[i].username + '@' + rows[i].platform_id; // 拼接用户名
      if (i < rows.length - 1) usernames += ',';

      const item = playerDataAll[rows[i].username + '@' + rows[i].platform_id];
      if (item) {
        rows[i].valid_bet = parseInt(item.validBet || 0);
        rows[i].win_gold = parseInt(item.winGold || 0);
        rows[i].lost_gold = parseInt(item.lostGold || 0);
        rows[i].lost_win = parseInt(item.winGold || 0) - parseInt(item.lostGold || 0);
        rows[i].deduct_gold = parseInt(item.deductGold || 0);
      } else {
        rows[i].valid_bet = 0;
        rows[i].win_gold = 0;
        rows[i].lost_gold = 0;
        rows[i].lost_win = 0;
        rows[i].deduct_gold = 0;
      }
    }

    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerData = await this.service.tools.sendServerGetRequest(url, 5000);
    // 拼接是否在线;
    if (playerData && playerData.players) {
      for (let i = 0; i < rows.length; i++) {
        const item = playerData.players[rows[i].username + '@' + rows[i].platform_id];
        if (item) {
          rows[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
          rows[i].server_money = item.gold || 0;
        }
      }
    }
    console.log('@@@@@@@@@@@@@: ', JSON.stringify(rows));
    return rows;
  }

  /**
   * 添加
   * @param {*} username
   */
  async saveUser(params) {
    console.log('----------------');
    console.log(params);
    return await this.ctx.model.UserAccount.create({
      username: params.username,
      platform_id: params.platform_id,
      status: params.status,
      createdate: new Date(),
    });

  }

  /**
   * 查询平台名称和id
   */
  async findPlatformInfo() {
    return await this.ctx.model.PlatformInfo.findAndCountAll({
      attributes: [ 'platform_id', 'platform_name' ],
    });
  }

  /**
   * 根据用户名称查询玩家
   * @param {*} username
   */
  async findByusername(username) {
    return await this.ctx.model.UserAccount.findOne({
      where: {
        username,
      },
    });
  }

  /**
  * 根据平台和用户名称查询玩家
  * @param {*} platform_id
  * @param {*} username
  */
  async findByPlatformAndUsername(platform_id, username) {
    return await this.ctx.model.UserAccount.findOne({
      where: {
        platform_id: parseInt(platform_id),
        username,
      },
    });
  }

  /**
   * 玩家有上分操作,更新IsupperScore字段
   */
  async updateIsUpperScore(platform_id, username) {
    return await this.ctx.model.UserAccount.update(
      {
        is_upper_score: 1,
      },
      {
        where: { platform_id: parseInt(platform_id), username } }
    );
  }

  /**
   * 根据昵称查询玩家
   * @param {*} nickname
   */
  async findByNickname(nickname) {
    return await this.ctx.model.UserAccount.findOne({
      where: {
        nickname,
      },
    });
  }


  /**
   * 根据id 查询玩家
   * @param {*} id
   */
  async findById(id) {
    return await this.ctx.model.UserAccount.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * 根据id 查询玩家
   * @param {*} id
   */
  async findByIdNotInclud(id) {
    return await this.ctx.model.UserAccount.findOne({
      where: {
        id,
      },
      attributes: { // 查询排除 password 以外的其他字段
        exclude: [ 'password' ],
      },
    });
  }

  /**
   * 查询平台下所有会员的金额
   */
  async findUserMoney() {
    const Sequelize = this.ctx.model.Sequelize;
    return await this.ctx.model.UserAccount.findOne({
      attributes: [
        [ Sequelize.fn('SUM', Sequelize.col('money')), 'money' ],
      ],
    });
  }

  /**
   * 查询开始时间到结束时间的注册人数
   * @param {*} start
   * @param {*} end
   */
  // async findRegisterCountByDate(platform_id, start, end) {
  //   start = moment(start).format('YYYY-MM-DD HH:mm:ss');
  //   end = moment(end).format('YYYY-MM-DD HH:mm:ss');
  //   const Op = this.ctx.model.Sequelize.Op;
  //   const where = {
  //     createdate: {
  //       [Op.gte]: start,
  //       [Op.lte]: end,
  //     },
  //   };
  //   if (platform_id) {
  //     where.platform_id = platform_id;
  //   }
  //   return await this.ctx.model.UserAccount.count({
  //     where,
  //   });
  // }
  /**
   * 查询开始时间到结束时间的注册并上分人数
   * @param {*} start
   * @param {*} end
   */
  async findRegisterCountByDate(platform_id, start, end) {
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    let sql = `SELECT COUNT(DISTINCT id) as register_count from user_account as ua LEFT JOIN orders as o on ua.id=o.user_id  where (createdate BETWEEN '${start}' and '${end}') and type =1 `;
    if (platform_id) {
      sql += ` and ua.platform_id = ${platform_id}`;
    }

    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }
  async findRegisterBetCountByDate(platform_id, start, end) {
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    let sql = `SELECT COUNT(DISTINCT id) as new_bet_number from user_account as ua LEFT JOIN orders as o on ua.id=o.user_id  where createdate BETWEEN '${start}' and '${end}' and type in (2,-2)`;
    if (platform_id) {
      sql += ` and ua.platform_id = ${platform_id}`;
    }
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }

  async getUserLogin(platform_id, start, end) {
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    let sql = `select count(DISTINCT username) as count from user_login_hall where login_time between '${start}' and '${end}'`;
    if (platform_id) {
      sql += ` and platform_id = ${platform_id}`;
    }
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }

  async findRegisterUserByDate(start, end) {
    start = moment(start).format('YYYY-MM-DD HH:mm:ss');
    end = moment(end).format('YYYY-MM-DD HH:mm:ss');
    const Op = this.ctx.model.Sequelize.Op;
    return await this.ctx.model.UserAccount.findAll({
      where: {
        createdate: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
    });
  }

  /**
   * 会员新增
   * @param {*} params
   */
  async create(params) {
    const data = {};
    Object.keys(params).forEach(key => {
      if (params[key] != undefined) {
        data[key] = params[key];
      }
    });
    if (!params.pid) {
      params.pid = 0;
    }
    data.createdate = new Date();
    // 事务创建会员账户
    let transaction;
    try {
      // egg-sequelize会将sequelize实例作为app.model对象
      // console.log('user:@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', user);
      /* 会员添加到上级会员的cid中 */
      const p_user = await this.ctx.model.UserAccount.findOne({
        where: { id: params.pid },
      }, { transaction });
      transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
      console.log('p_user: ', p_user);
      let user;
      if (p_user) {
        data.level = p_user.level + 1; // 保存用的全民代level,上级level+1
        user = await this.ctx.model.UserAccount.create(data, { transaction });
        let cid;
        if (!p_user.cid) {
          cid = [];
        } else {
          cid = p_user.cid.split(',');
        }
        cid.push(user.id);
        cid = cid.join(',');
        await this.ctx.model.UserAccount.update(
          { cid },
          { where: { id: p_user.id } },
          { transaction }
        );
      } else {
        user = await this.ctx.model.UserAccount.create(data, { transaction });
      }
      /* 会员添加到上级会员的cid中end */
      const result = await this.updateUserToGameServer(params);
      if (result) {
        await transaction.commit();
        return user;
      }
    } catch (err) {
      await transaction.rollback();
      // throw new Error('同步会员账户到游戏服务端失败！');
      return null;
    }

  }

  /**
   * 将注册或者添加会员账户同步到游戏服务端
   * @param {*} params
   */
  async updateUserToGameServer(params) {
    const url = this.app.config.gameServerURl + 'onPlayerlogin?' + qs.stringify({ account: params.username, money: 0, agent: this.app.config.defualtPlatformId, lineCode: params.agent_id, lang: '', regIp: params.ip || '', nickname: params.nickname });
    console.log('reqGameServerPlayerInfo-url:', url);
    return await new Promise((resolve, reject) => {
      request({ url, timeout: 5000 }, (error, response, responseData) => {
        if (error || response.statusCode != 200 || responseData == '') {
          reject(new Error('同步会员账户到游戏服务端失败！'));
          return;
        }
        responseData = JSON.parse(responseData);
        if (responseData.code != 0) {
          reject(new Error('同步会员账户到游戏服务端失败！'));
          return;
        }
        resolve({ usernameCurMoney: responseData.money });
      });
    }).then(data => {
      return data;
    }).catch(error => {
      this.ctx.logger.error(error);
      return null;
    });
  }

  /**
   * 会员编辑
   * @param {*} params
   */
  async edit(params) {
    return await this.ctx.model.UserAccount.update({
      nickname: params.nickname,
      real_ame: params.real_ame,
      sex: params.sex,
      email: params.email,
      mobile_phone: params.mobile_phone,
    }, {
      where: {
        id: params.id,
      },
    });
  }


  /**
   * 根据给定添加更新给定数据
   * @param {*} params 更新参数
   * @param {*} where 更新条件
   */
  async updateVariableParam(params, where) {
    return await this.ctx.model.UserAccount.update(params, {
      where,
    });
  }

  /**
   * 修改会员密码
   * @param {*} params
   */
  async editPassword(params) {
    return await this.ctx.model.UserAccount.update({
      password: params.password,
    }, {
      where: {
        mobile_phone: params.mobile_phone,
      },
    });
  }

  /**
   * 修改会员账号
   * @param {*} params
   */
  async editNickname(params) {
    return await this.ctx.model.UserAccount.update({
      nickname: params.nickname,
    }, {
      where: {
        id: params.id,
      },
    });
  }

  /**
   * 查询玩家监控所需数据
   * @param {*} username
   * @param {*} page
   * @param {*} limit
   */
  async findUserMonitor(username, page, limit, platform_id, userMonitor) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = { is_upper_score: 1 };
    const where1 = {};
    if (username != '' && username != null && username != undefined) {
      where.username = {
        [Op.like]: '%' + username + '%',
      };
    }
    if (platform_id != 0 && platform_id != null && platform_id != undefined) {
      where.platform_id = platform_id;
    }
    if (!userMonitor) {
      userMonitor = await this.service.userMonitor.findById(1);
    }
    const { kill_number_gt = 0.04, kill_number_lt = 0.01, bet_count = 10, today_kill_number_gt = 0, today_kill_number_lt = 0,
      today_bet_count = 10, h_today_bet_count = 10,
      h_kill_number_gt = 0.04, h_kill_number_lt = 0.01, h_bet_count = 10, h_today_kill_number_gt = 0, h_today_kill_number_lt = 0,
    } = userMonitor || { kill_number_gt: 0.04, kill_number_lt: 0.01, bet_count: 10, today_kill_number_gt: 0, today_kill_number_lt: 0,
      h_kill_number_gt: 0.04, h_kill_number_lt: 0.01, h_bet_count: 10, h_today_kill_number_gt: 0, h_today_kill_number_lt: 0 };
    let result = await this.ctx.model.UserAccount.findAll({
      where,
      include: [
        {
          model: this.ctx.model.PlatformInfo,
          where: where1,
          attributes: [ 'platform_id', 'platform_name' ],
        },
        {
          model: this.ctx.model.UserKillRecord,
          // attributes: [ 'platform_id', 'platform_name' ],
        },

      ],
    });
    result = JSON.parse(JSON.stringify(result));
    const users = [];
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    const playerDataToday = await this.service.dataStatistics.playerData.getPlayerDataAll();
    // const today = moment().format('YYYYMMDD');
    // const playerData = await this.app.redis.get(`playerDataAll:${today}`);

    const highLight = [];
    for (let i = 0; i < result.length; i++) {
      const item = playerDataAll[result[i].username + '@' + result[i].platform_id ];
      const todayData = playerDataToday[result[i].username + '-' + result[i].platform_id ];
      if (item) {
        if (!result[i].PlayerData) {
          result[i].PlayerData = {
            win_gold: 0,
            lost_gold: 0,
            valid_bet: 0,
            kill_gold: 0,
          };
        }
        result[i].PlayerData.win_gold = parseInt(item.winGold || 0);
        result[i].PlayerData.lost_gold = parseInt(item.lostGold || 0);
        result[i].PlayerData.valid_bet = parseInt(item.validBet || 0);
        result[i].PlayerData.total_games = parseInt(item.totalGames || 0);
        result[i].PlayerData.deduct_gold = parseInt(item.deductGold || 0);
      }
      if (todayData) {
        if (!result[i].todayData) {
          result[i].todayData = {
            win_gold: 0,
            lost_gold: 0,
            valid_bet: 0,
            kill_gold: 0,
            deductGold: 0,
          };
        }
        result[i].todayData.win_gold = parseInt(todayData.winGold || 0);
        result[i].todayData.lost_gold = parseInt(todayData.lostGold || 0);
        result[i].todayData.valid_bet = parseInt(todayData.validBet || 0);
        result[i].todayData.total_games = parseInt(todayData.totalGames || 0);
        result[i].todayData.deductGold = parseInt(todayData.deductGold || 0);
        result[i].todayData.totalGames = parseInt(todayData.totalGames || 0);
      }
      if (result[i] && result[i].PlayerData) {
        if ((result[i].PlayerData.lost_gold - result[i].PlayerData.win_gold) / result[i].PlayerData.valid_bet >= kill_number_gt ||
        (result[i].PlayerData.lost_gold - result[i].PlayerData.win_gold) / result[i].PlayerData.valid_bet <= kill_number_lt ||
        result[i].todayData && ((result[i].todayData.lost_gold - result[i].todayData.win_gold + result[i].todayData.deductGold) / result[i].todayData.valid_bet >= today_kill_number_gt ||
        (result[i].todayData.lost_gold - result[i].todayData.win_gold + result[i].todayData.deductGold) / result[i].todayData.valid_bet <= today_kill_number_lt &&
        result[i].PlayerData.total_games >= bet_count && result[i].todayData.totalGames >= today_bet_count)) {
          users.push({
            id: result[i].id,
            username: result[i].username,
            platform_id: result[i].platform_id,
            platform_name: result[i].platform_info.platform_name,
            status: result[i].status,
            PlayerData: {
              total_games: result[i].PlayerData.total_games,
              win_gold: result[i].PlayerData.win_gold,
              lost_gold: result[i].PlayerData.lost_gold,
              valid_bet: result[i].PlayerData.valid_bet,
              deduct_gold: result[i].PlayerData.deduct_gold,
            },
            todayData: {
              total_games: result[i].todayData ? result[i].todayData.total_games : 0,
              win_gold: result[i].todayData ? result[i].todayData.win_gold : 0,
              lost_gold: result[i].todayData ? result[i].todayData.lost_gold : 0,
              valid_bet: result[i].todayData ? result[i].todayData.valid_bet : 0,
              deductGold: result[i].todayData ? result[i].todayData.deductGold : 0,
            },
            userKillRecord: {
              status: result[i] && result[i].user_kill_record && result[i].user_kill_record.status,
            },
          });
        }
      }
    }
    const count = users.length;
    return { result: users.slice((page - 1) * limit, page * limit), count };
  }


  /**
   * 查询玩家输赢数据
   */
  async findUserData(is_realtime, agent_id, room_id, username, start_date, end_date, page, limit, game_id) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = {};
    if (username != '') {
      where.username = {
        [ Op.like ]: '%' + username + '%',
      };
    }
    if (agent_id != '' && agent_id != '0') {
      where.agent_id = agent_id;
    }

    const playerDataWhere = {
      create_time: {
        [Op.gte]: start_date,
        [Op.lte]: end_date,
      },
    };
    if (room_id != '' && room_id != '0') { // 房间
      playerDataWhere.room_id = room_id;
    }

    let { rows: userAccounts, count } = await this.ctx.model.UserAccount.findAndCountAll({
      where,
      include: [
        {
          model: this.ctx.model.PlayerData,
          as: 'PlayerData',
          attributes: [
            'room_id',
            [ Sequelize.fn('SUM', Sequelize.col('win_gold')), 'win_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('lost_gold')), 'lost_gold' ],
            [ Sequelize.fn('SUM', Sequelize.col('deduct_gold')), 'deduct_gold' ],
          ],
          required: false,
          where: playerDataWhere,
        },
        {
          model: this.ctx.model.AgentAccount,
          attributes: [ 'id', 'username' ],
        },
      ],
      attributes: [
        'id',
        'username',
        'nickname',
        'lastlogintime',
      ],
      subQuery: false,
      group: 'user_account.username',
      offset: (page - 1) * limit, // 每页起始位置
      limit,
    });
    userAccounts = JSON.parse(JSON.stringify(userAccounts));
    let usernames = '';
    let playerDataAll = {};

    for (let i = 0; i < userAccounts.length; i++) {
      usernames += userAccounts[i].username;
      if (i < userAccounts.length - 1) usernames += ',';
    }

    if (is_realtime) { // 是否只看实时数据，这里的实时数据是总的实时数据
      playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();

      for (let i = 0; i < userAccounts.length; i++) {
        const item = playerDataAll[userAccounts[i].username];
        if (item) {
          if (!userAccounts[i].PlayerData) {
            userAccounts[i].PlayerData = {
              win_gold: 0,
              lost_gold: 0,
            };
          }
          userAccounts[i].PlayerData.win_gold = parseInt(item.winGold || 0);
          userAccounts[i].PlayerData.lost_gold = parseInt(item.lostGold || 0);
        }
      }
    }

    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerData = await this.service.tools.sendServerGetRequest(url, 5000);
    // 拼接是否在线
    if (playerData && playerData.players) {
      for (let i = 0; i < userAccounts.length; i++) {
        const item = playerData.players[userAccounts[i].username];
        if (item) {
          userAccounts[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
        }
      }
    }

    return { rows: userAccounts, count: count.length };
  }


  /**
     * 查询玩家信息
     */
  async findUsername(username, status, page, limit) {
    const where = {};
    if (username) {
      where.username = username;
    }
    if (status != '-1') {
      where.status = status;
    }
    const { rows: result, count } = await this.ctx.model.UserAccount.findAndCountAll({
      where,
      order: [[ 'status', 'desc' ], [ 'lastlogintime', 'desc' ]],
      offset: (parseInt(page) - 1) * parseInt(limit), // 每页起始位置
      limit: parseInt(limit),
    });

    let usernames = '';
    for (let i = 0; i < result.length; i++) {
      usernames += result[i].username + '@' + result[i].platform_id;
      if (i < result.length - 1) {
        usernames += ',';
      }
    }
    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerData = await this.service.tools.sendServerGetRequest(url, 5000);

    // 拼接是否在线
    if (playerData && playerData.players) {
      for (let i = 0; i < result.length; i++) {
        const item = playerData.players[result[i].username + '@' + result[i].platform_id];
        if (item) {
          result[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
          result[i].gold = item.gold;
        }
      }
    }

    return { result, count };
  }

  /**
     * 查询玩家信息和玩家数据-追杀放水
     */
  async findUsernameAndPlayerData(platform_id, agent_id, username, page, limit) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where1 = {};
    const where = {
      is_upper_score: 1,
      username: {
        [Op.like]: '%' + username + '%',
      },
    };

    const UserKillInclude = {
      model: this.ctx.model.UserKillRecord,
    };
    if (username == '') {
      UserKillInclude.where = {
        status: 1,
      };
    }

    if (platform_id != '0') {
      where.platform_id = platform_id;
    }

    if (agent_id != undefined && agent_id != '' && agent_id != '0') {
      where.agent_id = agent_id;
    }

    if (page && limit) {
      page = (parseInt(page) - 1) * parseInt(limit);
      limit = parseInt(limit);
    }
    let { rows: result, count } = await this.ctx.model.UserAccount.findAndCountAll({
      where,
      include: [
        UserKillInclude,
        {
          model: this.ctx.model.PlatformInfo,
          where: where1,
          attributes: [ 'platform_id', 'platform_name' ],
        },
      ],
      offset: page,
      limit,
    });

    let usernames = '';
    result = JSON.parse(JSON.stringify(result));

    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll(); // 历史总玩家数据
    const toDatplayerData = await this.service.dataStatistics.playerData.getPlayerDataAll(); // 今日玩家数据
    for (let i = 0; i < result.length; i++) {
      const name = result[i].username + '@' + result[i].platform_id;
      usernames += name;
      if (i < result.length - 1) usernames += ',';

      const item = playerDataAll[name] || {};
      const toDayItem = toDatplayerData[result[i].username + '-' + result[i].platform_id] || {};

      const lost_win = (parseInt(item.winGold || 0) - parseInt(item.deductGold || 0)) - parseInt(item.lostGold || 0);
      const validBet = item.validBet || 0;
      result[i].lost_win = lost_win; // 历史输赢
      result[i].valid_bet = validBet;
      result[i].total_games = item.totalGames || 0;

      result[i].all_killNumber = validBet ? lost_win / validBet : 0; // 总杀数
      result[i].kill_gold = parseInt(item.killGold || 0);
      result[i].kill_win_gold = parseInt(item.killWinGold || 0);
      result[i].kill_lost_gold = parseInt(item.killLostGold || 0);


      const today_lost_win = (parseInt(toDayItem.winGold || 0) - parseInt(toDayItem.deductGold || 0)) - parseInt(toDayItem.lostGold || 0);
      const todayValidBet = toDayItem.validBet || 0;
      result[i].today_lost_win = today_lost_win; // 今日输赢
      result[i].today_valid_bet = todayValidBet; // 今日有效投注
      result[i].today_killNumber = todayValidBet ? today_lost_win / todayValidBet : 0; // 今日杀数
      result[i].today_total_games = toDayItem.totalGames || 0;

    }

    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerDataServer = await this.service.tools.sendServerGetRequest(url, 5000);

    // 拼接是否在线
    if (playerDataServer && playerDataServer.players) {
      for (let i = 0; i < result.length; i++) {
        const item = playerDataServer.players[result[i].username + '@' + result[i].platform_id];
        if (item) {
          result[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
        }
      }
    }

    return {
      result,
      count,
    };
  }

  /**
   * 设置追杀
   * @param {*} user_id
   * @param {*} kill_status
   * @param {*} kill_money
   * @param {*} kill_remark
   */
  async playerKill(user_id, kill_status, kill_money, kill_remark, operator) {
    const user = await this.service.user.findById(user_id);
    const url = this.app.config.gameServerURl + 'killAccount?account=' + user.username + '&killStatus=' + kill_status + '&agent=' + user.platform_id;
    // 更新服务器玩家状态
    const resData = await this.service.tools.sendServerGetRequest(url, 5000);
    if (!resData || resData.code != 0) {
      return {
        code: 1,
        msg: '更新服务器玩家失败！',
      };
    }

    await this.ctx.model.UserKillRecord.findOrCreate({
      where: {
        user_id,
      },
      defaults: {
        user_id,
        status: kill_status,
        kill_money: kill_money * 100,
        rest_kill_number: kill_money * 100,
        kill_remark,
        update_time: new Date(),
        operator: this.ctx.session.admin ? this.ctx.session.admin.username : operator,
      },
    }).spread(async (data, created) => {
      if (created === false) {
        this.ctx.service.killNumber.saveKillLog('会员杀放', kill_status == 1 ? `开始追杀(${user.username})` : `结束追杀(${user.username})`, data.kill_money, kill_money);
        return await this.ctx.model.UserKillRecord.update(
          {
            status: kill_status,
            kill_money: kill_money * 100,
            rest_kill_number: kill_money * 100,
            kill_remark,
            update_time: new Date(),
            operator: this.ctx.session.admin ? this.ctx.session.admin.username : operator,
          },
          {
            where: {
              user_id,
            },
          }
        );
      }
      this.ctx.service.killNumber.saveKillLog('会员杀放', `开始追杀(${user.username})`, data.kill_money, kill_money);
      return data;
    });

    return {
      code: 0,
    };
  }

  /**
   * 根据id获取会员追杀信息
   */
  async getUserKill(user_id) {
    return await this.ctx.model.UserKillRecord.findOne({
      where: {
        user_id,
      },
    });
  }


  async updateAccountMoneyByDataBase(username, money) {
    return await this.ctx.model.UserAccount.update({
      money,
    }, {
      where: { username },
    });
  }

  /**
   * 修改用户状态
   * @param {*} id
   * @param {*} status
   */
  async changeUserStatus(id, status) {
    return await this.ctx.model.UserAccount.update(
      { status },
      { where: { id } }
    );
  }

  /**
   * 用户追杀中更新追杀金额
   * @param {*} record
   */
  async killUser(record) {
    const user = await this.ctx.model.UserAccount.findOne({
      where: {
        username: record.name,
      },
      include: [
        {
          model: this.ctx.model.UserKillRecord,
        },
      ],
    });

    if (user && user.user_kill_record && user.user_kill_record.status == 1) {
      console.log('追杀中');
      if (record.win < 0) {
        const money = user.user_kill_record.rest_kill_number - Math.abs(record.win);
        await this.ctx.model.UserKillRecord.update(
          {
            rest_kill_number: money,
          },
          {
            where: {
              user_id: user.id,
            },
          }
        );
        if (money <= 0) {
          this.playerKill(user.id, 0, 0, '系统描述：追杀金额达到设定值，已自动取消追杀！');
        }
      }
    }
  }

  async getUsrInfoBase() {
    const Op = this.ctx.model.Sequelize.Op;
    const user = await this.ctx.model.UserAccount.count({
      where: {
        username: {
          [Op.like]: 'K@\%',
        },
      },
    });

    const tourist = await this.ctx.model.UserAccount.count({
      where: {
        username: {
          [Op.notLike]: 'K@\%',
        },
      },
    });
    return { user, tourist };
  }

  /**
 * 根据用户level获取该层级用户
 * @param {*} level 用户level
 */
  async getUsersBylevel(level) {
    return await this.ctx.model.UserAccount.findAll({
      where: { level },
    });
  }

  /**
   * 获取用户最低的level层级
   */
  async getUserAgentBottomLevel() {
    const sql = 'select max(level) as level from user_account';
    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    console.log(JSON.stringify(result));
    return result[0].level;
  }

  async updateUserCommission(id, commission) {
    await this.ctx.model.UserAccount.increment(
      { commission },
      { where: { id } }
    );
  }

  /**
 * 根据代理id获取会员信息
 * @param {} agent_id 代理id
 */
  async getUsersByAgentId(agent_id) {
    return await this.ctx.model.UserAccount.findAll({
      where: { agent_id },
    });
  }


  async findUserDataInfoByPlatform(username, platform_id, page, limit, userMonitor, agent_id, usernames) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = { is_upper_score: 1 };
    if (username != '' && username != null && username != undefined) {
      where.username = {
        [Op.like]: '%' + username + '%',
      };
    }
    if (usernames) {
      const list = usernames.split(',');
      where.username = {
        [Op.in]: list,
      };
    }
    if (platform_id != 0 && platform_id != null && platform_id != undefined) {
      where.platform_id = platform_id;
    }
    if (agent_id != 0 && agent_id != null && agent_id != undefined) {
      where.agent_id = agent_id;
    }

    if (!userMonitor) {
      userMonitor = await this.service.userMonitor.findById(1);
    }
    const { kill_number_gt = 0.04, kill_number_lt = 0.01, bet_count = 100, today_kill_number_gt = 0, today_kill_number_lt = 0,
      h_kill_number_gt = 0.04, h_kill_number_lt = 0.01, h_bet_count = 100, h_today_kill_number_gt = 0, h_today_kill_number_lt = 0,
    } = userMonitor || { kill_number_gt: 0.04, kill_number_lt: 0.01, bet_count: 100, today_kill_number_gt: 0, today_kill_number_lt: 0,
      h_kill_number_gt: 0.04, h_kill_number_lt: 0.01, h_bet_count: 100, h_today_kill_number_gt: 0, h_today_kill_number_lt: 0 };
    let result = await this.ctx.model.UserAccount.findAll({
      where,
      include: [
        {
          model: this.ctx.model.PlatformInfo,
          attributes: [ 'platform_id', 'platform_name' ],
        },
        // {
        //   model: this.ctx.model.AgentAccount,
        //   attributes: [ 'id', 'username' ],
        // },
        {
          model: this.ctx.model.UserKillRecord,
        },
      ],
    });
    result = JSON.parse(JSON.stringify(result));
    const users = [];
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    const playerDataToday = await this.service.dataStatistics.playerData.getPlayerDataAll();
    for (let i = 0; i < result.length; i++) {
      const item = playerDataAll[result[i].username + '@' + result[i].platform_id ];
      const todayData = playerDataToday[result[i].username + '-' + result[i].platform_id ];
      if (item) {
        if (!result[i].PlayerData) {
          result[i].PlayerData = {
            win_gold: 0,
            lost_gold: 0,
            valid_bet: 0,
            kill_gold: 0,
            deduct_gold: 0,
          };
        }
        result[i].PlayerData.win_gold = parseInt(item.winGold || 0);
        result[i].PlayerData.lost_gold = parseInt(item.lostGold || 0);
        result[i].PlayerData.valid_bet = parseInt(item.validBet || 0);
        result[i].PlayerData.total_games = parseInt(item.totalGames || 0);
        result[i].PlayerData.deduct_gold = parseInt(item.deductGold || 0);

        if (todayData) {
          if (!result[i].todayData) {
            result[i].todayData = {
              win_gold: 0,
              lost_gold: 0,
              valid_bet: 0,
              kill_gold: 0,
              deductGold: 0,
            };
          }
          result[i].todayData.win_gold = parseInt(todayData.winGold || 0);
          result[i].todayData.lost_gold = parseInt(todayData.lostGold || 0);
          result[i].todayData.valid_bet = parseInt(todayData.validBet || 0);
          result[i].todayData.total_games = parseInt(todayData.totalGames || 0);
          result[i].todayData.deductGold = parseInt(todayData.deductGold || 0);
        }
      }
      try {
        if (result[i] && result[i].PlayerData) {
          if ((result[i].PlayerData.lost_gold - result[i].PlayerData.win_gold) / result[i].PlayerData.valid_bet >= kill_number_gt ||
            (result[i].PlayerData.lost_gold - result[i].PlayerData.win_gold) / result[i].PlayerData.valid_bet <= kill_number_lt ||
            result[i].todayData && ((result[i].todayData.lost_gold - result[i].todayData.win_gold + result[i].todayData.deductGold) / result[i].todayData.valid_bet >= today_kill_number_gt ||
            (result[i].todayData.lost_gold - result[i].todayData.win_gold + result[i].todayData.deductGold) / result[i].todayData.valid_bet <= today_kill_number_lt &&
            result[i].PlayerData.total_games >= bet_count)) {
            users.push({
              id: result[i].id,
              username: result[i].username,
              platform_id: result[i].platform_id,
              platform_name: result[i].platform_info.platform_name,
              agent_id: result[i].agent_id,
              total_games: result[i].PlayerData.total_games,
              win_gold: result[i].PlayerData.win_gold,
              lost_gold: result[i].PlayerData.lost_gold,
              valid_bet: result[i].PlayerData.valid_bet,
              deduct_gold: result[i].PlayerData.deduct_gold,
              status: result[i].status,
              todayData: {
                total_games: result[i].todayData && result[i].todayData.total_games || 0,
                win_gold: result[i].todayData && result[i].todayData.win_gold || 0,
                lost_gold: result[i].todayData && result[i].todayData.lost_gold || 0,
                valid_bet: result[i].todayData && result[i].todayData.valid_bet || 0,
                deductGold: result[i].todayData && result[i].todayData.deductGold || 0,
              },
              userKillRecord: {
                status: result[i] && result[i].user_kill_record && result[i].user_kill_record.status,
              },
            });
          }
        }
      } catch (err) {
        console.log(err);
      }

    }
    const count = users.length;
    return { result: users.slice((page - 1) * limit, page * limit), count };
  }


  /**
   * B端玩家数据
   * @param {*} usernames
   * @param {*} platform_id
   */
  async findUserDataInfoByPlatformAll(usernames, platform_id) {
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    const usernameArr = usernames.split(',');
    const resultData = {};
    for (let i = 0; i < usernameArr.length; i++) {
      const item = playerDataAll[usernameArr[i] + '@' + platform_id ];
      if (item) {
        resultData[usernameArr[i]] = {
          win_gold: parseInt(item.winGold || 0),
          lost_gold: parseInt(item.lostGold || 0),
          valid_bet: parseInt(item.validBet || 0),
          total_games: parseInt(item.totalGames || 0),
          deduct_gold: parseInt(item.deductGold || 0),
          lost_win: parseInt(item.winGold || 0) - parseInt(item.lostGold || 0),
        };
      }
    }
    return resultData;
  }

  /**
   * 获取一段时间的总注册人数
   * @param {*} start_date
   * @param {*} end_date
   * @param {*} platformId
   */
  async getDateRegisterAll(start_date, end_date, platformId) {

    if (start_date.length == 10) {
      start_date = start_date + ' 00:00:00';
    }

    if (end_date.length == 10) {
      end_date = end_date + ' 23:59:59';
    }

    let sql_total = `select count(*) as total from user_account where is_upper_score = 1 and createdate<'${start_date}'`;

    let sqlWhere = '';
    if (platformId) {
      sqlWhere = ` and platform_id = ${platformId}`;
      sql_total += ` and platform_id = ${platformId}`;
    }

    const sql = `SELECT
        DATE_FORMAT(createdate, '%Y-%m-%d') create_time,
        COUNT(id) regist_count
      FROM
    user_account
    WHERE
    createdate >= "${start_date}" and createdate <= "${end_date}" and  is_upper_score = 1  ${sqlWhere}
    AND platform_id = 1
    GROUP BY
    DATE_FORMAT(createdate, '%Y-%m-%d')`;

    // const sql = `SELECT
    //   DATE_FORMAT(createdate, '%Y-%m-%d') create_time,
    //   COUNT(id) regist_count
    // FROM
    //   user_account WHERE is_upper_score = 1  ${sqlWhere}
    // GROUP BY DATE_FORMAT(createdate, '%Y-%m-%d')`;

    // const data = await this.app.model.query(sql, {
    //   type: this.app.Sequelize.QueryTypes.SELECT,
    // });

    const [ data, totalData ] = await Promise.all([
      this.app.model.query(sql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      }),
      this.app.model.query(sql_total, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      }),
    ]);
    let total = totalData[0].total || 0;

    return data.reduce(function(result, item, index, array) { // 将数组转为对象
      total = parseInt(total) + parseInt(item.regist_count);
      result[item.create_time] = total;
      return result;
    }, {});

  }


  async getUserCount(platform_id) {
    const where = {};
    if (platform_id) {
      where.platform_id = platform_id;
    }
    return await this.ctx.model.UserAccount.count(
      { where }
    );
  }

  async exportList(params) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = { is_upper_score: 1 };
    const where1 = {};
    if (params.s_usernamae) {
      where.username = {
        [Op.like]: `%${params.s_usernamae}%`,
      };
    }
    if (params.user_id) { // 会员id
      where.id = params.user_id;
    }
    if (params.platform_id != '0' && params.platform_id != '') { // 代理
      where.platform_id = params.platform_id;
    }
    if (params.is_bet) {
      where.is_bet = params.is_bet;
    }
    if (params.e_platform_id) {
      where.platform_id = params.e_platform_id;
    }
    if (params.e_platform_name) {
      where1.platform_name = {
        [Op.like]: `%${params.e_platform_name}%`,
      };
    }
    let rows = await this.ctx.model.UserAccount.findAll({
      where,
      order: [[ 'id', 'ASC' ]],
      group: 'user_account.id',
      include: [
        {
          where: where1,
          model: this.ctx.model.PlatformInfo,
          attributes: [ 'platform_name' ],
        },
      ],
    });
    rows = JSON.parse(JSON.stringify(rows));
    let usernames = '';
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    for (let i = 0; i < rows.length; i++) {
      usernames += rows[i].username + '@' + rows[i].platform_id; // 拼接用户名
      if (i < rows.length - 1) usernames += ',';

      const item = playerDataAll[rows[i].username + '@' + rows[i].platform_id];
      if (item) {
        rows[i].valid_bet = parseInt(item.validBet || 0);
        rows[i].win_gold = parseInt(item.winGold || 0);
        rows[i].lost_gold = parseInt(item.lostGold || 0);
        rows[i].lost_win = parseInt(item.winGold || 0) - parseInt(item.lostGold || 0);
        rows[i].deduct_gold = parseInt(item.deductGold || 0);
      } else {
        rows[i].valid_bet = 0;
        rows[i].win_gold = 0;
        rows[i].lost_gold = 0;
        rows[i].lost_win = 0;
        rows[i].deduct_gold = 0;
      }
    }

    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerData = await this.service.tools.sendServerGetRequest(url, 5000);
    // 拼接是否在线;
    if (playerData && playerData.players) {
      for (let i = 0; i < rows.length; i++) {
        const item = playerData.players[rows[i].username + '@' + rows[i].platform_id];
        if (item) {
          rows[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
          rows[i].server_money = item.gold || 0;
        }
      }
    }
    // console.log(result);
    return rows;
  }

  async bExportList(params) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    const where = { is_upper_score: 1 };
    if (params.usernames) {
      where.username = {
        [Op.in]: params.usernames.split(','),
      };
    }
    if (params.platform_id) {
      where.platform_id = params.platform_id;
    }
    let rows = await this.ctx.model.UserAccount.findAll({
      where,
    });
    rows = JSON.parse(JSON.stringify(rows));
    let usernames = '';
    const playerDataAll = await this.service.dataStatistics.userData.getUserDataAll();
    for (let i = 0; i < rows.length; i++) {
      usernames += rows[i].username + '@' + rows[i].platform_id; // 拼接用户名
      if (i < rows.length - 1) usernames += ',';

      const item = playerDataAll[rows[i].username + '@' + rows[i].platform_id];
      if (item) {
        rows[i].win_gold = parseInt(item.winGold || 0);
        rows[i].lost_gold = parseInt(item.lostGold || 0);
        rows[i].lost_win = parseInt(item.winGold || 0) - parseInt(item.lostGold || 0);
        rows[i].deduct_gold = parseInt(item.deductGold || 0);
      } else {
        rows[i].win_gold = 0;
        rows[i].lost_gold = 0;
        rows[i].lost_win = 0;
        rows[i].deduct_gold = 0;
      }
    }

    const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: usernames });
    const playerData = await this.service.tools.sendServerGetRequest(url, 5000);
    // 拼接是否在线;
    if (playerData && playerData.players) {
      for (let i = 0; i < rows.length; i++) {
        const item = playerData.players[rows[i].username + '@' + rows[i].platform_id];
        if (item) {
          rows[i].isOnline = item.isOnline !== undefined ? item.isOnline : false;
          rows[i].server_money = item.gold || 0;
        }
      }
    }
    return rows;
  }

  /**
   * 获取玩家追杀记录
   */
  async getUserKillRecord(user_id, status, kill_money) {
    return await this.ctx.model.UserKillRecord.findOne({
      where: { user_id, status, kill_money },
    });
  }

}

module.exports = UserService;
