import { Vendor } from '../models/vendor.model';
import { User } from '../models/user.model';
import { ApiError } from '../common/utils/api-error';
import { VendorStatus, UserRole } from '../common/types';
import { ApplyVendorInput, ReviewVendorInput } from './vendor.validator';

export class VendorService {
  async apply(userId: string, input: ApplyVendorInput) {
    const existing = await Vendor.findOne({ where: { user_id: userId } });
    if (existing) throw ApiError.conflict('Vendor application already exists');

    const vendor = await Vendor.create({
      user_id: userId,
      ...input,
      status: VendorStatus.PENDING,
    });

    return vendor;
  }

  async getMyVendorProfile(userId: string) {
    const vendor = await Vendor.findOne({
      where: { user_id: userId },
      include: [{ model: User, attributes: ['id', 'full_name', 'email', 'phone'] }],
    });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');
    return vendor;
  }

  async getDashboard(userId: string) {
    const vendor = await Vendor.findOne({ where: { user_id: userId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');
    if (vendor.status !== VendorStatus.APPROVED) throw ApiError.forbidden('Vendor not approved yet');

    return {
      vendor,
      stats: { total_listings: 0, total_bookings: 0, total_revenue: 0 },
    };
  }

  async listApplications(status?: VendorStatus, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const where = status ? { status } : {};

    const { rows, count } = await Vendor.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, attributes: ['id', 'full_name', 'email', 'phone'] }],
    });

    return {
      vendors: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async reviewApplication(vendorId: string, input: ReviewVendorInput) {
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) throw ApiError.notFound('Vendor not found');

    await vendor.update({
      status: input.status as VendorStatus,
      rejection_reason: input.status === 'rejected' ? input.rejection_reason : null,
    });

    if (input.status === 'approved') {
      await User.update({ role: UserRole.VENDOR }, { where: { id: vendor.user_id } });
    }

    return vendor;
  }
}

export const vendorService = new VendorService();
