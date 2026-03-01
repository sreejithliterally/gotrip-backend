'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('listing_media', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      listing_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'listings', key: 'id' },
        onDelete: 'CASCADE',
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      media_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'image',
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('listing_media', ['listing_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('listing_media');
  },
};
