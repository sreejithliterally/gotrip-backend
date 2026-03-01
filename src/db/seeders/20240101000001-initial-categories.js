'use strict';

const { v4: uuidv4 } = require('uuid');

const hotelId      = uuidv4();
const activityId   = uuidv4();
const campingId    = uuidv4();
const packageId    = uuidv4();

const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // ─── Root categories ───────────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: hotelId,    name: 'Hotels',     slug: 'hotels',     type: 'hotel',    parent_id: null, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: activityId, name: 'Activities', slug: 'activities', type: 'activity', parent_id: null, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: campingId,  name: 'Camping',    slug: 'camping',    type: 'camping',  parent_id: null, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: packageId,  name: 'Packages',   slug: 'packages',   type: 'package',  parent_id: null, sort_order: 4, is_active: true, created_at: now, updated_at: now },
    ]);

    // ─── Hotel subcategories ───────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), name: 'Budget',       slug: 'hotels-budget',       type: null, parent_id: hotelId, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Luxury',       slug: 'hotels-luxury',       type: null, parent_id: hotelId, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Hill Station', slug: 'hotels-hillstation',  type: null, parent_id: hotelId, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Beach Resort', slug: 'hotels-beach-resort', type: null, parent_id: hotelId, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Heritage',     slug: 'hotels-heritage',     type: null, parent_id: hotelId, sort_order: 5, is_active: true, created_at: now, updated_at: now },
    ]);

    // ─── Activity subcategories ────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), name: 'Adventure',   slug: 'activities-adventure',    type: null, parent_id: activityId, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Water Sports',slug: 'activities-water-sports', type: null, parent_id: activityId, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Trekking',    slug: 'activities-trekking',     type: null, parent_id: activityId, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Sightseeing', slug: 'activities-sightseeing',  type: null, parent_id: activityId, sort_order: 4, is_active: true, created_at: now, updated_at: now },
    ]);

    // ─── Camping subcategories ─────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), name: 'Glamping',  slug: 'camping-glamping',  type: null, parent_id: campingId, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Riverside', slug: 'camping-riverside', type: null, parent_id: campingId, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Mountain',  slug: 'camping-mountain',  type: null, parent_id: campingId, sort_order: 3, is_active: true, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
