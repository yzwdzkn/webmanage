'use strict';
const Service = require('egg').Service;
const moment = require('moment');
/*  eslint-disable eqeqeq*/
class timerService extends Service {
  async timerOperation_bk(platform_id, type, start_date, end_date) {
    const [ dataResult, register_count, login_count, online, killNumer, remain_rate, platform_makeMoney, new_bet_number ] = await Promise.all([
      this.service.dataStatistics.platformData.getData(platform_id, parseInt(type), start_date, end_date), // 输赢流水等信息
      // this.service.user.findRegisterCountByDate(platform_id, start_date, end_date), // 新增登录（注册人数）
      this.service.user.findRegisterCountByDate(platform_id, start_date, end_date), // 新增登录（注册并上过分）
      // this.service.userLoginHall.findUserLoginCountByDate(platform_id, start_date, end_date), // 活跃玩家 (今天不重复登录的玩家)
      this.service.orders.findUserLoginCountByDate(platform_id, start_date, end_date), // 活跃玩家 (今天投过注的玩家)
      this.service.userOnline.getLastData(), // 当前在线
      this.service.killNumber.findGlobalKill(), // 追杀数
      this.service.userOnline.getRemain(start_date, end_date), // 次日留存
      this.service.orders.findByDateAndPlatformId(platform_id, start_date, end_date), // 平台收益
      this.service.user.findRegisterBetCountByDate(platform_id, start_date, end_date), // 新增投注（注册并投过注）
    ]);
    // console.log(platform_makeMoney);
    const resultData = {
      bet_number: 0, //  投注人数
      valid_bet: 0, // 有效投注
      win_gold: 0, // 赢的金额
      lost_gold: 0, // 输的金额
      deduct_gold: 0, // 抽水
      register_count: register_count[0].register_count, // 新增登录
      new_bet_number: new_bet_number[0].new_bet_number, // 新增投注
      login_count: login_count.length, // 活跃玩家
      user_online: online.value, // 当前在线
      current_kill_count: (killNumer.kill_number * 100).toFixed(2), // 当前杀数
      remain_rate, // 次日留存
      platform_user_money: 0, // 平台余额
      platform_makeMoney, // 平台收益
    };
    // 累加所有代理的数据
    for (let i = 0; i < dataResult.length; i++) {
      resultData.bet_number += Number(dataResult[i].bet_number || 0);
      resultData.valid_bet += Number(dataResult[i].valid_bet || 0);
      resultData.win_gold += Number(dataResult[i].win_gold || 0);
      resultData.lost_gold += Number(dataResult[i].lost_gold || 0);
      resultData.deduct_gold += Number(dataResult[i].deduct_gold || 0);
    }
    // 计算人均输赢
    if (resultData.bet_number == 0) {
      resultData.lost_win_avg = 0;
    } else {
      resultData.lost_win_avg = (((resultData.win_gold - resultData.lost_gold) / 100) / resultData.bet_number).toFixed(2);
    }
    resultData.his_kill_count = (resultData.win_gold - resultData.lost_gold) / resultData.valid_bet;
    return resultData;
  }

