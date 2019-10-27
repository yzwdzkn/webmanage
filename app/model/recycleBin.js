'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const RecycleBin = app.model.define('recycle_bin',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      record_page: {
        type: STRING(20),
      },
      record_id: {
        type: INTEGER,
      },
      record_contents: {
        type: STRING(30),
      },
      operator: {
        type: STRING(20),
      },
      date: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  return RecycleBin;
};
