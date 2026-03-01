import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { PaymentStatus } from '../common/types';
import { Booking } from './booking.model';

@Table({ tableName: 'payments', underscored: true })
export class Payment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Booking)
  @Column({ type: DataType.UUID, allowNull: false })
  booking_id!: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  razorpay_order_id!: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  razorpay_payment_id!: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  razorpay_signature!: string | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  amount!: number;

  @Column({ type: DataType.STRING(10), allowNull: false, defaultValue: 'INR' })
  currency!: string;

  @Default(PaymentStatus.CREATED)
  @Column(DataType.ENUM(...Object.values(PaymentStatus)))
  status!: PaymentStatus;

  @Column({ type: DataType.JSONB, allowNull: true })
  webhook_payload!: Record<string, unknown> | null;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  @BelongsTo(() => Booking)
  booking!: Booking;
}
