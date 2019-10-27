'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const OperationLog = app.model.define('operation_log',
    {
      id: {
        type: BIGINT,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      content: {
        type: STRING(500),
      },
      type: {
        type: INTEGER,
      },
      operator_name: {
        type: STRING(100),
      },
      operated_name: {
        type: STRING(100),
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

  return OperationLog;
};
