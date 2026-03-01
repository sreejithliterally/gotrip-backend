'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'vendors', key: 'id' },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'RESTRICT',
      },
      title: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      price_start: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      amenities: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      policies: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      max_guests: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
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

    await queryInterface.addIndex('listings', ['vendor_id']);
    await queryInterface.addIndex('listings', ['category_id']);
    await queryInterface.addIndex('listings', ['status']);
    await queryInterface.addIndex('listings', ['price_start']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('listings');
  },
};
