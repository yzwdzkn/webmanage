'use strict';

const Controller = require('egg').Controller;

class GameLostwinStatisticsController extends Controller {
  async index() {
    const result = await this.service.gameInfo.findAllGame();
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('dataManage/game_lostwin_statistics', {
      title: '游戏输赢统计',
      gameData: result,
      agents,
    });
  }

  /**
   * 查询游戏房间数据
   */
  async list() {
    const { agent_id, game_id, room_id, start_date, end_date, orderField, orderType } = this.ctx.query;
    const result = await this.service.dataStatistics.roomData.getData(agent_id, game_id, room_id, start_date, end_date, orderField, orderType); // 查询游戏房间数据
    const res = result.result.map(key => {
      let a;
      try {
        a = key.toJSON();
      } catch (error) {
        a = key;
      }
      a.lostWin = key.lostWin;
      a.game_info = key.game_info;
      a.avgLostWin = key.avgLostWin;
      return a;
    });
    this.ctx.body = {
      data: res,
      msg: '',
      count: result.count.length,
      code: 0,
    };
  }

  /**
     * 根据游戏id 获取房间信息
     */
  async findRoomByGameId() {
    const game_id = this.ctx.request.body.game_id;
    const result = await this.service.gameInfo.findRoomByGameId(game_id);
    this.ctx.body = {
      rooms: result,
    };
  }

  /**
   * 游戏输赢统计数据
   */
  async export() {
    const { ctx } = this;
    const { agent_id, game_id, room_id, start_date, end_date, game_name, room_name } = ctx.request.body;
    const headers = [];
    const condition = [
      { t: `游戏id:${game_name}`, m1: 'A1', m2: 'A1' },
      { t: `房间:${room_name}`, m1: 'B1', m2: 'B1' },
      { t: `开始时间:${start_date}`, m1: 'C1', m2: 'C1' },
      { t: `结束时间:${end_date}`, m1: 'D1', m2: 'D1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '游戏名称', f: 'game_name', totalRow: true },
      { t: '房间ID', f: 'room_id', totalRow: true },
      { t: '房间总盈利', f: 'lostWin', totalRow: true },
      { t: '房间杀数', f: 'room_kill', totalRow: true },
      { t: '总局数', f: 'total_games', totalRow: true },
      { t: '赢局占比', f: 'win_rate', totalRow: true },
      { t: '投注人数', f: 'bet_number', totalRow: true },
      { t: '人均投注', f: 'avg_bet', totalRow: true },
      { t: '人均输赢', f: 'avgLostWin', totalRow: true },
      { t: '人均游戏时长', f: 'duration', totalRow: true },
      { t: '追杀局数', f: 'kill_games', totalRow: true },
      { t: '追杀成功率', f: 'kill_success_rate', totalRow: true },
      { t: '追杀总盈利', f: 'kill_lost_gold', totalRow: true },
      { t: '放水局数', f: 'dive_games', totalRow: true },
      { t: '放水成功率', f: 'throw_success_rate', totalRow: true },
      { t: '放水总盈利', f: 'throw_win_gold_total', totalRow: true },
    ]);
    const result = await this.service.dataStatistics.roomData.getData(agent_id, game_id, room_id, start_date, end_date); // 查询游戏房间数据
    // console.log('result: ', JSON.stringify(result));
    const res = result.result.map(key => {
      let a;
      try {
        a = key.toJSON();
      } catch (error) {
        a = key;
      }
      a.lostWin = key.lostWin;
      a.game_info = key.game_info;
      a.avgLostWin = key.avgLostWin;
      return a;
    });

    const workbook = await this.service.exportExcel.generateExcel(headers, res.map(element => {
      element.game_name = element.game_info.game_name;
      element.room_kill = element.room_kill + '%';
      element.win_rate = (element.win_games / element.total_games * 100).toFixed(2) + '%';
      element.avg_bet = (element.valid_bet / element.bet_number / 100).toFixed(2);
      element.avgLostWin = element.avgLostWin.toFixed(2);
      element.duration = element.duration || 0;
      element.kill_games = element.kill_games || 0;
      if (element.kill_games == 0) {
        element.kill_success_rate = 0.00 + '%';
      } else {
        element.kill_success_rate = (element.kill_lost_games / element.kill_games * 100).toFixed(2) + '%';
      }
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('游戏输赢统计') + '.xlsx');
    ctx.body = workbook;
  }
}

module.exports = GameLostwinStatisticsController;
