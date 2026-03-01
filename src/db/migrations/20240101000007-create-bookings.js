'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
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
        onDelete: 'RESTRICT',
      },
      listing_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'listings', key: 'id' },
        onDelete: 'RESTRICT',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      guests: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelled_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('bookings', ['user_id']);
    await queryInterface.addIndex('bookings', ['listing_id']);
    await queryInterface.addIndex('bookings', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
  },
};
