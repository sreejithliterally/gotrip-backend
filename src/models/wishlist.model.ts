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
  tableName: 'wishlists',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'listing_id'],
      name: 'idx_wishlists_user_listing',
    },
  ],
})
export class Wishlist extends Model {
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

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // ─── Relations ───
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Listing)
  listing!: Listing;
}
