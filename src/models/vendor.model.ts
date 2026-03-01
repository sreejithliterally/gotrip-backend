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
import { VendorStatus } from '../common/types';
import { User } from './user.model';

@Table({ tableName: 'vendors', underscored: true })
export class Vendor extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id!: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  business_name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  contact_email!: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  contact_phone!: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  address!: string | null;

  @Column({ type: DataType.STRING(50), allowNull: true })
  pan_number!: string | null;

  @Column({ type: DataType.STRING(50), allowNull: true })
  gst_number!: string | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  kyc_document_url!: string | null;

  @Default(VendorStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(VendorStatus)))
  status!: VendorStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  rejection_reason!: string | null;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // ─── Relations ───
  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => require('./listing.model').Listing)
  listings!: any[];
}
