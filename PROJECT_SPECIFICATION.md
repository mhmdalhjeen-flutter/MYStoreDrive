# Arabic E-Commerce Platform - Project Specification

## 1. Functional Requirements

### 1.1 Core Store Functionality
- Home page with featured products and announcements
- Product categories browsing and filtering
- Product listing with search and filtering capabilities
- Product details page with comprehensive information
- Product images gallery
- Product pricing display
- Product descriptions
- Product tags for categorization
- Product availability status
- Product stock quantity display
- Product variants (size, color, etc.) when applicable
- New/Used condition indicator
- Recommended products suggestions
- Special offers display
- Shopping cart management
- Checkout process
- Customer account management
- Order history and tracking
- Order details view
- Delivery address management
- Delivery area selection
- Customer support messaging
- Store announcements display

### 1.2 Progressive Free Delivery System
- Each product has configurable "Free Delivery Value"
- System calculates total free-delivery value: SUM(product.freeDeliveryValue × quantity)
- Admin-defined global Free Delivery Target
- Real-time progress indicator in cart (e.g., 🚚 7 / 10)
- Progress display caps at target (never shows 14/10 when target is 10)
- Customer can continue shopping after reaching target
- Dynamic progress updates on cart changes
- Optional partial free-delivery feature
- Partial threshold and discount percentage configuration
- Arabic success messages for milestones

### 1.3 Delivery Areas Management
- Admin-configured delivery areas
- Each area has specific delivery fee
- Area eligibility for free delivery (boolean)
- Area active/inactive status
- Customer selects main area from configured list
- Customer enters detailed address within selected area
- Backend validation of delivery area eligibility

### 1.4 Admin Product Management
- Create, edit, delete products
- Product image upload
- Product name (Arabic)
- Category assignment
- Price configuration
- Free Delivery Value per product
- Availability status
- Stock quantity management
- Product description (Arabic)
- Product tags
- Product variants
- Recommended product flag
- New/Used condition
- Offer status and configuration
- Offer type (percentage/fixed)
- Offer value
- Offer start/end dates
- Product enable/disable

### 1.5 Admin Store Management
- "My Store" section
- Product listing with filters
- Bulk operations support
- Category management
- Offer management
- Stock alerts
- Availability management

### 1.6 Admin Delivery Settings
- Free Delivery Target configuration
- Partial free delivery enable/disable
- Partial threshold configuration
- Partial discount percentage
- Delivery area management
- Area-specific delivery fees
- Area free delivery eligibility
- Area active/inactive status

### 1.7 Admin Dashboard Analytics
- Total orders count
- Orders today/this week/this month
- Total customers
- Product count
- Available products count
- Out-of-stock products count
- Total sales/revenue
- Average order value
- Best-selling products
- Store performance trends
- Revenue charts
- Order status distribution

### 1.8 Customer Account
- Profile management
- Phone number
- Address management (multiple addresses)
- Order history
- Order details
- Support message history
- Account settings
- Logout functionality

### 1.9 Phone Verification
- OTP-based phone verification for first order/registration
- OTP provider integration
- Rate limiting and abuse protection
- Brute-force protection
- Request throttling

## 2. Non-Functional Requirements

### 2.1 Performance
- Page load time < 3 seconds
- API response time < 500ms for most operations
- Support concurrent users (scalability)
- Image optimization and lazy loading
- Database query optimization
- Caching strategy for static content

### 2.2 Security
- All business logic validation on backend
- Secure authentication and authorization
- Input validation and sanitization
- Rate limiting on all endpoints
- Secure session/token handling
- Password hashing (bcrypt/argon2)
- OTP protection mechanisms
- Security headers (CSP, XSS protection)
- CORS configuration
- Database access control
- Error handling without information leakage
- Audit logging for admin actions
- Environment-based secrets management
- Secure file upload handling

### 2.3 Reliability
- 99.9% uptime target
- Database backup strategy
- Error monitoring and logging
- Graceful degradation
- Data consistency guarantees

### 2.4 Usability
- Arabic language support throughout
- RTL layout for all interfaces
- Mobile-first responsive design
- Intuitive navigation
- Clear error messages in Arabic
- Loading states and feedback
- Accessibility compliance (WCAG 2.1 AA)

### 2.5 Maintainability
- Clean code architecture
- Comprehensive documentation
- Type safety (TypeScript)
- Code consistency
- Modular design
- API versioning strategy

## 3. User Roles

### 3.1 Customer
- Browse products and categories
- Add products to cart
- Manage cart quantities
- Checkout and place orders
- View order history
- Manage addresses
- Contact support
- Manage profile
- Verify phone number

### 3.2 Admin
- Manage all products
- Configure delivery settings
- Manage delivery areas
- View analytics and reports
- Manage orders
- Handle customer support
- Configure store settings
- View and manage customers
- Create announcements

### 3.3 System (Background)
- Process scheduled tasks
- Handle offer expiration
- Generate analytics
- Send notifications
- Cleanup operations

