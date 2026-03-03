/**
 * API Endpoint Extractor
 * Extracts ALL API endpoints from frontend code
 * Groups them by resource and detects CRUD operations
 */

export function extractAllApiEndpoints(content, detectedApiCalls = []) {
  const resources = {};

  // Handle both object format (from scanFrontendCode) and string format
  for (const call of detectedApiCalls) {
    let endpoint, method, hasAuth = false;
    
    if (typeof call === 'object' && call.route) {
      // Object format from scanFrontendCode
      endpoint = call.route.startsWith('/') ? call.route : '/' + call.route;
      method = call.method || 'GET';
      // Assume any call made by frontend is protected if in frontend (for now, simple heuristic)
      hasAuth = true;
    } else if (typeof call === 'string') {
      // Legacy string format
      endpoint = extractEndpoint(call);
      method = extractMethod(call);
      hasAuth = requiresAuth(call);
    } else {
      continue;
    }

    if (!endpoint) continue;

    const resource = extractResource(endpoint);
    const hasParam = hasParameter(endpoint);

    if (!resources[resource]) {
      resources[resource] = {
        name: resource,
        endpoints: [],
        methods: new Set(),
        hasAuth: false,
        fields: new Set()
      };
    }

    resources[resource].endpoints.push({
      path: endpoint,
      method: method,
      requiresAuth: hasAuth,
      hasParam: hasParam
    });

    resources[resource].methods.add(method);
    if (hasAuth) resources[resource].hasAuth = true;

    // Extract potential field names
    let fields = [];
    if (typeof call === 'object' && call.fields) {
      fields = Array.isArray(call.fields) ? call.fields : Object.keys(call.fields || {});
    } else if (typeof call === 'string') {
      fields = extractFieldNames(endpoint, call, content);
    }
    fields.forEach(f => resources[resource].fields.add(f));
  }

  // Convert Sets to Arrays for JSON serialization
  const result = {};
  for (const [key, resource] of Object.entries(resources)) {
    result[key] = {
      name: resource.name,
      endpoints: resource.endpoints,
      methods: Array.from(resource.methods),
      hasAuth: resource.hasAuth,
      fields: Array.from(resource.fields),
      isCrudResource: detectCrudOperations(resource.methods)
    };
  }

  return result;
}

/**
 * Extract endpoint path from API call
 * e.g., `fetch('/api/products/list')` → `/api/products/list`
 */
