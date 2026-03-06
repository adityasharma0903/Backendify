export const messagesRouteManifest = {
  framework: 'nestjs',
  resource: 'messages',
  basePath: '/api/conversations/:conversationId/messages',
  endpoints: [
    { method: 'GET', path: '/api/conversations/:conversationId/messages' },
    { method: 'POST', path: '/api/conversations/:conversationId/messages' },
    { method: 'GET', path: '/api/conversations/:conversationId/messages/:id' },
    { method: 'PUT', path: '/api/conversations/:conversationId/messages/:id' },
    { method: 'DELETE', path: '/api/conversations/:conversationId/messages/:id' }
  ]
};
