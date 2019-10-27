-- ----------------------------
-- Table structure for account_map
-- ----------------------------
DROP TABLE IF EXISTS `account_map`;
CREATE TABLE `account_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `account_id` int(11) NOT NULL COMMENT '账户id',
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `account_type` varchar(50) NOT NULL DEFAULT '' COMMENT '账户类型: admin,agent, station',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `index_1` (`account_id`,`account_type`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='账户映射表';

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL COMMENT '用户名',
  `password` varchar(100) DEFAULT NULL COMMENT '密码',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `role_id` int(11) DEFAULT '0' COMMENT '角色id',
  `status` int(4) DEFAULT NULL COMMENT '状态 0正常1禁用',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `is_super` int(2) DEFAULT '0' COMMENT '是否是超级管理员 1 是 0否',
  `type` int(2) DEFAULT '0' COMMENT '0 系统管理账号 1 平台运营账号 ',
  `create_time` datetime DEFAULT NULL,
  `last_login_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='系统管理人员表';

-- ----------------------------
-- Table structure for admin_whitelist
-- ----------------------------
DROP TABLE IF EXISTS `admin_whitelist`;
CREATE TABLE `admin_whitelist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) DEFAULT NULL COMMENT 'ip地址',
  `description` varchar(500) DEFAULT NULL COMMENT '描述信息',
  `create_operator` varchar(100) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='后台登录IP白名单表';

-- ----------------------------
-- Table structure for advertising
-- ----------------------------
DROP TABLE IF EXISTS `advertising`;
CREATE TABLE `advertising` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` varchar(50) DEFAULT NULL COMMENT '标题',
  `content` varchar(300) DEFAULT NULL COMMENT '内容',
  `img_url` varchar(255) DEFAULT NULL COMMENT '图片地址',
  `skip_url` varchar(255) DEFAULT NULL COMMENT '跳转地址',
  `show_count` int(11) DEFAULT NULL COMMENT '显示次数',
  `type` int(4) DEFAULT NULL COMMENT '类型 0表示图片',
  `status` int(4) DEFAULT NULL COMMENT '状态 0表示启用，1表示启禁用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for agent_account
-- ----------------------------
DROP TABLE IF EXISTS `agent_account`;
CREATE TABLE `agent_account` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '代理账户id',
  `username` varchar(200) NOT NULL COMMENT '代理账号',
  `nickname` varchar(200) NOT NULL COMMENT '代理昵称',
  `password` varchar(200) NOT NULL COMMENT '代理账户密码',
  `bonus_type` varchar(200) DEFAULT NULL COMMENT '分红类型',
  `bonus_percent` int(11) DEFAULT '0' COMMENT '分红比例',
  `bonus_period` int(11) DEFAULT '0' COMMENT '分红周期 1-日 2-周 3-月',
  `bonus_date` int(11) DEFAULT '0' COMMENT '分红日期',
  `coin_type` varchar(50) DEFAULT NULL COMMENT '钱币类型',
  `menu_ids` varchar(500) DEFAULT '' COMMENT '菜单权限',
  `status` varchar(50) DEFAULT NULL COMMENT '状态 0-正常 1-关闭',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间(最后登录时间)',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='代理账户表';

