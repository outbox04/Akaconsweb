import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng phải từ 2 ký tự trở lên'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  address: z.string().optional(),
});

export const createProjectSchema = z.object({
  customerId: z.string().uuid('Mã khách hàng không hợp lệ'),
  name: z.string().min(3, 'Tên công trình phải từ 3 ký tự trở lên'),
  type: z.enum(['interior', 'exterior']),
});

export const renderJobSchema = z.object({
  projectImageId: z.string().uuid('ID ảnh công trình không hợp lệ'),
  effectSystemId: z.string().min(1, 'Vui lòng chọn hệ sơn'),
  colorId: z.string().min(1, 'Vui lòng chọn màu sơn'),
  maskBase64: z.string().min(1, 'Vui lòng vẽ vùng mask trước khi render'),
  employeeCode: z.string().min(2).optional(),
  promptAddon: z.string().max(500).optional(),
});

export const computeEstimateSchema = z.object({
  areaM2: z.number().positive('Diện tích m² phải lớn hơn 0'),
  effectSystemId: z.string().min(1),
  vatRate: z.number().finite().min(0).max(100).default(10),
  laborFee: z.number().finite().min(0).max(10_000_000_000).default(0),
  shippingFee: z.number().finite().min(0).max(10_000_000_000).default(0),
  discountAmount: z.number().finite().min(0).max(10_000_000_000).default(0),
});
