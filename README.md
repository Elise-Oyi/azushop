Based on your e-commerce screenshots and existing user model structure, here's what your data models should look like:

  Core Models You'll Need:

  1. Product Model (product.models.ts)

  - id, name, description, price, brand, category
  - images (array), specifications (object)
  - stock, sku, ratings, reviewCount
  - isActive, createdAt, updatedAt

  2. Category Model

  - id, name, slug, description
  - parentCategory (for subcategories), isActive
  - imageUrl, displayOrder

  3. Brand Model

  - id, name, slug, logo
  - description, isActive

  4. Review Model

  - id, productId, userId, rating (1-5)
  - title, comment, isVerified
  - helpfulCount, createdAt

  5. Cart Model

  - id, userId, items (array of product + quantity)
  - totalAmount, updatedAt

  6. Wishlist Model

  - id, userId, productIds (array)
  - createdAt, updatedAt

  7. Order Model

  - id, userId, items, totalAmount
  - shippingAddress, paymentStatus, orderStatus
  - trackingNumber, createdAt

  Your existing User Model already looks good but you might want to add:
  - wishlistId, cartId, isEmailVerified
  - dateOfBirth, profileImage