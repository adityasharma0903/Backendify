export const conversationsRouteManifest = {
  framework: 'nestjs',
  resource: 'conversations',
  basePath: '/api/conversations',
  endpoints: [
    { method: 'GET', path: '/api/conversations' },
    { method: 'POST', path: '/api/conversations' },
    { method: 'GET', path: '/api/conversations/:id' },
    { method: 'PUT', path: '/api/conversations/:id' },
    { method: 'DELETE', path: '/api/conversations/:id' }
  ]
};
