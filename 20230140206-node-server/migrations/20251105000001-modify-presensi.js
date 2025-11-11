'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove nama column and modify userId to be a proper foreign key
    
    // Modify userId to be a proper foreign key
    await queryInterface.changeColumn('Presensis', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Add nama column back
    await queryInterface.addColumn('Presensis', 'nama', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revert userId changes
    await queryInterface.changeColumn('Presensis', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};