import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest, CategoryType } from '../common/types';

export class CategoryController {
  async getRootCategories(_req: Request, res: Response) {
    const categories = await categoryService.getRootCategories();
    return sendSuccess(res, categories);
  }

  async getCategoriesByType(req: Request, res: Response) {
    const type = String(req.params.type) as CategoryType;
    const categories = await categoryService.getCategoriesByType(type);
    return sendSuccess(res, categories);
  }

  async getById(req: Request, res: Response) {
    const category = await categoryService.getById(String(req.params.id));
    return sendSuccess(res, category);
  }

  // Admin
  async create(req: AuthenticatedRequest, res: Response) {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, 'Category created', 201);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const category = await categoryService.update(String(req.params.id), req.body);
    return sendSuccess(res, category, 'Category updated');
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const result = await categoryService.delete(String(req.params.id));
    return sendSuccess(res, result, 'Category deleted');
  }
}

export const categoryController = new CategoryController();