  async timerOperation(platform_id, start_date, end_date) {
    const [ dataResult, register_count, add_login_count, killNumer, new_bet_number, user_login_number ] = await Promise.all([
      this.service.dataStatistics.platformData.getData(platform_id, start_date, end_date), // 输赢流水等信息
      this.service.user.findRegisterCountByDate(platform_id, start_date, end_date), // 新增登录（注册并上过分）
      this.service.orders.findUserLoginCountByDate(platform_id, start_date, end_date), // 活跃玩家 (今天投过注的玩家)
      // this.service.userOnline.getLastData(), // 当前在线
      this.service.killNumber.findGlobalKill(), // 追杀数
      // this.service.userOnline.getRemain(start_date, end_date), // 次日留存
      // this.service.orders.findByDateAndPlatformId(platform_id, start_date, end_date), // 平台收益
      this.service.user.findRegisterBetCountByDate(platform_id, start_date, end_date), // 新增投注（注册并投过注）
      this.service.user.getUserLogin(platform_id, start_date, end_date), // 登录会员数
    ]);
    const resultData = {
      bet_number: 0, //  投注人数 4
      valid_bet: 0, // 有效投注 5
      win_gold: 0, // 赢的金额
      lost_gold: 0, // 输的金额
      deduct_gold: 0, // 抽水 6
      register_count: register_count[0].register_count, // 新增登录 及 新增会员数 2
      new_bet_number: new_bet_number[0].new_bet_number, // 新增投注 3
      login_count: add_login_count.length, // 活跃玩家
      // user_online: online.value, // 当前在线
      current_kill_count: killNumer ? ((killNumer.kill_number || 0) * 100).toFixed(2) : 0, // 当前杀数 8
      // remain_rate, // 次日留存
      platform_user_money: 0, // 平台余额
      platform_makeMoney: 0, // 平台盈利 7
      user_login_number, // 会员登录数 1
    };
    // 累加所有代理的数据
    for (let i = 0; i < dataResult.length; i++) {
      resultData.bet_number += Number(dataResult[i].bet_number || 0);
      resultData.valid_bet += Number(dataResult[i].valid_bet || 0); // 总投注额
      resultData.win_gold += Number(dataResult[i].win_gold || 0);
      resultData.lost_gold += Number(dataResult[i].lost_gold || 0);
      resultData.deduct_gold += Number(dataResult[i].deduct_gold || 0);
    }
    resultData.platform_makeMoney = resultData.lost_gold - resultData.win_gold + resultData.deduct_gold; // 平台盈利
    // resultData.platform_makeMoney = platform_makeMoney;

    // 计算人均输赢
    if (resultData.bet_number == 0) {
      resultData.lost_win_avg = 0;
    } else {
      resultData.lost_win_avg = (((resultData.win_gold - resultData.lost_gold) / 100) / resultData.bet_number).toFixed(2); // 人均输赢
    }
    resultData.new_bet_number = register_count[0].register_count == 0 ? 0 : new_bet_number[0].new_bet_number / register_count[0].register_count;
    resultData.his_kill_count = (resultData.lost_gold - resultData.win_gold + resultData.deduct_gold) / resultData.valid_bet; // 平均杀数
    return resultData;
  }


  async saveTimerData(data, time) {
    console.log('data: ', data);
    data.bet_rate = data.login_count > 0 ? parseFloat((data.bet_number / data.login_count) * 100).toFixed(2) : 0.00; // 投注率
    data.lost_win = parseFloat((data.win_gold - data.lost_gold) / 100).toFixed(2); // 会员输赢
    // data.platform_balance = data.platform_user_money / 100;
    // data.safe_box = data.safe_box_balance / 100;
    // data.deposit = data.deposit / 100;
    // data.withdrawal = data.withdrawal / 100;
    // data.valid_bet = parseFloat(data.valid_bet / 100).toFixed(2);
    // data.platform_user_money = data.platform_user_money / 100;
    // data.deduct_gold = parseFloat(data.deduct_gold / 100).toFixed(2);
    // data.service_fee = data.service_fee / 100;
    // data.return_commission = data.return_commission / 100;
    data.create_time = time;
    await this.ctx.model.SemihData.create(data);
  }

  async getIntTime(end_date) {
    const time = moment(new Date(end_date));
    let minute = time.get('minute');
    if (minute > 30) {
      minute = 30;
    } else if (minute < 30) {
      minute = 0;
    }
    time.minute(minute);
    time.second(0);
    return time;
  }

  // 获取本月所有平台待交收金额
  // async getMonthGold() {
  //   const platforms = await this.ctx.service.platformInfo.findListByStatus(0); // 获取所有平台信息 取出比例键值对
  //   const platformRate = {}; // 存储平台id 对应的分成比例
  //   for (const platform of platforms) {
  //     platformRate[platform.platform_id] = platform.rate;
  //   }
  //   let sql =
  // }
}

module.exports = timerService;
