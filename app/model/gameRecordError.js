'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, TEXT } = app.Sequelize;
  const GameRecordError = app.model.define('game_record_error',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
      },
      message: {
        type: STRING(500),
      },
      data: {
        type: TEXT,
      },
      sql: {
        type: TEXT,
      },
      status: {
        type: INTEGER,
      },
      create_time: {
        type: DATE,
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

  return GameRecordError;
};
