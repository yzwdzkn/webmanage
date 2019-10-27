'use strict';
module.exports = app => {
  const { DOUBLE, STRING, INTEGER, DATE } = app.Sequelize;
  const KillNumberLog = app.model.define('kill_number_log',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true, // 主键
      },
      func: {
        type: STRING(100),
      },
      target: {
        type: STRING(200),
      },
      pre_kill_number: {
        type: DOUBLE,
      },
      cur_kill_number: {
        type: DOUBLE,
      },
      operator: {
        type: STRING(50),
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

  return KillNumberLog;
};
