import { z } from 'zod';

// Common field validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  );

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .regex(
    /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
    'Invalid URL format - must be HTTP or HTTPS',
  );

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^(\+[1-9]\d{7,14}|[1-9]\d{9,14})$/,
    'Invalid phone number format - must be 10-15 digits, optionally starting with +',
  );

// Pagination schemas
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be greater than 0'),

  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine(
      (val) => val > 0 && val <= 100,
      'Page size must be between 1 and 100',
    ),

  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const searchQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

// Date schemas
export const dateStringSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format');

export const isoDateSchema = z.string().datetime('Invalid ISO date format');

// Common response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
        code: z.string(),
      }),
    )
    .optional(),
});

// Common entity schemas
export const baseEntitySchema = z.object({
  id: mongoIdSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const softDeleteEntitySchema = baseEntitySchema.extend({
  deletedAt: z.date().nullable(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().positive('File size must be positive'),
  buffer: z.instanceof(Buffer).optional(),
  path: z.string().optional(),
});

export const imageUploadSchema = fileUploadSchema.extend({
  mimetype: z.string().regex(/^image\//, 'File must be an image'),
});

// Thread and message schemas for your domain
export const threadIdSchema = z.string().min(1, 'Thread ID is required');

export const messageIdSchema = z.string().min(1, 'Message ID is required');

export const emailAddressSchema = z.string().email('Invalid email address');

export const customerDetailSchema = z.object({
  name: z.string().nullable(),
  email: emailAddressSchema,
});

export const rfqItemSchema = z.object({
  itemCode: z.string(),
  itemDescription: z.string().nullable(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().nullable(),
  specifications: z.string().nullable(),
});

export const rfqDataSchema = z.object({
  customerDetail: customerDetailSchema.nullable(),
  expectedDeliveryDate: z.string().nullable(),
  hasAttachments: z.boolean().nullable(),
  notes: z.array(z.string()).nullable(),
  items: z.array(rfqItemSchema).nullable(),
});