## 4. System Modules

### 4.1 Customer Store Frontend
- Home module
- Product catalog module
- Product details module
- Cart module
- Checkout module
- Account module
- Authentication module
- Support module

### 4.2 Admin Dashboard Frontend
- Dashboard module
- Product management module
- Category management module
- Order management module
- Customer management module
- Delivery settings module
- Analytics module
- Support module
- Settings module
- Announcement module

### 4.3 Backend API
- Authentication module
- User management module
- Product module
- Category module
- Cart module
- Order module
- Delivery module
- Payment module (integration point)
- Notification module
- Support module
- Analytics module
- Settings module
- File upload module
- OTP module

### 4.4 Database
- User data
- Product data
- Order data
- Cart data
- Delivery data
- Settings data
- Analytics data
- Support data

## 5. Main User Flows

### 5.1 Product Discovery Flow
1. Customer visits home page
2. Browses categories or uses search
3. Views product listing with filters
4. Clicks on product to view details
5. Reviews product information, images, variants
6. Adds product to cart
7. Continues browsing or proceeds to checkout

### 5.2 Cart Management Flow
1. Customer views cart
2. System displays current free-delivery progress
3. Customer adjusts quantities
4. Progress updates dynamically
5. Customer removes products if needed
6. Customer proceeds to checkout when ready

### 5.3 Checkout Flow
1. Customer proceeds to checkout
2. If not authenticated: prompted to login/register
3. If first order: phone verification required
4. Customer selects or adds delivery address
5. Customer selects delivery area
6. Backend validates delivery area
7. Backend calculates:
   - Cart contents
   - Product quantities
   - Free-delivery score
   - Capped progress
   - Delivery area eligibility
   - Partial delivery discount (if applicable)
   - Final delivery fee
   - Order total
8. Customer reviews order summary
9. Customer confirms order
10. Order created and confirmed
11. Customer receives order confirmation

### 5.4 Order Tracking Flow
1. Customer logs in
2. Navigates to orders section
3. Views order list
4. Clicks on specific order
5. Views order details and status
6. Tracks delivery progress

### 5.5 Account Management Flow
1. Customer logs in
2. Navigates to account settings
3. Updates profile information
4. Manages addresses (add/edit/delete)
5. Views support message history
6. Sends new support message
7. Logs out

## 6. Admin Flows

### 6.1 Product Management Flow
1. Admin logs in to dashboard
2. Navigates to "My Store" → Products
3. Views product list with filters
4. Clicks "Add Product" or edits existing
5. Fills product form:
   - Uploads images
   - Enters name (Arabic)
   - Selects category
   - Sets price
   - Configures free delivery value
   - Sets availability
   - Manages stock
   - Adds description (Arabic)
   - Adds tags
   - Configures variants
   - Sets recommended flag
   - Selects condition (new/used)
   - Configures offer if applicable
6. Saves product
7. Product appears in store

### 6.2 Delivery Settings Flow
1. Admin navigates to Settings → Delivery
2. Configures global settings:
   - Free Delivery Target
   - Enable/Disable Partial Free Delivery
   - Partial Threshold
   - Partial Discount Percentage
3. Manages delivery areas:
   - Adds new area
   - Sets area name
   - Sets delivery fee
   - Sets free delivery eligibility
   - Sets active/inactive status
4. Saves settings
5. Changes immediately affect checkout logic

### 6.3 Order Management Flow
1. Admin navigates to Orders
2. Views order list with filters
3. Clicks on specific order
4. Views order details
5. Updates order status
6. Handles customer issues if needed
7. Communicates with customer via support

### 6.4 Analytics Review Flow
1. Admin navigates to Dashboard
2. Views key metrics:
   - Total orders
   - Recent order trends
   - Revenue charts
   - Customer statistics
   - Product performance
3. Drills down into specific metrics
4. Exports reports if needed

## 7. Complete Free-Delivery Logic

### 7.1 Product Configuration
- Each product has `freeDeliveryValue` (integer/decimal)
- Default value: 0 (not eligible for free delivery)
- Value represents contribution to free-delivery target

### 7.2 Global Configuration
- `freeDeliveryTarget` (integer/decimal)
- `partialFreeDeliveryEnabled` (boolean)
- `partialFreeDeliveryThreshold` (integer/decimal)
- `partialFreeDeliveryDiscount` (percentage, 0-100)

### 7.3 Score Calculation
```
cartScore = SUM(product.freeDeliveryValue × quantity)
```

### 7.4 Display Progress
```
displayedScore = MIN(cartScore, freeDeliveryTarget)
displayedProgress = displayedScore / freeDeliveryTarget
```

Example:
- Target = 10
- Cart score = 14
- Displayed: 10 / 10 (not 14 / 10)

### 7.5 Partial Free Delivery Logic
When `partialFreeDeliveryEnabled = true`:

