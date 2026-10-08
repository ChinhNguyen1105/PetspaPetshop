# Files and images module

## Observed endpoints

- Product images: `GET /product-images/{productId}`, multipart
  `POST /product-images` (`productId`, repeated `files`),
  `DELETE /product-images/{id}`, `PUT /product-images/set-main-image`
  (`productId`, `imageId`).
- Service images: `POST /service-images` with `serviceId`, `imageUrl`,
  `isThumbnail`; `GET /service-images/service/{serviceId}`;
  delete and set-main routes.
- User avatar: multipart `POST /users/{id}/avatar` with field `file`.

Product UI caps its gallery at six images. Enforce type, size, ownership and
storage-key validation server-side. A main-image update must ensure the image
belongs to the resource and leave exactly one main image if the product/service
has images. Storage provider, limits, virus scanning and public/private URL
policy remain unselected.
