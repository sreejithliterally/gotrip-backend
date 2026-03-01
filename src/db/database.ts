import { Sequelize } from 'sequelize-typescript';
import { config } from '../common/config';

// Import all models explicitly — avoids glob issues
import { User } from '../models/user.model';
import { Vendor } from '../models/vendor.model';
import { Category } from '../models/category.model';
import { Listing } from '../models/listing.model';
import { ListingMedia } from '../models/listing-media.model';
import { Availability } from '../models/availability.model';
import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Review } from '../models/review.model';

const isRDS = config.db.host.includes('amazonaws.com');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  models: [User, Vendor, Category, Listing, ListingMedia, Availability, Booking, Payment, Review],
  logging: config.env === 'development' ? false : false, // set to console.log to see SQL
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
  ...(isRDS && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
});

export default sequelize;