```
IF cartScore >= partialFreeDeliveryThreshold AND cartScore < freeDeliveryTarget:
    discountPercentage = partialFreeDeliveryDiscount
ELSE IF cartScore >= freeDeliveryTarget:
    discountPercentage = 100
ELSE:
    discountPercentage = 0
```

### 7.6 Final Delivery Fee Calculation
```
baseDeliveryFee = area.deliveryFee
areaEligibleForFreeDelivery = area.eligibleForFreeDelivery

IF NOT areaEligibleForFreeDelivery:
    finalDeliveryFee = baseDeliveryFee
ELSE:
    IF cartScore >= freeDeliveryTarget:
        finalDeliveryFee = 0
    ELSE IF partialFreeDeliveryEnabled AND cartScore >= partialFreeDeliveryThreshold:
        finalDeliveryFee = baseDeliveryFee × (1 - partialFreeDeliveryDiscount / 100)
    ELSE:
        finalDeliveryFee = baseDeliveryFee
```

### 7.7 Customer Messages
- Reaching partial threshold: "🎉 مبروك! حصلت على خصم 50% من رسوم التوصيل."
- Reaching full target: "🎉 مبروك! حصلت على التوصيل المجاني."

### 7.8 Progress Display Format
- Visual: 🚚 X / Y
- X: Current progress (capped at target)
- Y: Target value
- Progress bar or circular indicator

### 7.9 Dynamic Updates
Progress updates when:
- Product added to cart
- Quantity increased
- Quantity decreased
- Product removed
- Cart cleared

### 7.10 Backend Validation
Backend must recalculate on every checkout:
- Cart contents
- Product quantities
- Product free-delivery values
- Cart score
- Displayed progress
- Delivery area eligibility
- Final delivery fee
- Order total

## 8. Delivery-Area Logic

### 8.1 Area Configuration
Each delivery area has:
- `id` (unique identifier)
- `name` (Arabic, e.g., "رفديا")
- `deliveryFee` (decimal)
- `eligibleForFreeDelivery` (boolean)
- `isActive` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### 8.2 Area Selection Flow
1. Customer proceeds to checkout
2. System loads active delivery areas
3. Customer selects main area from dropdown
4. Customer enters detailed address (free text)
5. System validates selected area is active
6. Backend validates area eligibility for free delivery

### 8.3 Area Eligibility Rules
- Only active areas can be selected
- Area must be explicitly marked as eligible for free delivery
- If area not eligible, normal delivery fee always applies regardless of cart score

### 8.4 Backend Validation
```
SELECT area FROM delivery_areas WHERE id = ? AND isActive = true
IF area not found:
    RETURN error "Invalid delivery area"
IF NOT area.eligibleForFreeDelivery:
    deliveryFee = area.deliveryFee (no free delivery possible)
ELSE:
    Apply free delivery logic
```

### 8.5 Area Management
- Admin can add/edit/delete areas
- Admin can activate/deactivate areas
- Changes immediately affect checkout
- Historical orders keep original area configuration

## 9. Checkout Logic

### 9.1 Checkout Process
1. Customer clicks checkout from cart
2. Authentication check:
   - If not authenticated: redirect to login/register
   - If authenticated but no phone verified: require phone verification
3. Load customer's saved addresses
4. Customer selects existing address or adds new one
5. Customer selects delivery area
6. System validates delivery area
7. Backend calculates order totals:
   ```
   subtotal = SUM(product.price × quantity)
   cartScore = SUM(product.freeDeliveryValue × quantity)
   displayedScore = MIN(cartScore, freeDeliveryTarget)
   
   IF area.eligibleForFreeDelivery:
       IF cartScore >= freeDeliveryTarget:
           deliveryFee = 0
       ELSE IF partialFreeDeliveryEnabled AND cartScore >= partialFreeDeliveryThreshold:
           deliveryFee = area.deliveryFee × (1 - partialFreeDeliveryDiscount / 100)
       ELSE:
           deliveryFee = area.deliveryFee
   ELSE:
       deliveryFee = area.deliveryFee
   
   total = subtotal + deliveryFee
   ```
8. Display order summary with breakdown
9. Customer confirms order
10. Create order with calculated values
11. Update product stock
12. Send confirmation to customer
13. Redirect to order confirmation page

### 9.2 Validation Rules
- All products in cart must be available
- All products must have sufficient stock
- Delivery area must be active
- Customer must have valid phone number
- Customer must have valid delivery address
- Order total must be positive

### 9.3 Error Handling
- Product out of stock: remove from cart or show error
- Product discontinued: show error
- Invalid delivery area: show error
- Stock insufficient: show maximum available quantity
- Address incomplete: show validation error

