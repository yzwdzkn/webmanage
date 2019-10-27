'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const UserSafeBoxLog = app.model.define('user_safe_box_log',
    {
      order_id: {
        type: STRING(100),
        primaryKey: true,
      },
      user_id: {
        type: INTEGER,
      },
      type: {
        type: INTEGER,
      },
      pre_money: {
        type: INTEGER,
      },
      money: {
        type: INTEGER,
      },
      cur_money: {
        type: INTEGER,
      },
      create_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  UserSafeBoxLog.associate = function() {

  };

  return UserSafeBoxLog;
};
