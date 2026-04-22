import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ListingStatus } from '../common/types';
import { Vendor } from './vendor.model';
import { Category } from './category.model';

@Table({ tableName: 'listings', underscored: true })
export class Listing extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Vendor)
  @Column({ type: DataType.UUID, allowNull: false })
  vendor_id!: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, allowNull: false })
  category_id!: string;

  @Column({ type: DataType.STRING(300), allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  @Column({ type: DataType.STRING(300), allowNull: true })
  location!: string | null;

  @Column({ type: DataType.DECIMAL(10, 7), allowNull: true })
  latitude!: number | null;

  @Column({ type: DataType.DECIMAL(10, 7), allowNull: true })
  longitude!: number | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  price_start!: number;

  @Column({ type: DataType.JSONB, allowNull: true })
  amenities!: string[] | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  policies!: Record<string, unknown> | null;

  @Default(0)
  @Column(DataType.INTEGER)
  max_guests!: number;

  @Default(0)
  @Column(DataType.INTEGER)
  total_rooms!: number;

  @Default(ListingStatus.DRAFT)
  @Column(DataType.ENUM(...Object.values(ListingStatus)))
  status!: ListingStatus;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return 0;
    },
  })
  rating!: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // ─── Relations ───
  @BelongsTo(() => Vendor)
  vendor!: Vendor;

  @BelongsTo(() => Category)
  category!: Category;

  @HasMany(() => require('./listing-media.model').ListingMedia)
  media!: any[];

  @HasMany(() => require('./availability.model').Availability)
  availability!: any[];

  @HasMany(() => require('./booking.model').Booking)
  bookings!: any[];

  @HasMany(() => require('./review.model').Review)
  reviews!: any[];
}
