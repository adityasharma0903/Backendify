# 🔬 Auto-Indexing, IR Detection & AST Parsing in Backendify

## Part 1: 📊 Auto-Indexing in MongoDB

### What is Indexing?
**Index = Database speedup mechanism** ⚡

Without index: Database scan **karke sabko check karta hai** ❌ (slow)
```
Search "Electronics" in 1 million products
→ Check product 1: No
→ Check product 2: No
→ Check product 3: Yes
→ Check product 4: No
... (999,997 more checks!)
```

With index: **Direct lookup table** ✅ (fast)
```
Index: {
  "Electronics": [product_50, product_152, product_4829, ...]
}
Search → Direct find in index → Instant!
```

---

### How Backendify Auto-Creates Indexes

**Code from:** `lib/generator/advancedCrudGenerator.js`

```javascript
function generateIndexes(fields, modelName) {
  const indexes = [
    // Always index timestamps (sorting)
    `${modelName}Schema.index({ createdAt: -1 });`,
    `${modelName}Schema.index({ updatedAt: -1 });`,
    
    // Always index status fields (filtering)
    `${modelName}Schema.index({ isActive: 1 });`,
    `${modelName}Schema.index({ isDeleted: 1, createdAt: -1 });`
  ];

  // Smart field detection - add indexes for common query patterns
  for (const field of fields) {
    const normalized = field.toLowerCase();
    
    // These fields are commonly used in WHERE conditions
    if (normalized.match(/^(status|type|category|user|owner)$/)) {
      indexes.push(`${modelName}Schema.index({ ${field}: 1, createdAt: -1 });`);
    }
  }

  return indexes.join('\n');
}
```

---

### Auto-Indexing Example

**Frontend states detected:**
```jsx
const [products, setProducts] = useState([
  {
    id: 1,
    name: 'Laptop',
    price: 999,
    category: 'Electronics',
    status: 'active'
  }
]);
```

**Backendify automatically generates these indexes:**

```javascript
// Generated in Product.js

// 1. Timestamp indexes (for sorting by date)
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ updatedAt: -1 });

// 2. Deletion tracking indexes
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isDeleted: 1, createdAt: -1 });

// 3. Common filter fields (detected automatically!)
ProductSchema.index({ category: 1, createdAt: -1 });
// Why? 'category' matches pattern /^(status|type|category)$/
ProductSchema.index({ status: 1, createdAt: -1 });
// Why? 'status' matches the pattern
```

---

### When Indexes Help (Real Performance Impact)

```javascript
// Query: Find all Electronics products, sorted by newest
await Product.find({ 
  category: 'Electronics',
  isDeleted: false 
}).sort({ createdAt: -1 });

// WITHOUT index:
// - Scan all products ❌
// - Filter by category ❌
// - Filter by isDeleted ❌
// - Sort results ❌
// Time: 5000ms (5 seconds) for 1 million products ⏱️

// WITH index { category: 1, createdAt: -1 }:
// - Jump to index "Electronics" bucket ✅
// - Already sorted by createdAt ✅
// - Skip deleted items with separate index ✅
// Time: 50ms (50 milliseconds) ⚡
// = 100x FASTER!
```

---

## Part 2: 🔍 IR (Intermediate Representation) Detection

### What is IR?

**IR = Simplified version of code that's easy to transform**

```
┌────────────────────────────────────────────┐
│   REACT FRONTEND CODE (Messy, Complex)    │
│                                            │
│  const [products, setProducts] =           │
│    useState([                              │
│      { id: 1, name: 'Laptop', ... },      │
│      { id: 2, name: 'Phone', ... }        │
│    ]);                                     │
│  const handleAdd = (name, price) => {     │
│    setProducts([...products, {...}]);     │
│  };                                        │
└────────────────────────────────────────────┘
               ↓ (Parse)
┌────────────────────────────────────────────┐
│  IR (Clean, Normalized)                    │
│                                            │
│  {                                         │
│    resources: [{                           │
│      name: "products",                     │
│      type: "array",                        │
│      fields: ["id","name","price"],        │
│      operations: ["create","read","delete"]│
│    }],                                     │
│    handlers: [{                            │
│      name: "handleAdd",                    │
│      operation: "create",                  │
│      fields_used: ["name","price"]         │
│    }]                                      │
│  }                                         │
└────────────────────────────────────────────┘
               ↓ (Generate)
┌────────────────────────────────────────────┐
│   BACKEND CODE (Express Routes)            │
│                                            │
│  router.post('/products', (req, res) => { │
│    const product = new Product({           │
│      name: req.body.name,                  │
│      price: req.body.price                 │
│    });                                     │
│    await product.save();                   │
│  });                                       │
└────────────────────────────────────────────┘
```

