'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'RESTRICT',
      },
      razorpay_order_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      razorpay_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      razorpay_signature: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'INR',
      },
      status: {
        type: Sequelize.ENUM('created', 'authorized', 'captured', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'created',
      },
      webhook_payload: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('payments', ['booking_id']);
    await queryInterface.addIndex('payments', ['razorpay_order_id']);
    await queryInterface.addIndex('payments', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
