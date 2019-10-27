'use strict';
module.exports = app => {
  const { INTEGER, DATE, BIGINT } = app.Sequelize;
  const PlarformBill = app.model.define('platform_bill',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      bill_type: {
        type: INTEGER,
      },
      pay_time: {
        type: DATE,
      },
      bill_date: {
        type: DATE,
      },
      bill: {
        type: BIGINT,
      },
      status: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  return PlarformBill;
};