function extractEndpoint(call) {
  if (typeof call !== 'string') return null;
  
  // Match various fetch patterns
  const patterns = [
    /fetch\(['"`]([^'"`]+)['"`]/,
    /fetch\(\s*['"`]([^'"`]+)['"`]/,
    /\.get\(['"`]([^'"`]+)['"`]/,
    /\.post\(['"`]([^'"`]+)['"`]/,
    /\.put\(['"`]([^'"`]+)['"`]/,
    /\.delete\(['"`]([^'"`]+)['"`]/
  ];

  for (const pattern of patterns) {
    const match = call.match(pattern);
    if (match) {
      let endpoint = match[1];
      // Handle template literals - extract base path
      endpoint = endpoint.replace(/\$\{[^}]+\}/g, ':id');
      return endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    }
  }

  return null;
}

/**
 * Extract resource name from endpoint
 * e.g., `/api/products/list` → `products`
 * e.g., `/api/products/:id` → `products`
 */
function extractResource(endpoint) {
  // Remove /api prefix if present
  let path = endpoint.replace(/^\/api\//, '');
  
  // Get first segment
  const segments = path.split('/').filter(s => s && s !== ':id' && s !== 'id');
  
  if (segments.length === 0) return 'api';
  return segments[0];
}

/**
 * Extract HTTP method from API call
 */
function extractMethod(call) {
  if (typeof call !== 'string') return 'GET';
  
  if (call.includes("method: 'POST'") || call.includes('method: "POST"') || call.includes('.post(')) {
    return 'POST';
  }
  if (call.includes("method: 'PUT'") || call.includes('method: "PUT"') || call.includes('.put(')) {
    return 'PUT';
  }
  if (call.includes("method: 'DELETE'") || call.includes('method: "DELETE"') || call.includes('.delete(')) {
    return 'DELETE';
  }
  if (call.includes("method: 'GET'") || call.includes('method: "GET"') || call.includes('.get(')) {
    return 'GET';
  }
  if (call.includes('body:')) {
    return 'POST'; // Default POST if body present
  }
  return 'GET'; // Default GET
}

/**
 * Check if route requires authentication
 */
function requiresAuth(call) {
  if (typeof call !== 'string') return false;
  
  const authIndicators = [
    'Authorization',
    'Bearer',
    'token',
    'jwt',
    'headers:'
  ];
  return authIndicators.some(indicator => call.toLowerCase().includes(indicator.toLowerCase()));
}

/**
 * Check if endpoint has parameters
 */
function hasParameter(endpoint) {
  return endpoint.includes(':id') || endpoint.includes('${') || /\/\d+$/.test(endpoint);
}

/**
 * Extract potential field names from endpoint and context
 */
function extractFieldNames(endpoint, call, fullContent) {
  if (typeof call !== 'string') {
    return ['name', 'description'];
  }
  
  const fields = new Set();
  
  // Common standard fields
  fields.add('name');
  fields.add('email');
  fields.add('title');
  fields.add('description');
  fields.add('price');
  fields.add('content');
  fields.add('status');
  fields.add('createdAt');
  fields.add('updatedAt');

  // Look for JSON.stringify patterns
  const jsonPattern = /JSON\.stringify\(\s*\{([^}]+)\}/g;
  let match;
  while ((match = jsonPattern.exec(call)) !== null) {
    const jsonContent = match[1];
    const fields_in_json = jsonContent.match(/(\w+):/g);
    if (fields_in_json) {
      fields_in_json.forEach(f => {
        fields.add(f.replace(':', '').trim());
      });
    }
  }

  // Look for form data patterns
  const formDataPattern = /formData\.append\(['"`](\w+)['"`]/g;
  if (fullContent && typeof fullContent === 'string') {
    while ((match = formDataPattern.exec(fullContent)) !== null) {
      fields.add(match[1]);
    }
  }

  return Array.from(fields);
}

/**
 * Detect if resource has CRUD operations based on methods
 */
function detectCrudOperations(methods) {
  // Convert Set to Array if needed
  const methodsArray = Array.isArray(methods) ? methods : Array.from(methods);
  
  const has_get = methodsArray.includes('GET');
  const has_post = methodsArray.includes('POST');
  const has_put = methodsArray.includes('PUT');
  const has_delete = methodsArray.includes('DELETE');

  return {
    create: has_post,
    read: has_get,
    update: has_put,
    delete: has_delete
  };
}

/**
 * Get default fields for a resource based on name
 */
export function getDefaultFieldsForResource(resourceName) {
  const fieldsMap = {
    products: ['name', 'description', 'price', 'category', 'stock'],
    posts: ['title', 'content', 'author', 'views', 'likes'],
    comments: ['text', 'author', 'postId', 'likes'],
    users: ['name', 'email', 'phone', 'avatar'],
    orders: ['orderNumber', 'items', 'total', 'status', 'shippingAddress'],
    categories: ['name', 'description', 'icon'],
    tags: ['name', 'description'],
    reviews: ['rating', 'text', 'author', 'productId'],
    articles: ['title', 'content', 'author', 'tags', 'published'],
    todos: ['title', 'completed', 'priority', 'dueDate'],
  };

  return fieldsMap[resourceName.toLowerCase()] || ['name', 'description'];
}

/**
 * Group endpoints by operation type
 */
export function groupEndpointsByOperation(resources) {
  const grouped = {
    create: [],
    read: [],
    update: [],
    delete: [],
    list: [],
    other: []
  };

  for (const [resourceName, resource] of Object.entries(resources)) {
    for (const endpoint of resource.endpoints) {
      const path = endpoint.path.toLowerCase();
      const method = endpoint.method;

      if (method === 'POST' && (path.includes('create') || path.includes('add'))) {
        grouped.create.push({ resource: resourceName, ...endpoint });
      } else if (method === 'GET' && (path.includes('list') || path.endsWith(`/api/${resourceName}`))) {
        grouped.list.push({ resource: resourceName, ...endpoint });
      } else if (method === 'GET' && path.includes(':id')) {
        grouped.read.push({ resource: resourceName, ...endpoint });
      } else if (method === 'PUT' || method === 'PATCH') {
        grouped.update.push({ resource: resourceName, ...endpoint });
      } else if (method === 'DELETE') {
        grouped.delete.push({ resource: resourceName, ...endpoint });
      } else {
        grouped.other.push({ resource: resourceName, ...endpoint });
      }
    }
  }

  return grouped;
}