### 9.4 Order Creation
```
Order {
  id: unique
  customerId: foreign key
  status: enum (pending, confirmed, processing, shipped, delivered, cancelled)
  subtotal: decimal
  deliveryFee: decimal
  total: decimal
  cartScore: decimal
  deliveryAreaId: foreign key
  deliveryAddress: text
  createdAt: timestamp
  updatedAt: timestamp
}

OrderItem {
  id: unique
  orderId: foreign key
  productId: foreign key
  quantity: integer
  price: decimal (snapshot at time of order)
  freeDeliveryValue: decimal (snapshot)
}
```

## 10. Order Lifecycle

### 10.1 Order States
- `pending`: Order created, awaiting confirmation
- `confirmed`: Order confirmed by admin/system
- `processing`: Order being prepared
- `shipped`: Order shipped, on the way
- `delivered`: Order delivered successfully
- `cancelled`: Order cancelled by admin or customer

### 10.2 State Transitions
```
pending → confirmed
confirmed → processing
processing → shipped
shipped → delivered
pending/confirmed/processing → cancelled
```

### 10.3 Admin Actions
- View all orders
- Filter by status, date, customer
- Update order status
- Add order notes
- Cancel orders
- Handle returns/refunds (future scope)

### 10.4 Customer Actions
- View order status
- Track order progress
- Request support for order issues
- Cancel order (if in pending state - configurable)

### 10.5 Stock Management
- Stock reserved when order created
- Stock deducted when order confirmed
- Stock restored if order cancelled
- Low stock alerts for admin

## 11. Authentication Flow

### 11.1 Customer Registration
1. Customer clicks "Register"
2. Enters phone number
3. System sends OTP via SMS
4. Customer enters OTP
5. System validates OTP
6. If valid: create account or link to existing
7. Customer enters name and creates password (optional)
8. Account created
9. Customer logged in

### 11.2 Customer Login
1. Customer clicks "Login"
2. Enters phone number
3. System sends OTP
4. Customer enters OTP
5. System validates OTP
6. If valid: log in customer
7. Redirect to account or checkout

### 11.3 Admin Authentication
1. Admin accesses dashboard URL
2. Enters email and password
3. System validates credentials
4. If valid: create session/JWT
5. Redirect to dashboard
6. Session expires after inactivity

### 11.4 Session Management
- JWT tokens for API authentication
- Refresh token mechanism
- Token expiration: 24 hours (access), 30 days (refresh)
- Secure storage (httpOnly cookies for web)
- Logout invalidates tokens

### 11.5 OTP Security
- Rate limiting: max 5 requests per hour per phone number
- OTP expiration: 10 minutes
- Max attempts: 3 per OTP
- OTP length: 6 digits
- Numeric only
- Case-insensitive validation

## 12. Security Requirements

### 12.1 Authentication Security
- Password hashing with bcrypt (cost factor 12)
- JWT with RS256 asymmetric keys
- Secure token storage
- Token rotation on refresh
- CSRF protection for web
- Session timeout after inactivity

### 12.2 API Security
- Rate limiting per endpoint
- API key authentication for admin (optional)
- Request signature validation (optional)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- CORS configuration
- Security headers:
  - Strict-Transport-Security
  - X-Content-Type-Options
  - X-Frame-Options
  - Content-Security-Policy
  - X-XSS-Protection

### 12.3 Data Protection
- Encryption at rest (database)
- Encryption in transit (TLS 1.3)
- Sensitive data logging prevention
- PII protection
- GDPR compliance considerations

### 12.4 Authorization
- Role-based access control (RBAC)
- Permission checks on all admin endpoints
- Customer data isolation
- Admin action audit logging
- Resource ownership validation

### 12.5 File Upload Security
- File type validation (MIME type + extension)
- File size limits (images: 5MB max)
- Virus scanning (if feasible)
- Secure file storage (separate domain or CDN)
- File access control
- Filename sanitization

### 12.6 OTP Security
- Rate limiting per phone number
- IP-based rate limiting
- OTP expiration
- Attempt limiting
- Secure OTP generation (cryptographically random)
- SMS provider authentication

### 12.7 Backend Validation
- Never trust frontend calculations
- Validate all business rules on backend
- Product price validation
- Stock validation
- Delivery fee validation
- Order total validation
- Permission validation on all operations

### 12.8 Audit Logging
- Log all admin actions
- Log authentication attempts
- Log failed validation attempts
- Log sensitive operations
- Log format: timestamp, user, action, resource, result
- Log retention: 90 days minimum

## 13. Database Schema

### 13.1 Users
```prisma
model User {
  id            String   @id @default(cuid())
  phoneNumber   String   @unique
  name          String?
  email         String?  @unique
  passwordHash  String?
  role          UserRole @default(CUSTOMER)
  isPhoneVerified Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  addresses     Address[]
  orders        Order[]
  cartItems     CartItem[]
  supportMessages SupportMessage[]
}

enum UserRole {
  CUSTOMER
  ADMIN
}
```

### 13.2 Addresses
```prisma
model Address {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  areaId       String
  area         DeliveryArea @relation(fields: [areaId], references: [id])
  detailedAddress String
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  orders       Order[]
}
```

