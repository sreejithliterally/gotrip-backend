/**
 * Seed script — creates initial categories and an admin user.
 * Usage: npm run db:seed
 */
import { sequelize } from './index';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { UserRole, CategoryType } from '../common/types';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });

    // ─── Admin user ───
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@gotrip.com' },
      defaults: {
        full_name: 'GoTrip Admin',
        email: 'admin@gotrip.com',
        phone: '9999999999',
        role: UserRole.ADMIN,
        is_verified: true,
        is_email_verified: true,
        is_phone_verified: true,
      },
    });
    console.log(`👤 Admin user: ${admin.email}`);

    // ─── Root Categories ───
    const rootCategories = [
      { name: 'Hotels', slug: 'hotels', type: CategoryType.HOTEL, sort_order: 1 },
      { name: 'Activities', slug: 'activities', type: CategoryType.ACTIVITY, sort_order: 2 },
      { name: 'Camping', slug: 'camping', type: CategoryType.CAMPING, sort_order: 3 },
      { name: 'Packages', slug: 'packages', type: CategoryType.PACKAGE, sort_order: 4 },
    ];

    for (const cat of rootCategories) {
      await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat as any,
      });
    }
    console.log('📂 Root categories seeded');

    // ─── Hotel Sub-categories ───
    const hotelRoot = await Category.findOne({ where: { slug: 'hotels' } });
    if (hotelRoot) {
      const hotelSubs = [
        { name: 'Budget', slug: 'hotels-budget', parent_id: hotelRoot.id, sort_order: 1 },
        { name: 'Luxury', slug: 'hotels-luxury', parent_id: hotelRoot.id, sort_order: 2 },
        { name: 'Hill Station', slug: 'hotels-hillstation', parent_id: hotelRoot.id, sort_order: 3 },
        { name: 'Beach Resort', slug: 'hotels-beach-resort', parent_id: hotelRoot.id, sort_order: 4 },
        { name: 'Heritage', slug: 'hotels-heritage', parent_id: hotelRoot.id, sort_order: 5 },
      ];

      for (const sub of hotelSubs) {
        await Category.findOrCreate({
          where: { slug: sub.slug },
          defaults: sub as any,
        });
      }
      console.log('🏨 Hotel subcategories seeded');
    }

    // ─── Activity Sub-categories ───
    const activityRoot = await Category.findOne({ where: { slug: 'activities' } });
    if (activityRoot) {
      const activitySubs = [
        { name: 'Adventure', slug: 'activities-adventure', parent_id: activityRoot.id, sort_order: 1 },
        { name: 'Water Sports', slug: 'activities-water-sports', parent_id: activityRoot.id, sort_order: 2 },
        { name: 'Trekking', slug: 'activities-trekking', parent_id: activityRoot.id, sort_order: 3 },
        { name: 'Sightseeing', slug: 'activities-sightseeing', parent_id: activityRoot.id, sort_order: 4 },
      ];

      for (const sub of activitySubs) {
        await Category.findOrCreate({
          where: { slug: sub.slug },
          defaults: sub as any,
        });
      }
      console.log('🎯 Activity subcategories seeded');
    }

    // ─── Camping Sub-categories ───
    const campingRoot = await Category.findOne({ where: { slug: 'camping' } });
    if (campingRoot) {
      const campingSubs = [
        { name: 'Glamping', slug: 'camping-glamping', parent_id: campingRoot.id, sort_order: 1 },
        { name: 'Riverside', slug: 'camping-riverside', parent_id: campingRoot.id, sort_order: 2 },
        { name: 'Mountain', slug: 'camping-mountain', parent_id: campingRoot.id, sort_order: 3 },
      ];

      for (const sub of campingSubs) {
        await Category.findOrCreate({
          where: { slug: sub.slug },
          defaults: sub as any,
        });
      }
      console.log('⛺ Camping subcategories seeded');
    }

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
