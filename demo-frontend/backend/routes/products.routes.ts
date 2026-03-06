export const productsRouteManifest = {
  framework: 'nestjs',
  resource: 'products',
  basePath: '/api/products',
  endpoints: [
    { method: 'GET', path: '/api/products' },
    { method: 'POST', path: '/api/products' },
    { method: 'GET', path: '/api/products/:id' },
    { method: 'PUT', path: '/api/products/:id' },
    { method: 'DELETE', path: '/api/products/:id' }
  ]
};
