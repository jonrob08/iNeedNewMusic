'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class myPlaylist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.myPlaylist.belongsTo(models.user);
    }
  }
  myPlaylist.init({
    userId: DataTypes.INTEGER,
    trackTitle: DataTypes.STRING,
    trackArtist: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'myPlaylist',
  });
  return myPlaylist;
};