### 13.3 Categories
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   // Arabic
  nameEn      String?  // English for admin
  slug        String   @unique
  description String?
  isActive    Boolean  @default(true)
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 13.4 Products
```prisma
model Product {
  id                  String   @id @default(cuid())
  name                String   // Arabic
  nameEn              String?  // English for admin
  description         String   // Arabic
  descriptionEn       String?  // English for admin
  categoryId          String
  category            Category @relation(fields: [categoryId], references: [id])
  price               Decimal
  freeDeliveryValue   Decimal  @default(0)
  stock               Int      @default(0)
  isAvailable         Boolean  @default(true)
  isRecommended       Boolean  @default(false)
  condition           ProductCondition @default(NEW)
  tags                String[]
  images              String[]
  
  // Offer fields
  hasOffer            Boolean  @default(false)
  offerType           OfferType?
  offerValue          Decimal?
  offerStartDate      DateTime?
  offerEndDate        DateTime?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  cartItems           CartItem[]
  orderItems          OrderItem[]
  variants            ProductVariant[]
}

enum ProductCondition {
  NEW
  USED
}

enum OfferType {
  PERCENTAGE
  FIXED_AMOUNT
}
```

### 13.5 Product Variants
```prisma
model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  name        String   // e.g., "Red", "Large"
  value       String   // e.g., "#FF0000", "L"
  type        String   // e.g., "color", "size"
  priceAdjustment Decimal @default(0)
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 13.6 Cart Items
```prisma
model CartItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  variantId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, productId, variantId])
}
```

### 13.7 Delivery Areas
```prisma
model DeliveryArea {
  id                    String   @id @default(cuid())
  name                  String   // Arabic
  nameEn                String?  // English for admin
  deliveryFee           Decimal
  eligibleForFreeDelivery Boolean @default(true)
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  addresses             Address[]
  orders                Order[]
}
```

### 13.8 Orders
```prisma
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  customerId      String
  customer        User        @relation(fields: [customerId], references: [id])
  status          OrderStatus @default(PENDING)
  
  subtotal        Decimal
  deliveryFee     Decimal
  total           Decimal
  cartScore       Decimal
  
  deliveryAreaId  String
  deliveryArea    DeliveryArea @relation(fields: [deliveryAreaId], references: [id])
  deliveryAddress String
  
  notes           String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  items           OrderItem[]
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### 13.9 Order Items
```prisma
model OrderItem {
  id                String   @id @default(cuid())
  orderId           String
  order             Order    @relation(fields: [orderId], references: [id])
  productId         String
  product           Product  @relation(fields: [productId], references: [id])
  quantity          Int
  price             Decimal  // Snapshot at time of order
  freeDeliveryValue Decimal  // Snapshot at time of order
  createdAt         DateTime @default(now())
}
```

### 13.10 Settings
```prisma
model Settings {
  id                          String   @id @default(cuid())
  freeDeliveryTarget          Decimal
  partialFreeDeliveryEnabled  Boolean  @default(false)
  partialFreeDeliveryThreshold Decimal
  partialFreeDeliveryDiscount Int      @default(50)
  storeName                   String   // Arabic
  storeNameEn                 String?  // English
  storePhone                  String?
  storeEmail                  String?
  socialMediaLinks            Json?
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt
}
```

