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
import { Listing } from './listing.model';

@Table({ tableName: 'listing_media', underscored: true })
export class ListingMedia extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Listing)
  @Column({ type: DataType.UUID, allowNull: false })
  listing_id!: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  url!: string;

  @Column({ type: DataType.STRING(50), allowNull: true, defaultValue: 'image' })
  media_type!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  sort_order!: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  @BelongsTo(() => Listing)
  listing!: Listing;
}
