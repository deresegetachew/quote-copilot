import {
  emailSchema,
  passwordSchema,
  urlSchema,
  phoneSchema,
  paginationQuerySchema,
  searchQuerySchema,
  successResponseSchema,
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
});