-- ----------------------------
-- Table structure for agent_data
-- ----------------------------
DROP TABLE IF EXISTS `agent_data`;
CREATE TABLE `agent_data` (
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `platform_id` int(11) NOT NULL DEFAULT '0' COMMENT '平台id',
  `agent_id` int(11) NOT NULL COMMENT '代理id',
  `total_games` int(11) DEFAULT NULL COMMENT '总玩的局数',
  `bet_number` int(11) DEFAULT NULL COMMENT '投注人数',
  `valid_bet` bigint(11) DEFAULT NULL COMMENT '有效投注',
  `win_games` int(11) DEFAULT NULL COMMENT '赢钱局数',
  `win_gold` bigint(11) DEFAULT NULL COMMENT '赢了多少钱',
  `lost_games` int(11) DEFAULT NULL COMMENT '输钱局数',
  `lost_gold` bigint(11) DEFAULT NULL COMMENT '输了多少钱',
  `deduct_gold` bigint(11) DEFAULT NULL COMMENT '抽水',
  `duration` bigint(11) DEFAULT NULL COMMENT '玩家在线时长',
  `insert_time` datetime DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`create_time`,`platform_id`,`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='代理流水数据统计表, 每日定时计算';

-- ----------------------------
-- Table structure for game_data
-- ----------------------------
DROP TABLE IF EXISTS `game_data`;
CREATE TABLE `game_data` (
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `game_type` varchar(50) NOT NULL COMMENT '游戏代码编号',
  `total_games` int(11) DEFAULT NULL COMMENT '总玩的局数',
  `bet_number` int(11) DEFAULT NULL COMMENT '投注人数',
  `valid_bet` bigint(11) DEFAULT NULL COMMENT '有效投注',
  `win_games` int(11) DEFAULT NULL COMMENT '赢钱局数',
  `win_gold` bigint(11) DEFAULT NULL COMMENT '赢了多少钱',
  `lost_games` int(11) DEFAULT NULL COMMENT '输钱局数',
  `lost_gold` bigint(11) DEFAULT NULL COMMENT '输了多少钱',
  `deduct_gold` bigint(11) DEFAULT NULL COMMENT '抽水',
  `duration` bigint(11) DEFAULT NULL COMMENT '玩家在线时长',
  `insert_time` datetime DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`create_time`,`game_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for game_info
-- ----------------------------
DROP TABLE IF EXISTS `game_info`;
CREATE TABLE `game_info` (
  `game_id` int(10) NOT NULL COMMENT '游戏id',
  `game_name` varchar(50) DEFAULT NULL COMMENT '游戏名称',
  `game_code` varchar(50) DEFAULT NULL COMMENT '游戏代码',
  `status` int(5) DEFAULT NULL COMMENT '状态 0开启 1 关闭',
  `game_sort` int(5) DEFAULT NULL COMMENT '排序',
  `game_tag` int(10) DEFAULT '0' COMMENT '标签 1推荐 2火爆 3维护 4敬请期待',
  `is_delete` int(5) DEFAULT NULL COMMENT '是否软删除 0否1是',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for game_record_error
-- ----------------------------
DROP TABLE IF EXISTS `game_record_error`;
CREATE TABLE `game_record_error` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(500) DEFAULT NULL COMMENT '错误信息',
  `data` text COMMENT '未处理的数据',
  `sql` text COMMENT 'sql ',
  `status` int(11) DEFAULT NULL COMMENT '处理状态（0未处理，1已处理）',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for horselight
-- ----------------------------
DROP TABLE IF EXISTS `horselight`;
CREATE TABLE `horselight` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `stop_time` datetime DEFAULT NULL COMMENT '结束时间',
  `title` varchar(100) DEFAULT NULL COMMENT '标题',
  `game_id` int(11) DEFAULT NULL COMMENT '游戏ID',
  `description` varchar(1000) DEFAULT NULL COMMENT '内容',
  `interval` int(11) DEFAULT '0' COMMENT '间隔，单位秒',
  `create_operator` varchar(200) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `revise_operator` varchar(200) DEFAULT NULL COMMENT '修改人',
  `revise_time` datetime DEFAULT NULL COMMENT '修改时间',
  `status` int(4) DEFAULT NULL COMMENT '状态 0 正常 1 禁用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='跑马灯表';

-- ----------------------------
-- Table structure for kill_number
-- ----------------------------
DROP TABLE IF EXISTS `kill_number`;
CREATE TABLE `kill_number` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) DEFAULT NULL COMMENT '房间号',
  `is_global` int(11) DEFAULT NULL COMMENT '是否全局杀数（0否1是）',
  `kill_number` double DEFAULT NULL COMMENT '游戏杀数',
  `update_time` datetime DEFAULT NULL COMMENT '最后设置时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for kill_number_log
-- ----------------------------
DROP TABLE IF EXISTS `kill_number_log`;
CREATE TABLE `kill_number_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `target` varchar(100) DEFAULT NULL COMMENT '操作的对象',
  `pre_kill_number` double DEFAULT NULL COMMENT '更改前的杀数',
  `cur_kill_number` double DEFAULT NULL COMMENT '更改后的杀数',
  `operator` varchar(50) DEFAULT NULL COMMENT '操作人',
  `create_time` datetime DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for menu
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_name` varchar(100) NOT NULL COMMENT '菜单名称',
  `module_id` int(11) NOT NULL COMMENT '上级菜单',
  `type` int(11) NOT NULL COMMENT '0 模块 ，1 菜单 2,功能',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `url` varchar(255) DEFAULT NULL COMMENT '链接地址',
  `icon` varchar(50) DEFAULT NULL COMMENT '图标',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `status` int(11) DEFAULT '0' COMMENT '状态 0 正常 1禁用',
  `is_platform` int(2) DEFAULT '0' COMMENT '是否是平台能拥有的菜单1是0否',
  `is_agent` int(2) DEFAULT '0' COMMENT '是否是代理能拥有的菜单1是0否',
  `defualt_agent` int(2) DEFAULT '0' COMMENT '设置默认代理显示的菜单，0不默认，1默认',
  `create_time` datetime DEFAULT NULL COMMENT '添加时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='菜单表';

-- ----------------------------
-- Table structure for online_all
-- ----------------------------
DROP TABLE IF EXISTS `online_all`;
CREATE TABLE `online_all` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `value` int(11) DEFAULT NULL COMMENT '在线人数',
  `ip` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `index_createtime` (`create_time`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for online_game
-- ----------------------------
DROP TABLE IF EXISTS `online_game`;
CREATE TABLE `online_game` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) DEFAULT NULL COMMENT '游戏id( 0表示大厅 )',
  `value` int(11) DEFAULT NULL COMMENT '在线人数',
  `ip` varchar(50) DEFAULT NULL COMMENT 'ip地址',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `index_createtime` (`create_time`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for online_room
-- ----------------------------
DROP TABLE IF EXISTS `online_room`;
CREATE TABLE `online_room` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) DEFAULT NULL COMMENT '房间id',
  `value` int(11) DEFAULT NULL COMMENT '在线人数',
  `ip` varchar(50) DEFAULT NULL COMMENT 'ip地址',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for operation_log
-- ----------------------------
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `content` varchar(500) DEFAULT NULL COMMENT '操作内容',
  `type` int(20) DEFAULT NULL COMMENT '操作类型 1-添加 2-更新 3-删除 4-其他',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作人id',
  `operated_name` varchar(50) DEFAULT NULL COMMENT '被操作人id',
  `create_time` datetime DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='操作日志';

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_id` varchar(50) NOT NULL COMMENT '平台上下分订单号',
  `platform_id` int(11) NOT NULL COMMENT '平台id',
  `user_id` int(11) NOT NULL COMMENT '会员id',
  `pre_score` bigint(20) NOT NULL COMMENT '变账之前金额',
  `score` bigint(20) NOT NULL COMMENT '操作的金额',
  `current_score` bigint(20) NOT NULL COMMENT '变账之后的金额',
  `deduct_gold` bigint(20) DEFAULT '0' COMMENT '抽水',
  `game_id` int(11) DEFAULT '0' COMMENT '游戏id',
  `type` int(11) NOT NULL COMMENT '订单类型: 1 游戏上分, -1 游戏下分,  2 游戏赢分,  -2游戏输分 3 现金网上分 ,-3 现金网下分 , 4 代理给会员上分，-4 代理给会员下分',
  `agent_id` int(11) DEFAULT NULL COMMENT '代理id',
  `big_data` text COMMENT '订单账变数据',
  `status` int(4) DEFAULT NULL COMMENT '订单状态：-1 处理中 0成功 1 失败 2 会员下分失败 3 平台上分失败  4 平台下分失败',
  `order_state` int(4) DEFAULT '3' COMMENT '订单处理状态：1 订单创建 2 订单完成 3 确定完成',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `create_operator` varchar(200) DEFAULT NULL COMMENT '操作人',
  PRIMARY KEY (`order_id`,`platform_id`),
  KEY `index_userid` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='订单表';

-- ----------------------------
-- Table structure for platform_bill
-- ----------------------------
DROP TABLE IF EXISTS `platform_bill`;
CREATE TABLE `platform_bill` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_date` date NOT NULL COMMENT '账单日期 eg 2019-08',
  `pay_time` date DEFAULT NULL COMMENT '缴费时间',
  `bill_type` int(11) DEFAULT NULL COMMENT '费用类型 1-线路费 2-其他',
  `bill` bigint(11) DEFAULT NULL COMMENT '金额',
  `status` int(11) DEFAULT NULL COMMENT '状态 1-已缴 2-待缴 3-免收',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Index 2` (`bill_date`,`bill_type`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='平台账单';

-- ----------------------------
-- Table structure for platform_data
-- ----------------------------
DROP TABLE IF EXISTS `platform_data`;
CREATE TABLE `platform_data` (
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `platform` int(11) NOT NULL COMMENT '平台id',
  `total_games` int(11) DEFAULT NULL COMMENT '总玩的局数',
  `bet_number` int(11) DEFAULT NULL COMMENT '投注人数',
  `valid_bet` bigint(11) DEFAULT NULL COMMENT '有效投注',
  `win_games` int(11) DEFAULT NULL COMMENT '赢钱局数',
  `win_gold` bigint(11) DEFAULT NULL COMMENT '赢了多少钱',
  `lost_games` int(11) DEFAULT NULL COMMENT '输钱局数',
  `lost_gold` bigint(11) DEFAULT NULL COMMENT '输了多少钱',
  `deduct_gold` bigint(11) DEFAULT NULL COMMENT '抽水',
  `duration` bigint(11) DEFAULT NULL COMMENT '玩家在线时长',
  `insert_time` datetime DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`create_time`,`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for platform_game
-- ----------------------------
DROP TABLE IF EXISTS `platform_game`;
CREATE TABLE `platform_game` (
  `game_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  `game_sort` int(11) DEFAULT NULL COMMENT '排序',
  `game_tag` int(11) DEFAULT NULL COMMENT '标签 1推荐 2火爆 3维护 4敬请期待',
  `status` int(11) DEFAULT NULL COMMENT '状态 0开启 1 关闭',
  PRIMARY KEY (`game_id`,`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for platform_info
-- ----------------------------
DROP TABLE IF EXISTS `platform_info`;
CREATE TABLE `platform_info` (
  `platform_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '平台ID',
  `platform_name` varchar(150) DEFAULT NULL COMMENT '平台名称',
  `money` bigint(11) DEFAULT NULL COMMENT '平台分数',
  `rate` int(5) DEFAULT NULL COMMENT '分成比例',
  `version` varchar(50) DEFAULT NULL COMMENT '游戏版本号',
  `whiteip` varchar(255) DEFAULT NULL COMMENT '白名单',
  `des_key` varchar(100) DEFAULT NULL,
  `md5_key` varchar(100) DEFAULT NULL,
  `ofline_back_url` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL COMMENT '0 正常 1 禁止',
  `description` varchar(500) DEFAULT NULL,
  `cooperation_type` int(4) DEFAULT NULL COMMENT '合作方式',
  `createdate` datetime DEFAULT NULL,
  `updatedate` datetime DEFAULT NULL,
  PRIMARY KEY (`platform_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for platform_order
-- ----------------------------
DROP TABLE IF EXISTS `platform_order`;
CREATE TABLE `platform_order` (
  `order_id` varchar(50) NOT NULL COMMENT '平台上下分订单号',
  `platform_id` int(11) NOT NULL COMMENT '平台ID',
  `game_id` int(11) DEFAULT NULL COMMENT '游戏id',
  `pre_score` bigint(20) NOT NULL COMMENT '账前金额',
  `add_score` bigint(20) NOT NULL COMMENT '交易金额',
  `current_score` bigint(20) NOT NULL COMMENT '交易金额',
  `type` int(11) NOT NULL COMMENT '订单类型 0 会员上分 1 会员下分 2 后台上分 3.后台下分,4 平台下分失败 ,5 平台上分失败，6 回滚平台分数失败，7 回滚平台分数成功 8-代理充值 9-代理取款',
  `order_state` int(11) DEFAULT NULL COMMENT '处理状态：1 处理中 2 处理完成',
  `ip` varchar(100) DEFAULT NULL COMMENT '操作ip',
  `order_time` datetime DEFAULT NULL COMMENT '订单创建时间',
  `create_operator` varchar(200) DEFAULT NULL COMMENT '操作人',
  `remark` varchar(200) DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for player_data
-- ----------------------------
DROP TABLE IF EXISTS `player_data`;
CREATE TABLE `player_data` (
  `create_time` date NOT NULL COMMENT '创建时间',
  `username` varchar(200) NOT NULL COMMENT '会员账户',
  `platform_id` int(11) NOT NULL COMMENT '平台id',
  `total_games` int(11) NOT NULL COMMENT '总玩的局数',
  `valid_bet` bigint(11) NOT NULL COMMENT '有效投注',
  `win_games` int(11) NOT NULL COMMENT '赢钱局数',
  `win_gold` bigint(11) NOT NULL COMMENT '赢了多少钱',
  `lost_games` int(11) NOT NULL COMMENT '输钱局数',
  `lost_gold` bigint(11) NOT NULL COMMENT '输了多少钱',
  `deduct_gold` bigint(11) NOT NULL COMMENT '抽水',
  `dive_gold` int(11) NOT NULL COMMENT '防水金额',
  `kill_gold` int(11) NOT NULL COMMENT '追杀金额',
  `duration` bigint(11) NOT NULL COMMENT '玩家在线时长',
  `insert_time` datetime NOT NULL COMMENT '新增时间',
  PRIMARY KEY (`create_time`,`username`,`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for robot_data
-- ----------------------------
DROP TABLE IF EXISTS `robot_data`;
CREATE TABLE `robot_data` (
  `create_time` date NOT NULL COMMENT '创建时间',
  `username` varchar(200) NOT NULL COMMENT '机器人账户',
  `total_games` int(11) NOT NULL COMMENT '总玩的局数',
  `valid_bet` bigint(11) NOT NULL COMMENT '有效投注',
  `win_games` int(11) NOT NULL COMMENT '赢钱局数',
  `win_gold` bigint(11) NOT NULL COMMENT '赢了多少钱',
  `lost_games` int(11) NOT NULL COMMENT '输钱局数',
  `lost_gold` bigint(11) NOT NULL COMMENT '输了多少钱',
  `deduct_gold` bigint(11) NOT NULL COMMENT '抽水',
  `duration` bigint(11) NOT NULL COMMENT '玩家在线时长',
  `insert_time` datetime NOT NULL COMMENT '新增时间',
  PRIMARY KEY (`create_time`,`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for robot_monitor
-- ----------------------------
DROP TABLE IF EXISTS `robot_monitor`;
CREATE TABLE `robot_monitor` (
  `id` int(11) DEFAULT NULL COMMENT 'id',
  `valid_bet` bigint(11) DEFAULT NULL COMMENT '投注',
  `count` int(11) DEFAULT NULL COMMENT '局数',
  `win_lost` bigint(11) DEFAULT NULL COMMENT '输赢差额',
  `win_gold` bigint(11) DEFAULT NULL COMMENT '赢钱',
  `lost_gold` bigint(11) DEFAULT NULL COMMENT '输钱'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='机器人监控';

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL COMMENT '角色名称',
  `type` int(2) DEFAULT '0' COMMENT '0系统角色 ， 1 平台角色',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `status` int(11) DEFAULT NULL COMMENT '0启用1禁用',
  `menu_ids` varchar(500) DEFAULT NULL COMMENT '授权菜单id集合',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '结束时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='角色表';

-- ----------------------------
-- Table structure for room_data
-- ----------------------------
DROP TABLE IF EXISTS `room_data`;
CREATE TABLE `room_data` (
  `create_time` date NOT NULL COMMENT '创建时间',
  `room_id` int(11) NOT NULL COMMENT '房间id',
  `agent_id` int(11) NOT NULL COMMENT '代理id',
  `total_games` int(11) DEFAULT NULL COMMENT '总玩的局数',
  `bet_number` int(11) DEFAULT NULL COMMENT '投注人数',
  `valid_bet` bigint(11) DEFAULT NULL COMMENT '有效投注',
  `win_games` int(11) DEFAULT NULL COMMENT '赢钱局数',
  `win_gold` bigint(11) DEFAULT NULL COMMENT '赢了多少钱',
  `lost_games` int(11) DEFAULT NULL COMMENT '输钱局数',
  `lost_gold` bigint(11) DEFAULT NULL COMMENT '输了多少钱',
  `deduct_gold` bigint(11) DEFAULT NULL COMMENT '抽水',
  `dive_games` int(11) DEFAULT '0' COMMENT '防水局数',
  `dive_gold` bigint(11) DEFAULT '0' COMMENT '防水的钱',
  `kill_games` int(11) DEFAULT '0' COMMENT '追杀的局数',
  `kill_gold` bigint(11) DEFAULT '0' COMMENT '追杀了多少钱',
  `kill_win_games` int(11) DEFAULT '0' COMMENT '追杀赢得局数',
  `kill_win_gold` bigint(11) DEFAULT '0' COMMENT '追杀赢得钱',
  `kill_lost_games` int(11) DEFAULT '0' COMMENT '追杀输的局数',
  `kill_lost_gold` bigint(11) DEFAULT '0' COMMENT '追杀输的钱',
  `duration` bigint(11) DEFAULT NULL COMMENT '玩家在线时长',
  `insert_time` datetime DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`create_time`,`room_id`,`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for room_info
-- ----------------------------
DROP TABLE IF EXISTS `room_info`;
CREATE TABLE `room_info` (
  `room_id` int(11) NOT NULL COMMENT '房间id',
  `room_name` varchar(50) CHARACTER SET utf8 NOT NULL COMMENT '房间名称',
  `game_id` int(11) NOT NULL COMMENT '游戏id',
  `matching_status` int(11) DEFAULT NULL COMMENT '匹配状态 1.机器人  2. 玩家  3.机器人+玩家',
  `status` int(11) DEFAULT '1' COMMENT '状态 1开启；0关闭',
  `admittance` int(11) DEFAULT NULL COMMENT '准入分数',
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for system_maintenance
-- ----------------------------
DROP TABLE IF EXISTS `system_maintenance`;
CREATE TABLE `system_maintenance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `create_time` datetime DEFAULT NULL COMMENT '维护时间',
  `create_operator` varchar(255) DEFAULT NULL COMMENT '操作人',
  `reason` varchar(255) DEFAULT NULL COMMENT '原因',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user_account
-- ----------------------------
DROP TABLE IF EXISTS `user_account`;
CREATE TABLE `user_account` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(200) NOT NULL COMMENT '玩家账号',
  `platform_id` int(11) NOT NULL COMMENT '平台id',
  `agent_id` int(11) DEFAULT NULL COMMENT '代理id',
  `pid` int(11) DEFAULT '0' COMMENT '上级id',
  `status` int(11) DEFAULT '0' COMMENT '玩家状态 0正常 1停封 ',
  `mark` varchar(250) DEFAULT NULL COMMENT '备注',
  `lastlogintime` datetime DEFAULT NULL COMMENT '最后登录时间',
  `freezing_time` datetime DEFAULT NULL COMMENT '停封开始时间',
  `createdate` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedate` datetime DEFAULT NULL COMMENT '更新时间',
  `is_upper_score` tinyint(5) DEFAULT '0' COMMENT '1-true有上分记录  0-false 无上分记录',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_plat` (`username`,`platform_id`) USING BTREE,
  KEY `username` (`username`) USING BTREE,
  KEY `platform` (`platform_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='用户账号\r\n可登录代理后台，如某个账号产生下线请更新他的‘type’字段';

-- ----------------------------
-- Table structure for user_kill_record
-- ----------------------------
DROP TABLE IF EXISTS `user_kill_record`;
CREATE TABLE `user_kill_record` (
  `user_id` varchar(200) NOT NULL COMMENT '会员id',
  `status` int(11) DEFAULT NULL COMMENT '0 不追杀 1 追杀',
  `kill_money` int(11) DEFAULT NULL COMMENT '追杀金额',
  `rest_kill_number` int(11) DEFAULT NULL COMMENT '剩余追杀金额',
  `kill_remark` varchar(500) DEFAULT NULL COMMENT '追杀描述',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='会员追杀';

-- ----------------------------
-- Table structure for user_login_hall
-- ----------------------------
DROP TABLE IF EXISTS `user_login_hall`;
CREATE TABLE `user_login_hall` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID',
  `username` varchar(200) DEFAULT NULL COMMENT '用户名',
  `platform_id` int(11) DEFAULT NULL COMMENT '平台id',
  `ip` varchar(100) DEFAULT NULL COMMENT 'ip地址',
  `region` varchar(100) DEFAULT NULL COMMENT '登录的地区',
  `login_time` datetime DEFAULT NULL COMMENT '登录时间',
  `logout_time` datetime DEFAULT NULL COMMENT '退出登录时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `username` (`username`) USING BTREE,
  KEY `username_platform` (`username`,`platform_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user_login_room
-- ----------------------------
DROP TABLE IF EXISTS `user_login_room`;
CREATE TABLE `user_login_room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(200) DEFAULT NULL COMMENT '用户名',
  `room_id` int(11) DEFAULT NULL COMMENT '代理ID',
  `in_room_time` datetime DEFAULT NULL COMMENT '进入房间时间',
  `out_room_time` datetime DEFAULT NULL COMMENT '退出房间时间',
  `interval` int(11) DEFAULT NULL COMMENT '从进入房间到退出房间的一个间隔（秒）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user_monitor
-- ----------------------------
DROP TABLE IF EXISTS `user_monitor`;
CREATE TABLE `user_monitor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kill_number_gt` float(11,3) DEFAULT '0.000' COMMENT '杀数大于',
  `kill_number_lt` float(11,3) DEFAULT '0.000' COMMENT '杀数小于',
  `bet_count` int(11) DEFAULT '0' COMMENT '投注局数',
  `today_kill_number_gt` float(11,3) DEFAULT NULL COMMENT '今日杀数大于',
  `today_kill_number_lt` float(11,3) DEFAULT NULL COMMENT '今日杀数小于',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='玩家监控表';
