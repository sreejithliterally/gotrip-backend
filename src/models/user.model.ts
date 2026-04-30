import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  HasOne,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserRole } from '../common/types';

@Table({ tableName: 'users', underscored: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  full_name!: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: true })
  email!: string | null;

  @Unique
  @Column({ type: DataType.STRING(20), allowNull: true })
  phone!: string | null;

  @Default(UserRole.USER)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: UserRole;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_verified!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_email_verified!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_phone_verified!: boolean;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // ─── Relations (lazy to avoid circular imports) ───
  @HasOne(() => require('./vendor.model').Vendor)
  vendor!: any;

  @HasMany(() => require('./booking.model').Booking)
  bookings!: any[];

  @HasMany(() => require('./review.model').Review)
  reviews!: any[];

  @HasMany(() => require('./wishlist.model').Wishlist)
  wishlists!: any[];
}
