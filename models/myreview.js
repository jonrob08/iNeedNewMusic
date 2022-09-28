'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class myReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.myReview.belongsTo(models.myPlaylist); 
    }
  }
  myReview.init({
    myPlaylistId: {type: DataTypes.INTEGER, unique: true, allowNull: false},
    review: DataTypes.INTEGER,
    comments: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'myReview',
  });
  return myReview;
};