'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const OnlineRoom = app.model.define('online_room',
    {
      id: {
        type: BIGINT,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      room_id: {
        type: INTEGER,
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

  return OnlineRoom;
};
