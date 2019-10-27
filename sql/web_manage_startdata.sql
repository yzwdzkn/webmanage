
-- ----------------------------
-- Records of account_map
-- ----------------------------
INSERT INTO `account_map` VALUES ('1', '1', 'admin', 'Admin');

-- ----------------------------
-- Records of admin
-- ----------------------------
INSERT INTO `admin` (`id`, `username`, `password`, `nickname`, `role_id`, `status`, `description`, `is_super`, `type`, `create_time`, `last_login_time`) VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', '系统超级管理', 1, 0, '超级管理账号', 1, 0, '2019-7-16 10:21:10', '2019-9-18 16:22:41');

-- ----------------------------
-- Records of game_info
-- ----------------------------
INSERT INTO `game_info` VALUES ('1', '十三水', 'sss', '1', '11', '3', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('2', '抢庄牛牛', 'qznn', '0', '10', '1', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('3', '二八杠', 'ebg', '0', '777', '1', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('4', '骰宝', 'tb', '1', '12', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('5', '炸金花', 'zjh', '0', '13', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('6', '21点', 'esyd', '0', '14', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('7', '斗地主', 'ddz', '0', '16', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('8', '麻将', 'mj', '0', '18', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('9', '百家乐', 'bjl', '0', '19', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('10', '德州扑克', 'dzpk', '0', '20', '3', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('11', '三公', 'sg', '0', '21', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('12', '抢庄牌九', 'qzpj', '0', '15', '2', '0', '2019-06-22 17:40:20');
INSERT INTO `game_info` VALUES ('13', '龙虎', 'lh', '0', '130', '2', '0', '2019-08-03 16:31:53');
INSERT INTO `game_info` VALUES ('14', '看牌抢庄牛牛', 'kpqznn', '0', '140', '2', '0', '2019-08-03 16:33:01');
INSERT INTO `game_info` VALUES ('15', '摇摇乐', 'yyl', '0', '150', '2', '0', '2019-08-03 16:33:15');
INSERT INTO `game_info` VALUES ('16', '抢红包', 'qhb', '0', '160', '2', '0', '2019-08-03 16:32:34');
INSERT INTO `game_info` VALUES ('17', '推筒子', 'ttz', '1', '170', '2', '0', '2019-08-03 16:33:37');
INSERT INTO `game_info` VALUES ('18', '百人牛牛', 'brnn', '0', '180', '2', '0', '2019-08-03 16:33:53');
INSERT INTO `game_info` VALUES ('19', '百人炸金花', 'brzjh', '0', '190', '2', '0', '2019-08-03 16:34:09');
INSERT INTO `game_info` VALUES ('20', '百人德州', 'brdz', '0', '200', '3', '0', '2019-08-03 16:34:56');

-- ----------------------------
-- Records of menu
-- ----------------------------
INSERT INTO `menu` VALUES ('1', '系统设置', '0', '0', '40', '#', 'fa fa-cog', '系统设置', '0', '1', '1', '1', '2019-07-12 17:08:31', '2019-08-14 10:53:58');
INSERT INTO `menu` VALUES ('3', '用户管理', '1', '1', '10', '/admin/systemSetting/adminManage', 'fa fa-user-o', '用户管理', '0', '1', '0', '0', '2019-07-15 13:32:39', '2019-09-27 10:03:36');
INSERT INTO `menu` VALUES ('4', '角色管理', '1', '1', '20', '/admin/systemSetting/roleManage', 'fa fa-exchange', '角色管理', '0', '1', '0', '0', '2019-07-15 13:33:45', '2019-07-16 18:36:38');
INSERT INTO `menu` VALUES ('5', '菜单管理', '1', '1', '30', '/admin/systemSetting/menuManage', 'fa fa-sitemap', '菜单管理', '0', '1', '0', '0', '2019-07-15 13:34:01', '2019-07-16 18:34:08');
INSERT INTO `menu` VALUES ('6', '后台IP白名单', '1', '1', '40', '/admin/systemSetting/whitelistManage', 'fa fa-newspaper-o', '', '0', '1', '0', '0', '2019-07-15 13:52:26', '2019-08-27 16:21:02');
INSERT INTO `menu` VALUES ('18', '平台管理', '0', '0', '10', '#', 'fa fa-clone', '平台管理', '0', '1', '1', '1', '2019-07-15 14:00:38', '2019-08-27 16:08:50');
INSERT INTO `menu` VALUES ('22', '统计图表', '12', '1', '10', '/admin/operateManage/gameManage/gameManage', 'ti-palette', '游戏管理', '0', '1', '0', '0', '2019-07-15 14:36:47', '2019-07-16 20:10:07');
INSERT INTO `menu` VALUES ('23', '游戏状态', '12', '1', '20', '/admin/operateManage/gameManage/gameStatus', 'ti-gallery', '', '0', '1', '0', '0', '2019-07-15 14:37:06', '2019-07-16 20:12:22');
INSERT INTO `menu` VALUES ('24', '匹配管理', '12', '1', '30', '/admin/operateManage/gameManage/matchingManage', 'ti-link', '', '0', '1', '0', '0', '2019-07-15 14:37:21', '2019-07-16 20:13:41');
INSERT INTO `menu` VALUES ('25', '牌局查询', '12', '1', '40', '/admin/operateManage/gameManage/cardGameQuery', 'ti-files', '', '0', '1', '0', '0', '2019-07-15 14:40:02', '2019-07-16 20:12:53');
INSERT INTO `menu` VALUES ('26', '全局杀数', '13', '1', '10', '/admin/operateManage/killNumberManage/globalKill', 'fa fa-skype', '', '0', '1', '0', '0', '2019-07-15 15:09:37', '2019-07-16 19:56:53');
INSERT INTO `menu` VALUES ('27', '游戏杀数', '13', '1', '20', '/admin/operateManage/killNumberManage/gameKill', 'fa fa-th', '', '0', '1', '0', '0', '2019-07-15 15:10:02', '2019-07-16 19:58:33');
INSERT INTO `menu` VALUES ('28', '历史操作', '13', '1', '30', '/admin/operateManage/killNumberManage/historyOperation', 'fa fa-file-code-o', '', '0', '1', '0', '0', '2019-07-15 15:10:24', '2019-07-16 19:58:52');
INSERT INTO `menu` VALUES ('29', '平台监控', '14', '1', '10', '/admin/operateManage/riskManage/platfromMonitor', 'fa fa-tachometer', '', '0', '1', '0', '0', '2019-07-15 15:10:54', '2019-07-16 19:59:38');
INSERT INTO `menu` VALUES ('30', '游戏监控', '14', '1', '20', '/admin/operateManage/riskManage/gameMonitor', 'ti-panel', '', '0', '1', '0', '0', '2019-07-15 15:11:17', '2019-07-16 20:14:47');
INSERT INTO `menu` VALUES ('31', '玩家监控', '14', '1', '30', '/12', 'ti-bar-chart', '', '0', '1', '0', '0', '2019-07-15 15:11:30', '2019-07-19 15:54:34');
INSERT INTO `menu` VALUES ('32', '机器人监控', '14', '1', '40', '/', 'ti-gallery', '', '0', '1', '0', '0', '2019-07-15 15:11:56', '2019-07-19 15:53:53');
INSERT INTO `menu` VALUES ('33', '玩家信息查询', '15', '1', '10', '/admin/operateManage/playerManage/playerInfoQuery', 'fa fa-address-book-o', '', '0', '1', '0', '0', '2019-07-15 15:12:26', '2019-07-16 20:03:26');
INSERT INTO `menu` VALUES ('34', '追杀放水', '15', '1', '20', '/admin/operateManage/playerManage/playerKill', 'fa fa-meetup', '', '0', '1', '0', '0', '2019-07-15 15:12:41', '2019-07-16 20:03:54');
INSERT INTO `menu` VALUES ('35', '账户冻结', '15', '1', '30', '/admin/operateManage/playerManage/playerFreezing', 'fa fa-vcard', '', '0', '1', '0', '0', '2019-07-15 15:12:56', '2019-07-16 20:04:25');
INSERT INTO `menu` VALUES ('36', '限注限入', '12', '1', '50', '/admin/operateManage/gameManage/limitBets', 'fa fa-filter', '限注限入', '0', '1', '0', '0', '2019-07-15 15:47:35', '2019-07-16 20:06:55');
INSERT INTO `menu` VALUES ('68', '风控管理', '0', '0', '35', '#', 'fa fa-flash', '风控管理', '0', '0', '1', '0', '2019-08-05 18:36:21', '2019-08-27 16:13:24');
INSERT INTO `menu` VALUES ('69', '玩家监控', '68', '1', '10', '/admin/riskManagement/userMonitor', 'fa fa-circle-o', '玩家监控', '0', '1', '1', '0', '2019-08-05 18:37:52', '2019-08-14 15:26:53');
INSERT INTO `menu` VALUES ('70', '会员追杀', '68', '1', '20', '/admin/riskManagement/userKill', 'ti-user', '会员追杀', '0', '1', '0', '0', '2019-08-05 18:38:39', '2019-08-14 11:49:13');
INSERT INTO `menu` VALUES ('71', '全局杀放', '68', '1', '30', '/admin/riskManagement/globalKill', 'fa fa-opera', '全局杀放', '0', '1', '0', '0', '2019-08-05 18:39:56', '2019-08-14 11:51:13');
INSERT INTO `menu` VALUES ('72', '房间杀放', '68', '1', '40', '/admin/riskManagement/roomKill', 'fa fa-money', '房间杀放', '0', '1', '0', '0', '2019-08-05 18:41:10', '2019-08-05 18:41:16');
INSERT INTO `menu` VALUES ('73', '机器人设置', '68', '1', '50', '/admin/riskManagement/robot', 'fa fa-odnoklassniki', '机器人设置', '1', '1', '0', '0', '2019-08-05 18:41:52', '2019-09-25 20:40:40');
INSERT INTO `menu` VALUES ('74', '历史操作', '68', '1', '60', '/admin/riskManagement/historyOperation', 'fa fa-file-text', '历史操作', '0', '1', '0', '0', '2019-08-05 18:42:36', '2019-08-14 11:51:47');
INSERT INTO `menu` VALUES ('76', '编辑', '45', '2', '10', 'bt1', '', '编辑会员功能按钮', '0', '1', '1', '0', '2019-08-07 10:42:18', '2019-08-12 17:36:42');
INSERT INTO `menu` VALUES ('80', '编辑', '43', '2', '20', 'bt1', '', '编辑功能', '0', '1', '0', '0', '2019-08-07 14:13:45', '2019-08-12 17:33:26');
INSERT INTO `menu` VALUES ('81', '搜索', '45', '2', '5', 'bt2', '', '搜索按钮', '0', '1', '1', '1', '2019-08-07 14:20:47', '2019-08-12 17:36:30');
INSERT INTO `menu` VALUES ('83', '搜索', '43', '2', '5', 'bt2', '', '搜索按钮', '0', '1', '1', '1', '2019-08-07 14:31:26', '2019-08-12 17:33:21');
INSERT INTO `menu` VALUES ('87', '搜索', '46', '2', '5', 'bt2', '', '搜索功能', '0', '1', '1', '1', '2019-08-07 14:50:10', '2019-08-12 17:37:58');
INSERT INTO `menu` VALUES ('88', '编辑', '46', '2', '10', 'bt1', '', '编辑功能', '0', '1', '1', '1', '2019-08-07 14:50:40', '2019-08-12 17:37:53');
INSERT INTO `menu` VALUES ('90', '编辑', '48', '2', '10', 'bt1', '', '编辑功能', '0', '1', '1', '1', '2019-08-07 15:04:12', '2019-08-12 17:39:06');
INSERT INTO `menu` VALUES ('93', '编辑', '49', '2', '10', 'bt1', '', '编辑功能', '0', '1', '0', '0', '2019-08-07 15:10:59', '2019-08-12 17:40:45');
INSERT INTO `menu` VALUES ('98', '搜索', '3', '2', '5', 'bt2', '', '搜索功能', '0', '1', '0', '0', '2019-08-07 15:24:39', '2019-08-07 15:24:39');
INSERT INTO `menu` VALUES ('101', '编辑', '4', '2', '10', 'bt1', '', '编辑功能', '0', '1', '0', '0', '2019-08-07 15:30:06', '2019-08-12 17:55:44');
INSERT INTO `menu` VALUES ('104', '编辑', '5', '2', '10', 'bt1', '', '编辑功能', '0', '1', '0', '0', '2019-08-07 15:36:29', '2019-08-12 17:56:26');
INSERT INTO `menu` VALUES ('107', '搜索', '6', '2', '5', 'bt2', '', '搜索按钮', '0', '1', '0', '0', '2019-08-07 15:41:20', '2019-08-07 15:41:20');
INSERT INTO `menu` VALUES ('108', '编辑', '6', '2', '10', 'bt1', '', '添加白名单按钮', '0', '1', '0', '0', '2019-08-07 15:47:25', '2019-08-12 17:58:29');
INSERT INTO `menu` VALUES ('109', '代理菜单权限设置', '47', '2', '10', 'bt1', '', '代理菜单权限设置按钮', '0', '1', '0', '0', '2019-08-07 15:49:29', '2019-08-07 15:49:29');
INSERT INTO `menu` VALUES ('119', '编辑', '55', '2', '10', 'bt1', '', '添加公告功能', '0', '1', '0', '0', '2019-08-07 16:12:07', '2019-08-12 17:27:35');
INSERT INTO `menu` VALUES ('120', '搜索', '55', '2', '5', 'bt2', '', '搜索功能', '0', '1', '0', '0', '2019-08-07 16:12:25', '2019-08-07 16:12:25');
INSERT INTO `menu` VALUES ('121', '查看', '5', '2', '5', 'bt0', '', '查看页面', '0', '1', '0', '0', '2019-08-07 16:19:18', '2019-08-07 16:19:59');
INSERT INTO `menu` VALUES ('122', '查看', '4', '2', '5', 'bt0', '', '查看页面', '0', '1', '0', '0', '2019-08-07 16:19:42', '2019-08-07 16:20:03');
INSERT INTO `menu` VALUES ('123', '查看', '47', '2', '5', 'bt0', '', '查看页面', '0', '1', '0', '0', '2019-08-07 16:20:33', '2019-08-07 16:20:33');
INSERT INTO `menu` VALUES ('125', '查看', '49', '2', '0', 'bt0', '', '查看游戏设置页面', '0', '1', '0', '0', '2019-08-07 16:27:53', '2019-08-07 16:27:53');
INSERT INTO `menu` VALUES ('145', '搜索', '69', '2', '5', 'bt2', '', '搜索按钮', '0', '1', '0', '0', '2019-08-08 09:46:54', '2019-08-08 09:46:54');
INSERT INTO `menu` VALUES ('148', '搜索', '70', '2', '5', 'bt2', '', '搜索功能', '0', '1', '0', '0', '2019-08-08 09:51:31', '2019-08-12 17:49:24');
INSERT INTO `menu` VALUES ('151', '查看', '71', '2', '0', 'bt0', '', '查看功能', '0', '1', '0', '0', '2019-08-08 09:53:17', '2019-08-08 09:53:17');
INSERT INTO `menu` VALUES ('152', '设置', '71', '2', '10', 'bt1', '', '设置功能', '0', '1', '0', '0', '2019-08-08 09:53:31', '2019-08-08 09:53:31');
INSERT INTO `menu` VALUES ('153', '搜索', '72', '2', '10', 'bt1', '', '搜索功能', '0', '1', '0', '0', '2019-08-08 09:57:22', '2019-08-08 09:57:22');
INSERT INTO `menu` VALUES ('154', '编辑', '72', '2', '20', 'bt2', '', '编辑功能', '0', '1', '0', '0', '2019-08-08 09:57:37', '2019-08-08 09:57:37');
INSERT INTO `menu` VALUES ('155', '设置', '70', '2', '10', 'bt1', '', '编辑功能', '0', '1', '0', '0', '2019-08-08 10:04:08', '2019-08-12 17:49:16');
INSERT INTO `menu` VALUES ('157', '搜索', '73', '2', '5', 'bt2', '', '搜索功能', '0', '1', '0', '0', '2019-08-08 10:13:52', '2019-08-08 10:13:52');
INSERT INTO `menu` VALUES ('165', '操作日志', '1', '1', '70', '/admin/systemSetting/operationLog', 'fa fa-file-code-o', '操作日志', '0', '1', '1', '1', '2019-08-09 15:18:25', '2019-09-26 13:43:46');
INSERT INTO `menu` VALUES ('167', '查看', '48', '2', '5', 'bt0', '', '查看功能', '0', '1', '1', '0', '2019-08-12 17:39:58', '2019-08-12 17:40:15');
INSERT INTO `menu` VALUES ('168', '编辑', '69', '2', '10', 'bt1', '', '编辑功能', '0', '1', '1', '0', '2019-08-12 17:47:17', '2019-08-12 17:47:17');
INSERT INTO `menu` VALUES ('169', '编辑', '73', '2', '10', 'bt1', '', '编辑功能', '0', '1', '1', '0', '2019-08-12 17:51:56', '2019-08-12 17:51:56');
INSERT INTO `menu` VALUES ('170', '编辑', '3', '2', '10', 'bt1', '', '编辑功能', '0', '1', '1', '0', '2019-08-12 17:54:14', '2019-08-12 17:54:14');
INSERT INTO `menu` VALUES ('171', '搜索', '166', '2', '5', 'bt2', '', '搜索功能', '0', '1', '1', '0', '2019-08-12 18:00:29', '2019-08-12 18:00:29');
INSERT INTO `menu` VALUES ('172', '编辑', '166', '2', '10', 'bt1', '', '编辑功能', '0', '1', '1', '0', '2019-08-12 18:00:42', '2019-08-12 18:00:42');
INSERT INTO `menu` VALUES ('173', '系统维护', '1', '1', '60', '/admin/systemSetting/systemMaintenance', 'fa fa-cog', '系统维护', '1', '1', '1', '1', '2019-08-13 10:55:46', '2019-08-27 16:20:46');
INSERT INTO `menu` VALUES ('182', '搜索', '178', '2', '10', 'bt1', '', '', '0', '1', '0', '0', '2019-08-21 09:42:27', '2019-08-21 09:42:27');
INSERT INTO `menu` VALUES ('183', '编辑', '178', '2', '20', 'bt2', '', '', '0', '1', '0', '0', '2019-08-21 09:42:56', '2019-08-21 09:42:56');
INSERT INTO `menu` VALUES ('186', '平台管理', '18', '1', '1', '/admin/platformManage/platformManage', 'fa fa-user-circle', '', '0', '0', '0', '0', '2019-08-26 14:28:57', '2019-08-26 14:28:57');
INSERT INTO `menu` VALUES ('187', '平台账单明细', '18', '1', '9', '/admin/platformManage/platformOrderManage', 'fa fa-user-circle', '平台账单明细', '0', '0', '0', '0', '2019-08-26 15:03:34', '2019-09-27 09:55:41');
INSERT INTO `menu` VALUES ('188', '游戏管理', '0', '0', '11', '#', 'fa fa-th-large', '游戏管理', '0', '1', '1', '0', '2019-08-26 18:51:30', '2019-09-26 10:54:57');
INSERT INTO `menu` VALUES ('189', '游戏大厅设置', '188', '1', '10', '/admin/operateManage/gameManage/gameManage', 'fa fa-th-large', '游戏大厅设置', '0', '1', '1', '0', '2019-08-26 18:52:33', '2019-08-27 20:46:03');
INSERT INTO `menu` VALUES ('190', '游戏房间设置', '188', '1', '20', '/admin/operateManage/gameRoomManage/gameRoomManage', 'fa fa-th-large', '游戏房间设置', '0', '1', '1', '0', '2019-08-26 18:53:35', '2019-08-27 20:46:05');
INSERT INTO `menu` VALUES ('191', '跑马灯管理', '188', '1', '30', '/admin/operateManage/horselightManage', 'fa fa-th-large', '跑马灯管理', '1', '1', '1', '0', '2019-08-26 18:53:54', '2019-09-26 18:06:18');
INSERT INTO `menu` VALUES ('192', '会员管理', '0', '0', '10', '#', 'fa fa-user', '会员管理菜单', '0', '1', '1', '0', '2019-08-26 19:00:19', '2019-08-27 16:10:33');
INSERT INTO `menu` VALUES ('193', '会员牌局详情', '192', '1', '20', '/admin/userManage/cardGameQuery', 'fa fa-user-o', '会员输赢详情', '0', '1', '1', '0', '2019-08-26 19:02:37', '2019-08-27 20:00:24');
INSERT INTO `menu` VALUES ('194', '会员账单明细', '192', '1', '30', '/admin/userManage/userAccountChange', 'fa fa-user-o', '会员账单明细', '0', '1', '1', '0', '2019-08-26 19:03:10', '2019-09-27 09:54:55');
INSERT INTO `menu` VALUES ('195', '会员管理', '192', '1', '10', '/admin/userManage/userManage', 'fa fa-user-o', '会员管理', '0', '1', '1', '0', '2019-08-26 19:32:19', '2019-08-28 17:27:29');
INSERT INTO `menu` VALUES ('196', '游戏数据', '0', '0', '5', '#', 'fa fa-th-large', '游戏数据', '0', '1', '1', '0', '2019-08-26 20:37:08', '2019-08-27 16:08:30');
INSERT INTO `menu` VALUES ('197', '数据总览', '196', '1', '0', '/admin/gameDataManage/totalData', 'fa fa-clone', '游戏数据总览', '0', '1', '1', '0', '2019-08-26 20:43:14', '2019-08-28 14:29:17');
INSERT INTO `menu` VALUES ('198', '游戏总览', '196', '1', '1', '/admin/gameDataManage/gameOverview', 'fa fa-clone', '', '0', '1', '1', '0', '2019-08-27 10:05:04', '2019-08-28 14:29:20');
INSERT INTO `menu` VALUES ('199', '玩家登录分析', '192', '1', '40', '/admin/userManage/userLoginHallManage', 'fa fa-user-o', '玩家登录分析', '0', '1', '1', '0', '2019-08-27 14:52:51', '2019-08-27 15:02:50');
INSERT INTO `menu` VALUES ('200', '实时平台数据', '18', '1', '20', '/admin/platformManage/platformRealtimeData', 'fa fa-calendar', '实时平台数据', '0', '1', '1', '0', '2019-08-27 15:22:37', '2019-08-27 15:24:12');
INSERT INTO `menu` VALUES ('201', '平台历史数据', '18', '1', '30', '/admin/platformManage/platformHistoryData', 'fa fa-calendar', '平台历史数据', '0', '1', '1', '0', '2019-08-27 15:23:42', '2019-08-27 15:24:16');
INSERT INTO `menu` VALUES ('202', '游戏输赢统计', '196', '1', '2', '/admin/gameDataManage/gameLostwin', 'fa fa-clone', '', '0', '1', '1', '0', '2019-08-27 16:50:59', '2019-08-28 14:29:22');
INSERT INTO `menu` VALUES ('203', '留存', '196', '1', '3', '/admin/gameDataManage/retain', 'fa fa-clone', '', '0', '1', '1', '0', '2019-08-27 16:51:16', '2019-08-28 14:29:25');
INSERT INTO `menu` VALUES ('204', '平台账单结算', '18', '1', '5', '/admin/platformManage/platformTotalManage', 'ti-server', '平台账单结算', '0', '0', '0', '0', '2019-09-23 10:59:35', '2019-09-27 09:56:13');

-- ----------------------------
-- Records of platform_info
-- ----------------------------
INSERT INTO `platform_info` (`platform_id`, `platform_name`, `money`, `version`, `whiteip`, `des_key`, `md5_key`, `ofline_back_url`, `status`, `description`, `cooperation_type`, `createdate`, `updatedate`) VALUES (1, 'test', 1403457952, '', '127.0.0.1', '89E5BC9B75B6FEB5', 'e10adc3949ba59abbe56e057f20f883e', 'http://127.0.0.1:7006/offline', 0, 'dasfadfdasgf', 1, '2019-5-25 17:33:31', '2019-9-18 16:31:09');

-- ----------------------------
-- Records of robot_monitor
-- ----------------------------
INSERT INTO `robot_monitor` (`id`, `valid_bet`, `count`, `win_lost`, `win_gold`, `lost_gold`) VALUES (1, 10000, 100, 1000, 10, 10);

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (1, '管理员', 0, '管理员专用', 0, '1,3,4,5,6,18,68,69,70,71,72,73,74,98,101,104,107,108,121,122,145,148,151,152,153,154,155,157,168,169,170,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203', '2019-7-15 16:18:29', '2019-9-1 00:27:56');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (4, '测试人员', 0, '测试专用', 0, '1,2,3,4,5,6,11,18,43,45,46,47,48,49,53,54,55,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,81,83,87,89,92,98,105,107,111,114,116,120,121,122,123,126,128,130,132,134,136,138,140,141,142,143,145,146,149,151,153,157,159', '2019-7-15 16:46:17', '2019-8-8 16:58:01');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (5, '客服人员', 0, '', 0, '196,197,198,202,203', '2019-7-16 18:53:19', '2019-8-31 10:50:28');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (8, '测试2', 0, '', 0, '1,2,3,4,5,6,11,18,43,45,46,47,48,49,50,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,75,76,77,78,79,80,81,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,107,108,109,111,113,114,115,116,117,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,150,162,163,164', '2019-8-9 10:38:06', '2019-8-31 10:50:19');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (10, '扫地僧', 0, '', 0, '1,3,4,5,6,18,68,69,70,71,72,73,74,98,101,104,107,108,121,122,145,148,151,152,153,154,155,157,168,169,170,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203', '2019-8-31 10:51:33', '2019-8-31 10:51:41');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (20, '22', 0, '', 0, NULL, '2019-8-31 19:57:45', '2019-8-31 19:57:45');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (21, '33', 0, '', 0, NULL, '2019-8-31 19:57:47', '2019-8-31 19:57:47');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (22, '44', 0, '', 0, NULL, '2019-8-31 19:57:50', '2019-8-31 19:57:50');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (23, '11', 0, '', 0, NULL, '2019-8-31 19:57:54', '2019-8-31 19:57:54');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (24, '66', 0, '', 0, NULL, '2019-8-31 19:57:56', '2019-8-31 19:57:56');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (25, '22', 0, '', 0, NULL, '2019-8-31 19:57:59', '2019-8-31 19:57:59');
INSERT INTO `role` (`id`, `name`, `type`, `description`, `status`, `menu_ids`, `create_time`, `update_time`) VALUES (26, '44', 0, '', 0, NULL, '2019-8-31 19:58:03', '2019-8-31 19:58:03');

-- ----------------------------
-- Records of room_info
-- ----------------------------
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (101, '十三水-新手房', 1, 1, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (102, '十三水-青龙房', 1, 3, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (103, '十三水-白龙房', 1, 2, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (104, '十三水-金龙房', 1, 3, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (105, '十三水极速场-新手房', 1, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (106, '十三水极速场-普通场', 1, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (107, '十三水极速场-高手场', 1, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (108, '十三水极速场-大师场', 1, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (201, '抢庄牛牛-新手房', 2, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (202, '抢庄牛牛-小牛', 2, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (203, '抢庄牛牛-大牛', 2, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (204, '抢庄牛牛-牛王', 2, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (205, '抢庄牛牛-牛魔王', 2, 1, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (301, '二八杠-新手场', 3, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (302, '二八杠-普通场', 3, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (303, '二八杠-高手场', 3, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (304, '二八杠-大师场', 3, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (305, '二八杠-宗师场', 3, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (306, '二八杠-帝王场', 3, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (401, '骰宝-新手场', 4, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (402, '骰宝-普通场', 4, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (403, '骰宝-高手场', 4, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (404, '骰宝-大师场', 4, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (405, '骰宝-宗师场', 4, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (501, '炸金花-新手房', 5, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (502, '炸金花-普通场', 5, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (503, '炸金花-高手场', 5, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (504, '炸金花-大师场', 5, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (601, '21点-新手场', 6, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (602, '21点-普通场', 6, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (603, '21点-高手场', 6, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (604, '21点-大师场', 6, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (701, '斗地主-新手场', 7, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (702, '斗地主-普通场', 7, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (703, '斗地主-高手场', 7, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (704, '斗地主-大师场', 7, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (705, '斗地主-宗师场', 7, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (706, '斗地主-至尊场', 7, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (801, '麻将-新手场', 8, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (802, '麻将-普通场', 8, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (803, '麻将-高手场', 8, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (804, '麻将-大师场', 8, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (805, '麻将-宗师场', 8, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (901, '百家乐-新手场', 9, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (902, '百家乐-普通场', 9, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (903, '百家乐-高手场', 9, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (904, '百家乐-大师场', 9, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (905, '百家乐-宗师场', 9, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1001, '德州扑克-新手场', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1002, '德州扑克-初级场', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1003, '德州扑克-中级场', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1004, '德州扑克-高级场', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1005, '德州扑克-财大气粗', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1006, '德州扑克-腰缠万贯', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1008, '德州扑克-挥金如土', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1009, '德州扑克-富贵逼人', 10, NULL, 0, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1101, '三公-新手场', 11, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1102, '三公-普通场', 11, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1103, '三公-高手场', 11, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1104, '三公-大师场', 11, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1105, '三公-宗师场', 11, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1201, '抢庄牌九-新手场', 12, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1202, '抢庄牌九-普通场', 12, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1203, '抢庄牌九-高手场', 12, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1204, '抢庄牌九-大师场', 12, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1205, '抢庄牌九-宗师场', 12, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1301, '龙虎-新手场', 13, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1302, '龙虎-普通场', 13, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1303, '龙虎-高手场', 13, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1304, '龙虎-大师场', 13, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1305, '龙虎-宗师场', 13, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1333, '水水测试房间', 1, 2, 1, 111);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1401, '看牌抢庄牛牛-新手房', 14, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1402, '看牌抢庄牛牛-普通场', 14, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1403, '看牌抢庄牛牛-高手场', 14, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1404, '看牌抢庄牛牛-大师场', 14, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1501, '摇摇乐-新手房', 15, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1502, '摇摇乐-普通场', 15, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1503, '摇摇乐-高手场', 15, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1504, '摇摇乐-大师场', 15, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1505, '摇摇乐-宗师场', 15, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1601, '抢红包-新手场', 16, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1602, '抢红包-普通场', 16, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1603, '抢红包-高手场', 16, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1604, '抢红包-大师场', 16, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1605, '抢红包-土豪房', 16, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1701, '推筒子-新手场', 17, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1702, '推筒子-普通场', 17, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1703, '推筒子-高手场', 17, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1704, '推筒子-大师场', 17, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1705, '推筒子-宗师场', 17, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1801, '百人牛牛-精英场', 18, 3, 1, 1);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1802, '百人牛牛-新手场', 18, 3, 1, 1);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1803, '百人牛牛-中级房', 18, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1804, '百人牛牛-高级房', 18, NULL, 1, NULL);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1901, '百人炸金花-精英场', 19, 3, 1, 20);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1902, '百人炸金花-大师场', 19, 3, 1, 50);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1903, '百人炸金花-至尊场', 19, 3, 1, 1);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1904, '百人炸金花-王者场', 19, 3, 1, 50);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (1905, '百人炸金花-新手场', 19, 3, 1, 1);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (2001, '百人德州-新手场', 20, 1, 1, 666);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (2002, '百人德州-大师场', 20, 3, 1, 1);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (2003, '百人德州-精英场', 20, 3, 1, 1);
INSERT INTO `room_info` (`room_id`, `room_name`, `game_id`, `matching_status`, `status`, `admittance`) VALUES (2004, '百人德州-王者场', 20, 3, 1, 2);

-- ----------------------------
-- Records of user_monitor
-- ----------------------------
INSERT INTO `user_monitor` VALUES ('1', '0.04', '0.01', '100', '0.04', '0.01');