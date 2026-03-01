import { Category } from '../models/category.model';
import { ApiError } from '../common/utils/api-error';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validator';
import { CategoryType } from '../common/types';

export class CategoryService {
  async getRootCategories() {
    return Category.findAll({
      where: { parent_id: null, is_active: true },
      order: [['sort_order', 'ASC']],
      include: [
        {
          model: Category,
          as: 'children',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: Category,
              as: 'children',
              where: { is_active: true },
              required: false,
            },
          ],
        },
      ],
    });
  }

  async getCategoriesByType(type: CategoryType) {
    return Category.findAll({
      where: { type, parent_id: null, is_active: true },
      order: [['sort_order', 'ASC']],
      include: [
        {
          model: Category,
          as: 'children',
          where: { is_active: true },
          required: false,
          include: [
            { model: Category, as: 'children', where: { is_active: true }, required: false },
          ],
        },
      ],
    });
  }

  async getById(id: string) {
    const category = await Category.findByPk(id, {
      include: [
        { model: Category, as: 'children', required: false },
        { model: Category, as: 'parent', required: false },
      ],
    });
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  }

  async create(input: CreateCategoryInput) {
    const existing = await Category.findOne({ where: { slug: input.slug } });
    if (existing) throw ApiError.conflict('Category slug already exists');
    return Category.create(input as any);
  }

  async update(id: string, input: UpdateCategoryInput) {
    const category = await Category.findByPk(id);
    if (!category) throw ApiError.notFound('Category not found');

    if (input.slug && input.slug !== category.slug) {
      const exists = await Category.findOne({ where: { slug: input.slug } });
      if (exists) throw ApiError.conflict('Category slug already exists');
    }

    await category.update(input);
    return category;
  }

  async delete(id: string) {
    const category = await Category.findByPk(id);
    if (!category) throw ApiError.notFound('Category not found');
    await category.destroy();
    return { deleted: true };
  }
}

export const categoryService = new CategoryService();
