'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const UserLoginRoom = app.model.define('user_login_room',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      username: {
        type: STRING(200),
      },
      room_id: {
        type: INTEGER,
      },
      in_room_time: {
        type: DATE,
      },
      out_room_time: {
        type: DATE,
      },
      interval: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  UserLoginRoom.associate = function() {

  };
  return UserLoginRoom;
};
