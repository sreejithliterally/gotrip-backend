export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'GoTrip API',
    version: '1.0.0',
    description: 'Hotel, Activity, Camping & Package Booking Platform',
    contact: { name: 'GoTrip Dev Team' },
  },
  servers: [
    { url: '/api/v1', description: 'Current host' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // ─── Common ───────────────────────────────────────────
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      PaginatedMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      // ─── Auth ─────────────────────────────────────────────
      SendOtpRequest: {
        type: 'object',
        required: ['channel'],
        properties: {
          full_name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          phone: { type: 'string', example: '9876543210' },
          channel: { type: 'string', enum: ['email', 'phone'] },
        },
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['channel', 'otp'],
        properties: {
          full_name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          phone: { type: 'string', example: '9876543210' },
          channel: { type: 'string', enum: ['email', 'phone'] },
          otp: { type: 'string', example: '1234', minLength: 4, maxLength: 4 },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      // ─── User ─────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          full_name: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['user', 'vendor', 'admin'] },
          is_verified: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Vendor ───────────────────────────────────────────
      VendorApplyRequest: {
        type: 'object',
        required: ['business_name'],
        properties: {
          business_name: { type: 'string', example: 'Sunrise Resorts Pvt Ltd' },
          description: { type: 'string' },
          contact_email: { type: 'string', format: 'email' },
          contact_phone: { type: 'string' },
          address: { type: 'string' },
          pan_number: { type: 'string', example: 'ABCDE1234F' },
          gst_number: { type: 'string', example: '29ABCDE1234F1Z5' },
        },
      },
      Vendor: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          business_name: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Category ─────────────────────────────────────────
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Hotels' },
          slug: { type: 'string', example: 'hotels' },
          type: { type: 'string', enum: ['hotel', 'activity', 'camping', 'package'], nullable: true },
          parent_id: { type: 'string', format: 'uuid', nullable: true },
          sort_order: { type: 'integer' },
          is_active: { type: 'boolean' },
          children: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
        },
      },
      // ─── Listing ──────────────────────────────────────────
      CreateListingRequest: {
        type: 'object',
        required: ['category_id', 'title', 'price_start'],
        properties: {
          category_id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Cozy Hill Station Cottage' },
          description: { type: 'string' },
          location: { type: 'string', example: 'Manali, Himachal Pradesh' },
          latitude: { type: 'number', example: 32.2396 },
          longitude: { type: 'number', example: 77.1887 },
          price_start: { type: 'number', example: 2500 },
          amenities: { type: 'array', items: { type: 'string' }, example: ['WiFi', 'Parking', 'Breakfast'] },
          max_guests: { type: 'integer', example: 4 },
          total_rooms: { type: 'integer', example: 10 },
        },
      },
      Listing: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          location: { type: 'string' },
          price_start: { type: 'number' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          category: { $ref: '#/components/schemas/Category' },
          media: { type: 'array', items: { $ref: '#/components/schemas/ListingMedia' } },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      ListingMedia: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          url: { type: 'string', format: 'uri' },
          media_type: { type: 'string', example: 'image' },
          sort_order: { type: 'integer' },
        },
      },
      // ─── Availability ─────────────────────────────────────
      SetAvailabilityRequest: {
        type: 'object',
        required: ['listing_id', 'date', 'total_units', 'available_units', 'price'],
        properties: {
          listing_id: { type: 'string', format: 'uuid' },
          date: { type: 'string', format: 'date', example: '2025-12-25' },
          total_units: { type: 'integer', example: 5 },
          available_units: { type: 'integer', example: 5 },
          price: { type: 'number', example: 3500 },
        },
      },
      BulkAvailabilityRequest: {
        type: 'object',
        required: ['listing_id', 'start_date', 'end_date', 'total_units', 'price'],
        properties: {
          listing_id: { type: 'string', format: 'uuid' },
          start_date: { type: 'string', format: 'date', example: '2025-12-01' },
          end_date: { type: 'string', format: 'date', example: '2025-12-31' },
          total_units: { type: 'integer', example: 5 },
          price: { type: 'number', example: 3500 },
        },
      },
      // ─── Booking ──────────────────────────────────────────
      CreateBookingRequest: {
        type: 'object',
        required: ['listing_id', 'start_date', 'end_date'],
        properties: {
          listing_id: { type: 'string', format: 'uuid' },
          start_date: { type: 'string', format: 'date', example: '2025-12-20' },
          end_date: { type: 'string', format: 'date', example: '2025-12-25' },
          guests: { type: 'integer', example: 2, default: 1 },
          rooms: { type: 'integer', example: 1, default: 1 },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          listing_id: { type: 'string', format: 'uuid' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          guests: { type: 'integer' },
          rooms: { type: 'integer' },
          total_amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Payment ──────────────────────────────────────────
      CreateOrderRequest: {
        type: 'object',
        required: ['booking_id'],
        properties: {
          booking_id: { type: 'string', format: 'uuid' },
        },
      },
      VerifyPaymentRequest: {
        type: 'object',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
        properties: {
          razorpay_order_id: { type: 'string', example: 'order_xxx' },
          razorpay_payment_id: { type: 'string', example: 'pay_xxx' },
          razorpay_signature: { type: 'string' },
        },
      },
      // ─── Review ───────────────────────────────────────────
      CreateReviewRequest: {
        type: 'object',
        required: ['listing_id', 'rating'],
        properties: {
          listing_id: { type: 'string', format: 'uuid' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          comment: { type: 'string', example: 'Amazing place, great views!' },
        },
      },
    },
  },

  paths: {
    // ═══════════════════════════════════════════════════════
    // AUTH
    // ═══════════════════════════════════════════════════════
    '/auth/send-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Send OTP to email or phone',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SendOtpRequest' } } } },
        responses: {
          200: { description: 'OTP sent successfully' },
          429: { description: 'Rate limited — wait before requesting another OTP' },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP — logs in or creates account',
        description: 'If user does not exist, `full_name` is required (signup). If user exists, logs them in.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } } },
        responses: {
          200: { description: 'Returns access_token, refresh_token and user object', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' } } } },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refresh_token: { type: 'string' } } } } } },
        responses: {
          200: { description: 'New access_token and refresh_token' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    // USERS
    // ═══════════════════════════════════════════════════════
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get my profile',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update my profile',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { full_name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' } } } } } },
        responses: { 200: { description: 'Updated user' } },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated user list' } },
      },
    },
    '/users/{userId}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Set user role (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { role: { type: 'string', enum: ['user', 'vendor', 'admin'] } } } } } },
        responses: { 200: { description: 'Role updated' } },
      },
    },

    // ═══════════════════════════════════════════════════════
    // VENDORS
    // ═══════════════════════════════════════════════════════
    '/vendors/apply': {
      post: {
        tags: ['Vendors'],
        summary: 'Apply to become a vendor',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VendorApplyRequest' } } } },
        responses: { 201: { description: 'Application submitted' }, 409: { description: 'Application already exists' } },
      },
    },
    '/vendors/me': {
      get: {
        tags: ['Vendors'],
        summary: 'Get my vendor profile',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Vendor profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Vendor' } } } } },
      },
    },
    '/vendors/dashboard': {
      get: {
        tags: ['Vendors'],
        summary: 'Get vendor dashboard stats (Vendor only)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Dashboard with stats' } },
      },
    },
    '/vendors': {
      get: {
        tags: ['Vendors'],
        summary: 'List vendor applications (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated vendor list' } },
      },
    },
    '/vendors/{vendorId}/review': {
      patch: {
        tags: ['Vendors'],
        summary: 'Approve or reject vendor application (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'vendorId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['approved', 'rejected'] }, rejection_reason: { type: 'string' } } } } } },
        responses: { 200: { description: 'Vendor status updated' } },
      },
    },

    // ═══════════════════════════════════════════════════════
    // CATEGORIES
    // ═══════════════════════════════════════════════════════
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get all root categories with nested children',
        responses: { 200: { description: 'Category tree', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'slug'], properties: { name: { type: 'string' }, slug: { type: 'string' }, parent_id: { type: 'string', format: 'uuid', nullable: true }, type: { type: 'string', enum: ['hotel', 'activity', 'camping', 'package'] }, sort_order: { type: 'integer' } } } } } },
        responses: { 201: { description: 'Category created' } },
      },
    },
    '/categories/type/{type}': {
      get: {
        tags: ['Categories'],
        summary: 'Get categories by type (hotel / activity / camping / package)',
        parameters: [{ name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['hotel', 'activity', 'camping', 'package'] } }],
        responses: { 200: { description: 'Categories of that type with subcategories' } },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get single category with parent and children',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Category detail' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update category (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // ═══════════════════════════════════════════════════════
    // LISTINGS
    // ═══════════════════════════════════════════════════════
    '/listings': {
      get: {
        tags: ['Listings'],
        summary: 'Browse published listings',
        parameters: [
          { name: 'category_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'min_price', in: 'query', schema: { type: 'number' } },
          { name: 'max_price', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['price_start', 'created_at'] } },
          { name: 'sort_order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'] } },
        ],
        responses: { 200: { description: 'Paginated listings' } },
      },
      post: {
        tags: ['Listings'],
        summary: 'Create listing (Vendor only)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateListingRequest' } } } },
        responses: { 201: { description: 'Listing created as draft' } },
      },
    },
    '/listings/vendor/mine': {
      get: {
        tags: ['Listings'],
        summary: 'Get my listings (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Vendor\'s listings' } },
      },
    },
    '/listings/{id}': {
      get: {
        tags: ['Listings'],
        summary: 'Get listing detail',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Listing with media, category, vendor, reviews' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Listings'],
        summary: 'Update listing (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string', enum: ['draft', 'published', 'archived'] } } } } } },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Listings'],
        summary: 'Delete listing (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/listings/{id}/publish': {
      patch: {
        tags: ['Listings'],
        summary: 'Publish a listing (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Listing published — now visible in public browse' } },
      },
    },
    '/listings/{id}/unpublish': {
      patch: {
        tags: ['Listings'],
        summary: 'Unpublish a listing back to draft (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Listing moved back to draft' } },
      },
    },
    '/listings/{id}/media': {
      post: {
        tags: ['Listings'],
        summary: 'Add media to listing (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['url'], properties: { url: { type: 'string', format: 'uri' }, sort_order: { type: 'integer' } } } } } },
        responses: { 201: { description: 'Media added' } },
      },
    },
    '/listings/{id}/media/{mediaId}': {
      delete: {
        tags: ['Listings'],
        summary: 'Remove media from listing (Vendor only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'mediaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'Media removed' } },
      },
    },

    // ═══════════════════════════════════════════════════════
    // BOOKINGS
    // ═══════════════════════════════════════════════════════
    '/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBookingRequest' } } } },
        responses: { 201: { description: 'Booking created with status=pending' }, 400: { description: 'No availability or listing not published' } },
      },
      get: {
        tags: ['Bookings'],
        summary: 'Get my bookings',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated bookings' } },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking detail',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Booking with listing and payment' } },
      },
    },
    '/bookings/{id}/cancel': {
      post: {
        tags: ['Bookings'],
        summary: 'Cancel a booking',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { cancellation_reason: { type: 'string' } } } } } },
        responses: { 200: { description: 'Booking cancelled, availability restored' } },
      },
    },
    '/bookings/availability/{listingId}': {
      get: {
        tags: ['Bookings'],
        summary: 'Check availability for a listing',
        parameters: [
          { name: 'listingId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'start_date', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2025-12-01' } },
          { name: 'end_date', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2025-12-31' } },
        ],
        responses: { 200: { description: 'Availability rows per date' } },
      },
    },
    '/bookings/availability': {
      post: {
        tags: ['Bookings'],
        summary: 'Set availability for a single date (Vendor only)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SetAvailabilityRequest' } } } },
        responses: { 200: { description: 'Availability set' } },
      },
    },
    '/bookings/availability/bulk': {
      post: {
        tags: ['Bookings'],
        summary: 'Set availability for a date range (Vendor only)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkAvailabilityRequest' } } } },
        responses: { 200: { description: 'Bulk availability set' } },
      },
    },

    // ═══════════════════════════════════════════════════════
    // PAYMENTS
    // ═══════════════════════════════════════════════════════
    '/payments/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create Razorpay order for a booking',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } } },
        responses: { 200: { description: 'Returns order_id, amount, currency, key_id for Razorpay SDK' } },
      },
    },
    '/payments/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify payment after client-side Razorpay completion',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPaymentRequest' } } } },
        responses: { 200: { description: 'Payment verified, booking confirmed' }, 400: { description: 'Invalid signature' } },
      },
    },
    '/payments/webhook': {
      post: {
        tags: ['Payments'],
        summary: 'Razorpay webhook (called by Razorpay, not your app)',
        description: 'Handles payment.captured and payment.failed events. Idempotent.',
        responses: { 200: { description: 'Webhook processed' } },
      },
    },

    // ═══════════════════════════════════════════════════════
    // REVIEWS
    // ═══════════════════════════════════════════════════════
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Create a review (must have completed booking)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReviewRequest' } } } },
        responses: { 201: { description: 'Review created' }, 403: { description: 'No completed booking for this listing' }, 409: { description: 'Already reviewed' } },
      },
    },
    '/reviews/listing/{listingId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get reviews for a listing',
        parameters: [
          { name: 'listingId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated reviews' } },
      },
    },
    '/reviews/{id}': {
      patch: {
        tags: ['Reviews'],
        summary: 'Update your review',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } } } } },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete your review',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
};
