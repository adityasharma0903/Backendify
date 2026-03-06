import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      setProducts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to dummy data
      const dummyProducts = [
        { id: 1, name: 'Laptop', price: 999, category: 'Electronics', description: 'High-end laptop', stock: 15 },
        { id: 2, name: 'Phone', price: 599, category: 'Electronics', description: 'Smartphone', stock: 32 },
        { id: 3, name: 'Headphones', price: 79, category: 'Audio', description: 'Wireless headphones', stock: 48 },
      ];
      setProducts(dummyProducts);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editingId}`, {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          category: newProduct.category,
          stock: parseInt(newProduct.stock)
        });
        setProducts(products.map(p => 
          p.id === editingId 
            ? { ...p, ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }
            : p
        ));
        setEditingId(null);
      } else {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          category: newProduct.category,
          stock: parseInt(newProduct.stock)
        });
        const product = response.data.data || response.data;
        setProducts([...products, product]);
      }
      
      setNewProduct({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Backend might not be running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      stock: product.stock.toString()
    });
    setEditingId(product.id);
  };

  return (
    <div className="page">
      <h2>🛍️ Products Management</h2>

      <div className="form-card">
        <h3>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
        <form onSubmit={handleAddProduct}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                placeholder="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Audio">Audio</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Product description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setNewProduct({ name: '', price: '', description: '', category: '', stock: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-container">
        <h3>📋 Products List ({products.length})</h3>
        {products.length === 0 ? (
          <p className="empty-message">No products added yet</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.description}</td>
                  <td className="actions">
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProductsList;
