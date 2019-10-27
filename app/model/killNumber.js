'use strict';
module.exports = app => {
  const { DOUBLE, INTEGER, DATE } = app.Sequelize;
  const KillNumber = app.model.define('kill_number',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true, // 主键
      },
      room_id: {
        type: INTEGER,
      },
      is_global: {
        type: INTEGER,
      },
      kill_number: {
        type: DOUBLE,
      },
      update_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );


  KillNumber.associate = function() {
    app.model.KillNumber.hasOne(app.model.RoomInfo, { foreignKey: 'room_id' });// 一对一
  };

  return KillNumber;
};
