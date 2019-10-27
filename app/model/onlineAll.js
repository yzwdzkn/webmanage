'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const OnlineAll = app.model.define('online_all',
    {
      id: {
        type: BIGINT,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      value: {
        type: INTEGER,
      },
      ip: {
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

  return OnlineAll;
};
