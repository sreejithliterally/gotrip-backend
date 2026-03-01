import { Response } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest } from '../common/types';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    const user = await userService.getProfile(req.user!.id);
    return sendSuccess(res, user);
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    const user = await userService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, user, 'Profile updated');
  }

  async listUsers(req: AuthenticatedRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const { users, meta } = await userService.listUsers(page, limit);
    return sendSuccess(res, users, 'Users fetched', 200, meta);
  }

  async setRole(req: AuthenticatedRequest, res: Response) {
    const userId = String(req.params.userId);
    const { role } = req.body;
    const user = await userService.setRole(userId, role);
    return sendSuccess(res, user, 'Role updated');
  }
}

export const userController = new UserController();
