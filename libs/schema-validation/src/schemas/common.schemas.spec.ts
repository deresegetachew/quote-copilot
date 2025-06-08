import {
  emailSchema,
  passwordSchema,
  uuidSchema,
  mongoIdSchema,
  urlSchema,
  phoneSchema,
  paginationQuerySchema,
  searchQuerySchema,
  successResponseSchema,
  customerDetailSchema,
  rfqItemSchema,
  rfqDataSchema,
} from '../schemas/common.schemas';

describe('CommonSchemas', () => {
  describe('emailSchema', () => {
    it('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@domain.co.uk',
        'valid.email@subdomain.example.org',
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = ['Password123', 'MySecure1Pass', 'Str0ngP@ssw0rd'];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'weak',
        'password',
        'PASSWORD',
        '12345678',
        'NoNumbers',
        'nouppercase1',
      ];

      invalidPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('uuidSchema', () => {
    it('should validate valid UUID formats', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'ffffffff-ffff-4fff-bfff-ffffffffffff',
        '00000000-0000-4000-8000-000000000000',
      ];

      validUuids.forEach((uuid) => {
        const result = uuidSchema.safeParse(uuid);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-426614174000-extra',
        '',
      ];

      invalidUuids.forEach((uuid) => {
        const result = uuidSchema.safeParse(uuid);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('mongoIdSchema', () => {
    it('should validate valid MongoDB ObjectIds', () => {
      const validObjectIds = [
        '507f1f77bcf86cd799439011',
        '123456789012345678901234',
        'abcdef123456789012345678',
      ];

      validObjectIds.forEach((id) => {
        const result = mongoIdSchema.safeParse(id);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid MongoDB ObjectIds', () => {
      const invalidObjectIds = [
        'short',
        'too-long-for-objectid-format',
        'invalid-chars-!@#$%^&*()',
        '',
      ];

      invalidObjectIds.forEach((id) => {
        const result = mongoIdSchema.safeParse(id);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('urlSchema', () => {
    it('should validate valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://subdomain.example.org',
        'https://example.com/path/to/resource',
      ];

      validUrls.forEach((url) => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = ['not-a-url', 'example.com', 'ftp://example.com', ''];

      invalidUrls.forEach((url) => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('phoneSchema', () => {
    it('should validate valid phone numbers', () => {
      const validPhones = ['+1234567890', '+12345678901234', '1234567890'];

      validPhones.forEach((phone) => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['123', '+0123456789', 'not-a-phone', ''];

      invalidPhones.forEach((phone) => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('paginationQuerySchema', () => {
    it('should validate with default values', () => {
      const result = paginationQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
        expect(result.data.sortOrder).toBe('asc');
      }
    });

    it('should transform string values to numbers', () => {
      const result = paginationQuerySchema.safeParse({
        page: '2',
        pageSize: '25',
        sortBy: 'name',
        sortOrder: 'desc',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(25);
        expect(result.data.sortBy).toBe('name');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should reject invalid values', () => {
      const invalidCases = [
        { page: '0' },
        { pageSize: '0' },
        { pageSize: '101' },
        { sortOrder: 'invalid' },
      ];

      invalidCases.forEach((invalidData) => {
        const result = paginationQuerySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('searchQuerySchema', () => {
    it('should extend pagination with search', () => {
      const result = searchQuerySchema.safeParse({
        search: 'test query',
        page: '2',
        pageSize: '20',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('test query');
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(20);
      }
    });
  });

  describe('successResponseSchema', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        message: 'Operation completed',
        data: { id: 1, name: 'test' },
      };

      const result = successResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });

  describe('customerDetailSchema', () => {
    it('should validate customer details', () => {
      const customer = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = customerDetailSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('should handle null name', () => {
      const customer = {
        name: null,
        email: 'john@example.com',
      };

      const result = customerDetailSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });
  });

  describe('rfqItemSchema', () => {
    it('should validate RFQ item', () => {
      const item = {
        itemCode: 'ITEM001',
        itemDescription: 'Test item description',
        quantity: 10,
        unit: 'pieces',
        specifications: 'Test specifications',
      };

      const result = rfqItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantities', () => {
      const item = {
        itemCode: 'ITEM001',
        itemDescription: 'Test item',
        quantity: -5,
        unit: 'pieces',
        specifications: null,
      };

      const result = rfqItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe('rfqDataSchema', () => {
    it('should validate complete RFQ data', () => {
      const rfqData = {
        customerDetail: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        expectedDeliveryDate: '2025-12-31',
        hasAttachments: true,
        notes: ['Note 1', 'Note 2'],
        items: [
          {
            itemCode: 'ITEM001',
            itemDescription: 'Test item',
            quantity: 5,
            unit: 'pieces',
            specifications: 'Test specs',
          },
        ],
      };

      const result = rfqDataSchema.safeParse(rfqData);
      expect(result.success).toBe(true);
    });

    it('should handle null values', () => {
      const rfqData = {
        customerDetail: null,
        expectedDeliveryDate: null,
        hasAttachments: null,
        notes: null,
        items: null,
      };

      const result = rfqDataSchema.safeParse(rfqData);
      expect(result.success).toBe(true);
    });
  });
});
