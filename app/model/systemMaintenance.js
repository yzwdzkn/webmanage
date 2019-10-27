'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const SysetmMaintence = app.model.define('system_maintenance',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      create_time: {
        type: DATE,
      },
      create_operator: {
        type: STRING(255),
      },
      reason: {
        type: STRING(255),
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  return SysetmMaintence;
};
