import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { CategoryType } from '../common/types';

@Table({ tableName: 'categories', underscored: true })
export class Category extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Unique
  @Column({ type: DataType.STRING(100), allowNull: false })
  slug!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  icon_url!: string | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  image_url!: string | null;

  // Self-referencing FK for hierarchy: Hotel → Luxury → Hillstation
  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, allowNull: true })
  parent_id!: string | null;

  @Column({ type: DataType.ENUM(...Object.values(CategoryType)), allowNull: true })
  type!: CategoryType | null;

  @Default(0)
  @Column(DataType.INTEGER)
  sort_order!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // ─── Relations ───
  @BelongsTo(() => Category, 'parent_id')
  parent!: Category;

  @HasMany(() => Category, 'parent_id')
  children!: Category[];

  @HasMany(() => require('./listing.model').Listing)
  listings!: any[];
}
