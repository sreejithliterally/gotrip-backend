'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('availability', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      total_units: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      available_units: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
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

    // Unique constraint: one row per listing per date
    await queryInterface.addIndex('availability', ['listing_id', 'date'], {
      unique: true,
      name: 'idx_availability_listing_date',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('availability');
  },
};
