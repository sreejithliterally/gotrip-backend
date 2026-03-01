import { User } from '../models/user.model';
import { ApiError } from '../common/utils/api-error';
import { UserRole } from '../common/types';

export class UserService {
  async getProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['updated_at'] },
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { full_name?: string; email?: string; phone?: string }) {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (data.email && data.email !== user.email) {
      const exists = await User.findOne({ where: { email: data.email } });
      if (exists) throw ApiError.conflict('Email already in use');
    }

    if (data.phone && data.phone !== user.phone) {
      const exists = await User.findOne({ where: { phone: data.phone } });
      if (exists) throw ApiError.conflict('Phone already in use');
    }

    await user.update(data);
    return user;
  }

  async listUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await User.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['updated_at'] },
    });

    return {
      users: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async setRole(userId: string, role: UserRole) {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('User not found');
    await user.update({ role });
    return user;
  }
}

export const userService = new UserService();
