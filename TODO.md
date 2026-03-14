# SmartInventory Integration TODO

## Granular Steps (20-line commits each)

### 1. Fix Issues (port conflict, duplicates)
- Kill port 5000
- Remove duplicate inventory-keeper/backend/
- Update root README.md

### 2. DB Schema Expansion
- Add products table to backend/schema.sql (20 lines)
- Add operations, transfers tables

### 3. Backend: Auth Middleware + Products Endpoints Part 1
- Add verifyToken middleware (~15 lines)
- GET /api/products

### 4. Backend: Products Part 2
- POST /api/products, PUT /api/products/:id, DELETE

### 5. Backend: Operations Endpoints

### 6. Frontend: inventoryStore - Fetch Products API

### 7. Frontend: Products Page - Real CRUD

### 8. Dashboard - Real KPIs

### 9. Test E2E + Seed Data

**Commits**: After each step, `git add . && git commit -m "Step X: [description]"` (~20 lines)

Current: Step 1

