'use strict';
// 常量定义

exports.DEFAULT_PASSWORD = '123456';
// 平台名称定义
exports.ADMIN = 'Admin';
exports.AGENT = { en: 'Agent', ch: '代理' };
exports.USER = { en: 'User', ch: '会员' };
exports.USER_AGENT = { en: 'UserAgent', ch: '全民代' };
exports.HORSE_LIGHT = { en: 'HorseLight', ch: '跑马灯管理' };
exports.SHARE = { en: 'Share', ch: '分享管理' };
exports.GAME = { en: 'Game', ch: '游戏大厅设置' };
exports.USER_MONITOR = { en: 'UserMonitor', ch: '玩家监控' };
// exports.MONITOR = { en: 'Monitor', ch: '玩家监控' };
exports.ROBOT_MONIOTR = { en: 'RobotMonitor', ch: '机器人监控' };
exports.USER_KILL = { en: 'UserKill', ch: '会员追杀' };
exports.GLOBAL_KILL = { en: 'KillNumber', ch: '全局杀放' };
exports.ROOM_KILL = { en: 'RoomKill', ch: '房间杀放' };
exports.GAME_INFO = { en: 'GameInfo', ch: '游戏设置' };
exports.ADMINT = { en: 'Admin', ch: '用户管理' };
exports.ROLE = { en: 'Role', ch: '权限管理' }; // dq
exports.MENU = { en: 'Menu', ch: '菜单管理' };
exports.ADMIN_WHITELIST = { en: 'AdminWhitelist', ch: 'IP白名单' };


exports.ACCOUNT = 'account';
exports.SYSTEM = 'system';

exports.OPERATION_TYPE_UPDATE = { index: 1, name: '更新' };
exports.OPERATION_TYPE_CREATE = { index: 2, name: '创建' };
exports.OPERATION_TYPE_DELETE = { index: 3, name: '删除' };
exports.OPERATION_TYPE_RECOVER = { index: 4, name: '恢复' };
exports.OPERATION_TYPE_OTHER = { index: 5, name: '其他' };

exports.BONUS_TYPE = {
  1: '输赢流水',
  2: '充值',
  3: '收入',
  4: '投注额',
  5: '其他',
};

exports.STATUS = {
  0: '正常',
  1: '关闭',
};

exports.OPENING_FEE = 8888;

exports.PLATFORM_FEE_TYPE = {
  1: '线路费',
  2: '其他',
};

exports.PLATFORM_FEE_STATUS = {
  1: '已缴',
  2: '待缴',
  3: '免收',
};

exports.BONUS_PERIOD = {
  1: '日',
  2: '月',
  3: '年',
};

exports.AGENT_COMMISSION_STATUS = {
  1: '已结',
  2: '待结',
  3: '免结',
};

