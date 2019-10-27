'use strict';
module.exports = app => {
  const { INTEGER } = app.Sequelize;
  const GlobalStatus = app.model.define('global_status',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
      },
      kill_status: {
        type: INTEGER,
      },
      water_status: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  return GlobalStatus;
};
