/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;

class PlatformRealtimeDataController extends Controller {
  async index() {
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('platformManage/platform_realtime_data', {
      title: '实时平台数据',
      platforms,
    });
  }

  /**
     * 获取平台上下分订单列表
     */
  async list() {
    const { platform_id, from } = this.ctx.query; // from  表示是否来着平台的请求
    const result = await this.service.dataStatistics.platformData.findPlatformRealtimeData(platform_id);
    // if (from === undefined && result.length !== 0) { // 求总
    //   const platformSum = {
    //     platform: '汇总',
    //     total_games: 0,
    //     valid_bet: 0,
    //     bet_number: 0,
    //     win_games: 0,
    //     win_gold: 0,
    //     lost_games: 0,
    //     lost_gold: 0,
    //     deduct_gold: 0,
    //     duration: 0,
    //   };
    //   for (let i = 0; i < result.length; i++) {
    //     platformSum.total_games += (result[i].total_games || 0);
    //     platformSum.valid_bet += (result[i].valid_bet || 0);
    //     platformSum.bet_number += (result[i].bet_number || 0);
    //     platformSum.win_games += (result[i].win_games || 0);
    //     platformSum.win_gold += (result[i].win_gold || 0);
    //     platformSum.lost_games += (result[i].lost_games || 0);
    //     platformSum.lost_gold += (result[i].lost_gold || 0);
    //     platformSum.deduct_gold += (result[i].deduct_gold || 0);
    //     platformSum.duration += (result[i].duration || 0);
    //   }
    //   result.unshift(platformSum);
    // }

    this.ctx.body = {
      data: result,
      msg: '',
      count: result.length,
      code: 0,
    };
  }
  // 导出
  async export() {
    const { ctx } = this;
    const { platform_id, is_sum } = ctx.request.body;
    const headers = [];
    const condition = [
      { t: `平台:${platform_id || '所有平台'}`, m1: 'A1', m2: 'A1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '平台ID', f: 'platform', totalRow: true },
      { t: '总局数', f: 'total_games', totalRow: true },
      { t: '投注人数', f: 'bet_number', totalRow: true },
      { t: '总投注', f: 'valid_bet', totalRow: true },
      { t: '玩家输赢', f: 'lost_win', totalRow: true },
      { t: '玩家赢', f: 'win_gold', totalRow: true },
      { t: '玩家输', f: 'lost_gold', totalRow: true },
      { t: '抽水', f: 'deduct_gold', totalRow: true },
      { t: '赢局占比', f: 'total_games_percentage', totalRow: true },
      { t: '玩家在线时长(秒)', f: 'duration', totalRow: true },
    ]);
    let data = await this.service.dataStatistics.platformData.findPlatformRealtimeData(platform_id);
    if (is_sum == '1') { // 求总
      const platformSum = {
        platform: 'all',
        total_games: 0,
        valid_bet: 0,
        bet_number: 0,
        win_games: 0,
        win_gold: 0,
        lost_games: 0,
        lost_gold: 0,
        deduct_gold: 0,
        duration: 0,
      };
      for (let i = 0; i < data.length; i++) {
        platformSum.total_games += (data[i].total_games || 0);
        platformSum.valid_bet += (data[i].valid_bet || 0);
        platformSum.bet_number += (data[i].bet_number || 0);
        platformSum.win_games += (data[i].win_games || 0);
        platformSum.win_gold += (data[i].win_gold || 0);
        platformSum.lost_games += (data[i].lost_games || 0);
        platformSum.lost_gold += (data[i].lost_gold || 0);
        platformSum.deduct_gold += (data[i].deduct_gold || 0);
        platformSum.duration += (data[i].duration || 0);
      }
      data = [ platformSum ];
    }
    const workbook = await this.service.exportExcel.generateExcel(headers, data.map(element => {
      // element = element.toJSON();
      element.pre_score = parseFloat(element.pre_score / 100).toFixed(2) || 0;
      element.valid_bet = parseFloat(element.valid_bet / 100).toFixed(2);
      element.lost_win = (parseFloat((element.win_gold - element.lost_gold) / 100)).toFixed(2);
      element.win_gold = parseFloat(element.win_gold / 100).toFixed(2);
      element.lost_gold = parseFloat(element.lost_gold / 100).toFixed(2);
      element.deduct_gold = parseFloat(element.deduct_gold / 100).toFixed(2);
      element.total_games_percentage = element.total_games ? (parseFloat(element.win_games / element.total_games) * 100).toFixed(2) + '%' : '0%';
      return element;
    }));
    console.log(workbook);
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('牌局查询') + '.xlsx');
    ctx.body = workbook;
  }
}

module.exports = PlatformRealtimeDataController;