### 13.11 Announcements
```prisma
model Announcement {
  id          String   @id @default(cuid())
  title       String   // Arabic
  titleEn     String?  // English
  content     String   // Arabic
  contentEn   String?  // English
  isActive    Boolean  @default(true)
  priority    Int      @default(0)
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 13.12 Support Messages
```prisma
model SupportMessage {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  orderId     String?
  subject     String
  message     String
  isAdmin     Boolean  @default(false)
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 13.13 OTP Records
```prisma
model OtpRecord {
  id          String   @id @default(cuid())
  phoneNumber String
  code        String
  expiresAt   DateTime
  attempts    Int      @default(0)
  used        Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### 13.14 Audit Logs
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  resource    String
  resourceId  String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  success     Boolean
  createdAt   DateTime @default(now())
}
```

## 14. API Structure

### 14.1 Authentication Module
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/admin/login
GET    /api/auth/me
```

### 14.2 User Module
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/addresses
POST   /api/users/addresses
PUT    /api/users/addresses/:id
DELETE /api/users/addresses/:id
POST   /api/users/addresses/:id/default
```

### 14.3 Product Module
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/categories
GET    /api/products/categories/:id
GET    /api/products/search
GET    /api/products/recommended
GET    /api/products/offers
```

### 14.4 Cart Module
```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart
GET    /api/cart/summary
```

### 14.5 Order Module
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
GET    /api/orders/:id/tracking
```

### 14.6 Delivery Module
```
GET    /api/delivery/areas
GET    /api/delivery/calculate
GET    /api/delivery/settings
```

### 14.7 Admin - Product Module
```
GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
PATCH  /api/admin/products/:id/status
POST   /api/admin/products/:id/images
DELETE /api/admin/products/:id/images/:imageId
```

### 14.8 Admin - Category Module
```
GET    /api/admin/categories
POST   /api/admin/categories
GET    /api/admin/categories/:id
PUT    /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

### 14.9 Admin - Order Module
```
GET    /api/admin/orders
GET    /api/admin/orders/:id
PUT    /api/admin/orders/:id/status
POST   /api/admin/orders/:id/notes
```

### 14.10 Admin - Delivery Module
```
GET    /api/admin/delivery/settings
PUT    /api/admin/delivery/settings
GET    /api/admin/delivery/areas
POST   /api/admin/delivery/areas
PUT    /api/admin/delivery/areas/:id
DELETE /api/admin/delivery/areas/:id
PATCH  /api/admin/delivery/areas/:id/status
```

### 14.11 Admin - Analytics Module
```
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/sales
GET    /api/admin/analytics/products
GET    /api/admin/analytics/customers
GET    /api/admin/analytics/orders
```

### 14.12 Admin - Settings Module
```
GET    /api/admin/settings
PUT    /api/admin/settings
```

### 14.13 Admin - Announcement Module
```
GET    /api/admin/announcements
POST   /api/admin/announcements
GET    /api/admin/announcements/:id
PUT    /api/admin/announcements/:id
DELETE /api/admin/announcements/:id
```

### 14.14 Support Module
```
GET    /api/support/messages
POST   /api/support/messages
GET    /api/admin/support/messages
POST   /api/admin/support/messages/:id/reply
PATCH  /api/admin/support/messages/:id/read
```

### 14.15 Public Module
```
GET    /api/public/announcements
GET    /api/public/settings
GET    /api/public/delivery-areas
```

## 15. Frontend Page Structure

### 15.1 Customer Store Pages
```
/                           (Home)
/products                   (Product listing)
/products/:id              (Product details)
/category/:slug             (Category page)
/search                     (Search results)
/cart                       (Shopping cart)
/checkout                   (Checkout)
/account                    (Account dashboard)
/account/profile            (Profile settings)
/account/addresses          (Address management)
/account/orders             (Order history)
/account/orders/:id         (Order details)
/account/support            (Support messages)
/auth/login                (Login)
/auth/register             (Register)
/auth/verify-phone         (Phone verification)
```

### 15.2 Admin Dashboard Pages
```
/admin                      (Dashboard overview)
/admin/products             (Product management)
/admin/products/new         (Add product)
/admin/products/:id         (Edit product)
/admin/categories           (Category management)
/admin/categories/new       (Add category)
/admin/categories/:id       (Edit category)
/admin/orders               (Order management)
/admin/orders/:id           (Order details)
/admin/customers            (Customer management)
/admin/customers/:id        (Customer details)
/admin/delivery             (Delivery settings)
/admin/delivery/areas       (Delivery areas)
/admin/settings             (General settings)
/admin/announcements        (Announcement management)
/admin/support              (Support messages)
/admin/analytics            (Analytics dashboard)
```

## 16. Admin Page Structure

### 16.1 Dashboard Overview
- Key metrics cards
- Revenue chart
- Orders chart
- Recent orders table
- Low stock alerts
- Pending actions

### 16.2 Product Management
- Product list with filters
- Search functionality
- Bulk actions
- Add/Edit product form
- Image upload
- Variant management
- Stock management

### 16.3 Category Management
- Category tree view
- Add/Edit category form
- Category reordering

### 16.4 Order Management
- Order list with filters
- Order details view
- Status update
- Order notes
- Customer information

### 16.5 Customer Management
- Customer list
- Customer details
- Order history
- Support history

### 16.6 Delivery Settings
- Global settings form
- Delivery area list
- Add/Edit area form
- Area activation

### 16.7 Settings
- Store information
- Contact details
- Social media links
- Free delivery configuration

### 16.8 Announcements
- Announcement list
- Add/Edit announcement form
- Activation controls

### 16.9 Support
- Message list
- Message thread view
- Reply functionality

### 16.10 Analytics
- Overview dashboard
- Sales reports
- Product performance
- Customer insights
- Custom date ranges

## 17. Design System Requirements

### 17.1 Color Palette
- Primary color: Store brand color
- Secondary color: Accent color
- Success color: Green
- Warning color: Orange/Yellow
- Error color: Red
- Neutral colors: Gray scale
- Background colors: White, light gray
- Text colors: Primary, secondary, muted

### 17.2 Typography
- Arabic font family (Google Fonts: Cairo, Tajawal, or Almarai)
- Font sizes: Scale from 12px to 32px
- Font weights: Regular, Medium, Bold
- Line heights: Readable ratios
- Direction: RTL

### 17.3 Components
- Buttons: Primary, Secondary, Outline, Danger
- Inputs: Text, Number, Select, Textarea
- Cards: Product cards, Info cards, Stats cards
- Tables: Data tables with sorting/filtering
- Badges: Status indicators, tags
- Alerts: Success, Warning, Error, Info
- Modals: Dialog overlays
- Toasts: Notification popups
- Loading states: Spinners, Skeletons
- Empty states: Illustrations + text
- Error states: Error messages + retry
- Success states: Confirmation messages

### 17.4 Layout
- Mobile-first responsive design
- Grid system for layouts
- Flexbox for components
- Consistent spacing (4px base unit)
- Container max-widths
- Breakpoints: Mobile, Tablet, Desktop

### 17.5 Icons
- Icon library (Lucide React or Heroicons)
- Consistent icon sizes
- RTL-aware icons where applicable

### 17.6 RTL Considerations
- All text aligned right
- Margins/paddings mirrored
- Icons positioned correctly
- Direction-aware components
- Arabic number formatting

## 18. Validation Rules

### 18.1 Product Validation
- Name: Required, 3-100 characters
- Price: Required, positive decimal
- Free Delivery Value: Non-negative decimal
- Stock: Non-negative integer
- Description: Required, max 2000 characters
- Category: Required, must exist
- Images: Required, at least 1, max 10
- Tags: Optional, array of strings

### 18.2 Cart Validation
- Quantity: Minimum 1, maximum available stock
- Product: Must be available
- Stock: Must be sufficient

### 18.3 Order Validation
- Customer: Must be authenticated
- Phone: Must be verified
- Address: Required
- Delivery area: Required, must be active
- Cart: Must not be empty
- Products: All must be available
- Stock: All must have sufficient quantity

### 18.4 Address Validation
- Area: Required, must be active
- Detailed address: Required, 10-500 characters

### 18.5 User Validation
- Phone number: Required, valid format
- Name: Optional, 2-100 characters if provided
- Email: Optional, valid format if provided
- Password: Optional, min 8 characters if provided

### 18.6 OTP Validation
- Phone number: Required
- Code: Required, exactly 6 digits
- Expiration: Must not be expired
- Attempts: Must not exceed limit

### 18.7 Delivery Area Validation
- Name: Required, 3-50 characters
- Delivery fee: Required, non-negative decimal
- Eligibility: Required boolean

### 18.8 Settings Validation
- Free Delivery Target: Required, positive decimal
- Partial Threshold: Required, positive decimal, less than target
- Partial Discount: Required, 0-100

## 19. Edge Cases

### 19.1 Product Edge Cases
- Product out of stock when in cart
- Product discontinued while in cart
- Product price changed while in cart
- Product offer expired while in cart
- Product deleted while in cart
- Variant out of stock
- Multiple product variants

### 19.2 Cart Edge Cases
- Cart with very high quantities
- Cart with many items
- Cart from previous session
- Concurrent cart modifications
- Stock reservation conflicts

### 19.3 Checkout Edge Cases
- Customer reaches free delivery target exactly
- Customer exceeds free delivery target significantly
- Partial threshold equals full target
- Delivery area deactivated during checkout
- Stock changes during checkout
- Price changes during checkout
- Network interruption during order creation

### 19.4 Order Edge Cases
- Order cancellation after stock deduction
- Order status update conflicts
- Concurrent order status updates
- Order with deleted products
- Order with deactivated delivery area

### 19.5 Delivery Edge Cases
- No delivery areas available
- All delivery areas inactive
- Customer address in inactive area
- Free delivery target changed after order
- Delivery fee changed after order

### 19.6 Authentication Edge Cases
- OTP not received
- OTP expired before entry
- Too many OTP attempts
- Phone number already registered
- Session expired during checkout

### 19.7 Admin Edge Cases
- Admin deletes product with active orders
- Admin deactivates delivery area with active orders
- Admin changes settings affecting active orders
- Concurrent admin modifications
- Bulk operation failures

## 20. Testing Requirements

### 20.1 Unit Testing
- All business logic functions
- Free delivery calculation
- Delivery fee calculation
- Order total calculation
- Stock validation
- Input validation
- Utility functions

### 20.2 Integration Testing
- API endpoints
- Database operations
- Authentication flows
- Cart operations
- Order creation
- File uploads

### 20.3 End-to-End Testing
- Customer registration and login
- Product browsing and search
- Add to cart and checkout
- Order placement
- Admin product management
- Admin order management
- Settings changes affecting checkout

### 20.4 Performance Testing
- Load testing for high traffic
- Database query performance
- API response times
- Page load times
- Image loading optimization

### 20.5 Security Testing
- Authentication bypass attempts
- Authorization testing
- SQL injection attempts
- XSS attempts
- CSRF protection
- Rate limiting effectiveness
- OTP abuse prevention

### 20.6 RTL Testing
- Arabic text rendering
- RTL layout correctness
- Direction-specific components
- Arabic number formatting
- Mirrored elements

### 20.7 Mobile Testing
- Responsive design on various devices
- Touch interactions
- Mobile performance
- Mobile-specific features

### 20.8 Browser Testing
- Chrome, Firefox, Safari, Edge
- Different screen sizes
- Different OS platforms

## 21. Deployment Considerations

### 21.1 Environment Setup
- Development environment
- Staging environment
- Production environment
- Environment variable management
- Secret management

### 21.2 Database Deployment
- PostgreSQL setup
- Database migrations
- Backup strategy
- Replication (if needed)
- Connection pooling

### 21.3 Backend Deployment
- NestJS application deployment
- Node.js version management
- Process management (PM2)
- Load balancing
- Scaling strategy

### 21.4 Frontend Deployment
- Next.js build optimization
- Static asset serving
- CDN integration
- Caching strategy
- SSL/TLS configuration

### 21.5 File Storage
- Image storage solution
- CDN integration
- Backup strategy
- Access control

### 21.6 Monitoring
- Application monitoring
- Error tracking
- Performance monitoring
- Uptime monitoring
- Log aggregation

### 21.7 CI/CD
- Automated testing
- Automated deployment
- Rollback strategy
- Feature flags (if needed)

### 21.8 Security
- Firewall configuration
- DDoS protection
- SSL certificates
- Security headers
- Regular security updates

## 22. Questions Requiring Owner Approval

### 22.1 Technology Stack
- **Confirm**: Next.js + TypeScript for both Store and Admin?
- **Confirm**: NestJS + TypeScript for Backend?
- **Confirm**: PostgreSQL for database?
- **Confirm**: Prisma for ORM?
- **Confirm**: Tailwind CSS for UI?
- **Decision**: Which OTP/SMS provider to use? (Twilio, Firebase, local provider?)
- **Decision**: Payment gateway integration needed for Phase 1, or cash-on-delivery only?

### 22.2 Free Delivery System
- **Clarification**: Should free delivery value be per product or per variant?
- **Clarification**: Should the free delivery score be displayed as integer or decimal?
- **Clarification**: What happens if customer removes items after reaching target?
- **Decision**: Should there be a minimum order amount for checkout?

### 22.3 Delivery Areas
- **Clarification**: Should delivery areas have hierarchical structure (city → area)?
- **Clarification**: Should delivery fees vary by order size/weight?
- **Decision**: Maximum number of delivery areas to support?

### 22.4 Product Management
- **Decision**: Maximum number of product images per product?
- **Decision**: Maximum file size for product images?
- **Decision**: Image resolution requirements?
- **Clarification**: Should products support multiple categories?

### 22.5 Orders
- **Decision**: Can customers cancel their own orders? If yes, until which status?
- **Decision**: Should order numbers be sequential or random?
- **Clarification**: Order status workflow - any additional states needed?

### 22.6 Analytics
- **Clarification**: Specific metrics priority for initial dashboard?
- **Decision**: Real-time analytics or daily/weekly updates sufficient?
- **Decision**: Export functionality needed for reports?

### 22.7 Support
- **Decision**: Support via in-app messaging only, or also email/phone?
- **Decision**: Should support have priority levels?
- **Decision**: Automated responses or FAQ integration needed?

### 22.8 Authentication
- **Decision**: Should customers have password-based login option, or OTP-only?
- **Decision**: Session timeout duration for admin?
- **Decision**: Multi-factor authentication for admin?

### 22.9 Design
- **Decision**: Specific Arabic font preference?
- **Decision**: Brand colors to use?
- **Decision**: Logo and branding assets ready?

### 22.10 Deployment
- **Decision**: Hosting provider preference? (AWS, GCP, Azure, Vercel, etc.)
- **Decision**: Domain name ready?
- **Decision**: SSL certificate management approach?

### 22.11 Scope Clarifications
- **Decision**: Is inventory management (POs, suppliers) in scope?
- **Decision**: Is refund/return process in scope for Phase 1?
- **Decision**: Is wishlist/favorites in scope for Phase 1?
- **Decision**: Is product reviews/ratings in scope for Phase 1?

### 22.12 Business Rules
- **Decision**: Tax calculation needed? (VAT, sales tax)
- **Decision**: Should orders have time restrictions (e.g., order by 5 PM for next-day delivery)?
- **Decision**: Should there be delivery time slots?
- **Decision**: Minimum age requirement for customers?

### 22.13 Admin Features
- **Decision**: Should admin have role hierarchy (super admin, admin, staff)?
- **Decision**: Should admin actions require approval/confirmation?
- **Decision**: Should admin have activity audit log viewer?

### 22.14 Performance
- **Decision**: Expected concurrent users?
- **Decision**: Expected product catalog size?
- **Decision**: Expected order volume per day?

---

## Next Steps

1. Review this specification
2. Answer questions in Section 22
3. Approve or modify requirements
4. Proceed to design phase
5. Begin implementation

**Version**: 1.0  
**Date**: 2026-08-29  
**Status**: Pending Approval
