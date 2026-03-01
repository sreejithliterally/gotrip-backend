'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      listing_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'listings', key: 'id' },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // One review per user per listing
    await queryInterface.addIndex('reviews', ['user_id', 'listing_id'], {
      unique: true,
      name: 'idx_reviews_user_listing',
    });
    await queryInterface.addIndex('reviews', ['listing_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
  },
};
