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

@Table({
  tableName: 'availability',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['listing_id', 'date'],
      name: 'idx_availability_listing_date',
    },
  ],
})
export class Availability extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Listing)
  @Column({ type: DataType.UUID, allowNull: false })
  listing_id!: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: string;

  @Default(1)
  @Column(DataType.INTEGER)
  total_units!: number;

  @Default(1)
  @Column(DataType.INTEGER)
  available_units!: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  price!: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  @BelongsTo(() => Listing)
  listing!: Listing;
}