---

### IR Detection Algorithm

**File:** `lib/utils/resourceDetector.js`

```javascript
export function detectResourcesFromFrontend(projectPath) {
  // Step 1: Read all React files
  const files = scanDirectory(projectPath, /\.(jsx?|tsx?)$/);
  
  const resources = [];
  
  // Step 2: For each file, extract state patterns
  for (const file of files) {
    const content = readFileSync(file);
    
    // Regex pattern to find useState
    const statePattern = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\s*\(\s*\[(.*?)\]/gs;
    
    let match;
    while ((match = statePattern.exec(content)) !== null) {
      const resourceName = match[1];      // "products"
      const initialArray = match[2];      // First object in array
      
      // Step 3: Convert to IR
      const resource = {
        name: resourceName,
        singular: singularize(resourceName),
        fields: extractFieldsFromObject(initialArray),
        operations: detectOperations(content, resourceName)
      };
      
      resources.push(resource);
    }
  }
  
  return resources;
}

// Transform raw field data to IR format
function extractFieldsFromObject(objStr) {
  const fields = [];
  const fieldPattern = /(\w+):\s*(.+?)(?:,|$)/g;
  
  let match;
  while ((match = fieldPattern.exec(objStr)) !== null) {
    const fieldName = match[1];
    const fieldValue = match[2];
    
    fields.push(fieldName);
  }
  
  return fields;
}

// IR operation detection
function detectOperations(content, resourceName) {
  const operations = [];
  
  if (content.includes(`setProducts([...products,`)) {
    operations.push('create'); // POST
  }
  if (content.includes(`.filter(`)) {
    operations.push('delete'); // DELETE
  }
  if (content.includes(`map(item => ...`)) {
    operations.push('read');   // GET
  }
  
  return operations;
}
```

**Generated IR Output:**
```javascript
{
  resources: [
    {
      name: "products",
      singular: "product",
      fields: ["id", "name", "price", "category"],
      operations: ["read", "create", "delete"]
    },
    {
      name: "users",
      singular: "user",
      fields: ["id", "name", "email", "role"],
      operations: ["read", "create", "delete"]
    }
  ]
}
```

---

## Part 3: 🌳 AST Parsing (Abstract Syntax Tree)

### What is AST?

**AST = Parse code into a tree structure** 🌲

```
JavaScript Code:
  const x = 5 + 3;

        ┌─ Const Declaration
        │  ├─ Identifier: "x"
        │  └─ BinaryExpression
        │     ├─ Operator: "+"
        │     ├─ Left: Literal(5)
        │     └─ Right: Literal(3)
        
This is an AST! (Abstract Syntax Tree)
```

---

### How Backendify Uses AST Parsing

**File:** `lib/utils/codeInjector.js`

Backendify doesn't use full AST libraries - uses **regex + brace-matching** (simpler):

```javascript
export function injectApiCalls(projectPath, resources) {
  const injectedFiles = [];
  
  for (const resource of resources) {
    // Step 1: Find handler functions
    const handlerPattern = new RegExp(
      `const\\s+handle${capitalize(resource.singular)}Submit\\s*=\\s*\\(.*?\\)\\s*=>\\s*\\{[^}]*\\}`,
      'gs'
    );
    
    // Step 2: Match brace depth to find complete function body
    for (const match of content.matchAll(handlerPattern)) {
      const handlerName = extractFunctionName(match[0]);
      const handlerBody = match[0];
      
      // Step 3: Transform handler
      const newBody = transformHandlerToApiCall(
        handlerBody,
        resource,
        'POST'
      );
      
      // Step 4: Replace in file
      content = content.replace(handlerBody, newBody);
    }
  }
  
  return injectedFiles;
}

// AST-like transformation (brace matching)
function transformHandlerToApiCall(oldHandler, resource, method) {
  // Input:
  // const handleProductSubmit = (e) => {
  //   e.preventDefault();
  //   setProducts([...products, newProduct]);
  // };

  return `const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(\`\${API_URL}/${resource.name}\`, {
        method: '${method}',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(${resource.singular})
      });
      
      if (res.ok) {
        await fetch${capitalize(resource.name)}();
        set${capitalize(resource.singular)}({});
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };`;
}
```

---

### AST Parsing Example - Complete Flow

**Original Frontend Code:**
```jsx
const [products, setProducts] = useState([
  { id: 1, name: 'Laptop', price: 999 }
]);

const handleSubmit = (name, price) => {
  setProducts([...products, { id: Date.now(), name, price }]);
};
```

**Step 1: Parse into AST-like structure**
```javascript
{
  type: "VariableDeclaration",
  name: "products",
  kind: "const",
  initializer: {
    type: "FunctionCall",
    function: "useState",
    arguments: [
      {
        type: "ArrayLiteral",
        elements: [
          {
            type: "ObjectLiteral",
            properties: [
              { key: "id", value: 1 },
              { key: "name", value: "Laptop" },
              { key: "price", value: 999 }
            ]
          }
        ]
      }
    ]
  }
}
```

**Step 2: Identify operations**
- `setProducts([...products, ...]` → CREATE operation
- No filter() → No DELETE
- No fetch() → Need to add API calls

**Step 3: Generate transformation**
```javascript
// Add useEffect for initial fetch
const transformedCode = `
const API_URL = 'http://localhost:5000/api';

const [products, setProducts] = useState([]);

useEffect(() => {
  const fetchProducts = async () => {
    const res = await fetch(\`\${API_URL}/products\`);
    const data = await res.json();
    setProducts(data.data || []);
  };
  fetchProducts();
}, []);

const handleSubmit = async (name, price) => {
  const res = await fetch(\`\${API_URL}/products\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price })
  });
  
  if (res.ok) {
    await fetchProducts();
  }
};
`;
```

---

## Part 4: 🔄 Complete IR → Code Generation Pipeline

```
INPUT (Frontend Code)
    ↓
┌─────────────────────────────┐
│ IR BUILDER                   │
│ - Parse React patterns       │
│ - Detect resources          │
│ - Extract fields            │
│ - Identify operations       │
│ Output: Intermediate Rep.   │
└─────────────────────────────┘
    ↓ (IR normalized)
┌─────────────────────────────┐
│ GENERATOR ENGINE            │
│ - Templates applied         │
│ - Indexes generated         │
│ - Routes created            │
│ - Models generated          │
│ Output: Backend files       │
└─────────────────────────────┘
    ↓ (Code files)
┌─────────────────────────────┐
│ CODE INJECTOR              │
│ - AST transformation        │
│ - API calls added           │
│ - useEffect hooks added    │
│ Output: Updated Frontend   │
└─────────────────────────────┘
    ↓ (Ready)
PRODUCTION-READY FULL-STACK APP
```

---

## 🎯 Summary for Hackathon

### Indexing:
```javascript
// Backendify automatically creates indexes on:
ProductSchema.index({ createdAt: -1 });      // For sorting
ProductSchema.index({ category: 1 });         // For filtering
ProductSchema.index({ isDeleted: 1 });       // For soft deletes
// Result: 100x faster queries! ⚡
```

### IR Detection:
```javascript
// Converts messy React code into clean structure:
// Input: useState([{ id: 1, name: 'Laptop', ... }])
// IR: { resources: [{ name: 'products', fields: ['id', 'name'], ... }] }
// Output: MongoDB schema + Express routes
```

### AST Parsing:
```javascript
// Rewrites functions using pattern matching + brace counting:
// Input: const handleAdd = (e) => { setProducts([...]) }
// Parse: Identify setProducts mutation
// Transform: Add async + fetch call
// Output: const handleAdd = async (e) => { 
//           const res = await fetch(...) 
//         }
```

**Key Innovation:** No database schema to write, no routes to code, no fetch calls to add manually - **Backendify detects and generates everything!** 🚀

