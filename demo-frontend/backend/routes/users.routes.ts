export const usersRouteManifest = {
  framework: 'nestjs',
  resource: 'users',
  basePath: '/api/users',
  endpoints: [
    { method: 'GET', path: '/api/users' },
    { method: 'POST', path: '/api/users' },
    { method: 'GET', path: '/api/users/:id' },
    { method: 'PUT', path: '/api/users/:id' },
    { method: 'DELETE', path: '/api/users/:id' }
  ]
};
