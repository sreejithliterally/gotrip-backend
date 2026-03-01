import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasOne,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { BookingStatus } from '../common/types';
import { User } from './user.model';
import { Listing } from './listing.model';

@Table({ tableName: 'bookings', underscored: true })
export class Booking extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id!: string;

  @ForeignKey(() => Listing)
  @Column({ type: DataType.UUID, allowNull: false })
  listing_id!: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  start_date!: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  end_date!: string;

  @Default(1)
  @Column(DataType.INTEGER)
  guests!: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  total_amount!: number;

  @Default(BookingStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(BookingStatus)))
  status!: BookingStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  cancellation_reason!: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  cancelled_at!: Date | null;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // ─── Relations ───
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Listing)
  listing!: Listing;

  @HasOne(() => require('./payment.model').Payment)
  payment!: any;
}
