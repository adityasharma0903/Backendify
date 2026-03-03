// Example Frontend API Service
// This is what Backendify scans

export async function getUsers() {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      status: 'active'
    })
  });
  return response.json();
}

export async function updateUser(userId, userData) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    })
  });
  return response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

//  ========== PRODUCTS ==========

export async function getProducts() {
  const response = await fetch('/api/products', {
    method: 'GET'
  });
  return response.json();
}

export async function createProduct(productData) {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      inStock: true
    })
  });
  return response.json();
}

export async function updateProduct(productId, productData) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: productData.title,
      price: productData.price
    })
  });
  return response.json();
}

export async function deleteProduct(productId) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE'
  });
  return response.json();
}
