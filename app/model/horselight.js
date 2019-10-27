'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const Horselight = app.model.define('horselight',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      start_time: {
        type: DATE,
      },
      stop_time: {
        type: DATE,
      },
      title: {
        type: STRING(100),
      },
      game_id: {
        type: INTEGER,
      },
      description: {
        type: STRING(1000),
      },
      interval: {
        type: INTEGER,
      },
      create_operator: {
        type: STRING(200),
      },
      create_time: {
        type: DATE,
      },
      revise_operator: {
        type: STRING(200),
      },
      is_delete: {
        type: INTEGER,
      },
      revise_time: {
        type: DATE,
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

  Horselight.associate = function() {
    app.model.Horselight.belongsTo(app.model.GameInfo, { foreignKey: 'game_id' });
  };

  return Horselight;
};
