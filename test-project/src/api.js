// Sample frontend code for testing Backendify
// This will be scanned to detect API calls

async function fetchUsers() {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function createUser(name, email) {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, status: 'active' })
  });
  return response.json();
}

async function updateUser(id, data) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: data.name, email: data.email })
  });
  return response.json();
}

async function deleteUser(id) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE'
  });
  return response.json();
}

// Products API
async function getProducts() {
  const response = await fetch('/api/products', {
    method: 'GET'
  });
  return response.json();
}

async function addProduct(title, price) {
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify({ title, price, description: '', category: 'general' })
  });
  return response.json();
}
