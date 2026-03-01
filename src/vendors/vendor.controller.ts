import { Response } from 'express';
import { vendorService } from './vendor.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest, VendorStatus } from '../common/types';

export class VendorController {
  async apply(req: AuthenticatedRequest, res: Response) {
    const vendor = await vendorService.apply(req.user!.id, req.body);
    return sendSuccess(res, vendor, 'Vendor application submitted', 201);
  }

  async getMyProfile(req: AuthenticatedRequest, res: Response) {
    const vendor = await vendorService.getMyVendorProfile(req.user!.id);
    return sendSuccess(res, vendor);
  }

  async getDashboard(req: AuthenticatedRequest, res: Response) {
    const dashboard = await vendorService.getDashboard(req.user!.id);
    return sendSuccess(res, dashboard);
  }

  // Admin
  async listApplications(req: AuthenticatedRequest, res: Response) {
    const status = String(req.query.status || '') as VendorStatus | undefined;
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const { vendors, meta } = await vendorService.listApplications(status || undefined, page, limit);
    return sendSuccess(res, vendors, 'Vendors fetched', 200, meta);
  }

  async reviewApplication(req: AuthenticatedRequest, res: Response) {
    const vendorId = String(req.params.vendorId);
    const vendor = await vendorService.reviewApplication(vendorId, req.body);
    return sendSuccess(res, vendor, 'Vendor application reviewed');
  }
}

export const vendorController = new VendorController();
