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
import { User } from './user.model';
import { Listing } from './listing.model';

@Table({
  tableName: 'reviews',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'listing_id'],
      name: 'idx_reviews_user_listing',
    },
  ],
})
export class Review extends Model {
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

  @Column({ type: DataType.INTEGER, allowNull: false, validate: { min: 1, max: 5 } })
  rating!: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  comment!: string | null;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Listing)
  listing!: Listing;
}
