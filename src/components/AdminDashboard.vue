<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  lastModified: string;
}

interface ProductStatus {
  loading: boolean;
  message: string;
  type: 'idle' | 'success' | 'error';
}

const products = ref<Product[]>([]);
const statuses = ref<Record<string, ProductStatus>>({});
const loading = ref(true);
const invalidationLog = ref<string[]>([]);

function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

async function fetchProducts() {
  loading.value = true;
  const res = await fetch('/api/products');
  products.value = await res.json();
  loading.value = false;
  // Initialize statuses
  for (const p of products.value) {
    if (!statuses.value[p.id]) {
      statuses.value[p.id] = { loading: false, message: '', type: 'idle' };
    }
  }
}

async function changePrice(product: Product) {
  const status = statuses.value[product.id];
  status.loading = true;
  status.message = '';
  status.type = 'idle';

  const oldPrice = product.price;
  // Random price bump +5-15%
  const factor = 1.05 + Math.random() * 0.1;
  const newPrice = Math.round(oldPrice * factor * 100) / 100;

  try {
    const res = await fetch('/api/update-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, price: newPrice }),
    });
    const data = await res.json();
    if (res.ok) {
      product.price = newPrice;
      product.lastModified = data.product.lastModified;
      status.message = `${formatPrice(oldPrice)} → ${formatPrice(newPrice)}`;
      status.type = 'success';
    } else {
      status.message = data.error;
      status.type = 'error';
    }
  } catch {
    status.message = 'Network error';
    status.type = 'error';
  }
  status.loading = false;
}

async function invalidateProduct(product: Product) {
  const status = statuses.value[product.id];
  status.loading = true;

  const tags = [`product-${product.id}`, `category-${product.category}`, 'products'];

  try {
    const res = await fetch('/api/invalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, tags }),
    });
    const data = await res.json();
    if (res.ok) {
      const entry = `${new Date().toLocaleTimeString()} — ${product.name}: [${data.invalidated.join(', ')}]`;
      invalidationLog.value.unshift(entry);
      if (invalidationLog.value.length > 20) invalidationLog.value.pop();
      status.message = `Invalidated ${data.invalidated.length} tag(s)`;
      status.type = 'success';
    }
  } catch {
    status.message = 'Failed to invalidate';
    status.type = 'error';
  }
  status.loading = false;
}

async function invalidateAll() {
  try {
    const res = await fetch('/api/invalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: ['products'] }),
    });
    const data = await res.json();
    if (res.ok) {
      const entry = `${new Date().toLocaleTimeString()} — ALL: [${data.invalidated.join(', ')}]`;
      invalidationLog.value.unshift(entry);
    }
  } catch {
    // silent
  }
}

onMounted(fetchProducts);
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h2>Product Management</h2>
        <p class="subtitle">Modify prices and invalidate cache tags in real time</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost" @click="fetchProducts">↻ Refresh</button>
        <button class="btn btn-danger" @click="invalidateAll">Invalidate All</button>
        <a href="/" class="btn btn-primary" target="_blank">Visit Store ↗</a>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading products...</div>

    <div v-else class="product-table">
      <div class="table-header">
        <span class="col-product">Product</span>
        <span class="col-category">Category</span>
        <span class="col-price">Price</span>
        <span class="col-modified">Last Modified</span>
        <span class="col-actions">Actions</span>
        <span class="col-status">Status</span>
      </div>
      <div
        v-for="product in products"
        :key="product.id"
        class="table-row"
      >
        <span class="col-product">
          <span class="product-emoji">{{ product.image }}</span>
          <span class="product-name">{{ product.name }}</span>
        </span>
        <span class="col-category">
          <span class="badge">{{ product.category }}</span>
        </span>
        <span class="col-price">{{ formatPrice(product.price) }}</span>
        <span class="col-modified">
          <code>{{ new Date(product.lastModified).toLocaleTimeString() }}</code>
        </span>
        <span class="col-actions">
          <button
            class="btn btn-sm btn-orange"
            :disabled="statuses[product.id]?.loading"
            @click="changePrice(product)"
          >
            Bump Price
          </button>
          <button
            class="btn btn-sm btn-ghost"
            :disabled="statuses[product.id]?.loading"
            @click="invalidateProduct(product)"
          >
            Invalidate
          </button>
        </span>
        <span class="col-status">
          <span
            v-if="statuses[product.id]?.message"
            :class="['status-msg', statuses[product.id].type]"
          >
            {{ statuses[product.id].message }}
          </span>
        </span>
      </div>
    </div>

    <div v-if="invalidationLog.length > 0" class="log-section">
      <h3>Invalidation Log</h3>
      <div class="log-entries">
        <div v-for="(entry, i) in invalidationLog" :key="i" class="log-entry">
          <code>{{ entry }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fafafa;
  font-family: var(--font-display), Georgia, serif;
}

.subtitle {
  color: #71717a;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
  font-family: var(--font-body), system-ui, sans-serif;
}

.btn-primary {
  background: #d97706;
  color: #fff;
}

.btn-primary:hover {
  background: #b45309;
}

.btn-ghost {
  background: #27272a;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
}

.btn-ghost:hover {
  background: #3f3f46;
  color: #e4e4e7;
}

.btn-danger {
  background: #7f1d1d;
  color: #fca5a5;
}

.btn-danger:hover {
  background: #991b1b;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-orange {
  background: #7c2d12;
  color: #fdba74;
}

.btn-orange:hover {
  background: #9a3412;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #71717a;
}

.product-table {
  border: 1px solid #27272a;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1.5fr;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #71717a;
  border-bottom: 1px solid #27272a;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1.5fr;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  align-items: center;
  border-bottom: 1px solid #1e1e23;
  transition: background 0.1s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.col-product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-emoji {
  font-size: 1.5rem;
}

.product-name {
  font-weight: 600;
  color: #e4e4e7;
  font-size: 0.875rem;
}

.col-price {
  font-weight: 700;
  color: #fafafa;
  font-family: var(--font-display), Georgia, serif;
}

.col-modified code {
  font-size: 0.75rem;
  color: #71717a;
}

.col-actions {
  display: flex;
  gap: 0.375rem;
}

.badge {
  display: inline-block;
  background: #27272a;
  color: #a1a1aa;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-msg {
  font-size: 0.75rem;
  font-weight: 500;
}

.status-msg.success {
  color: #4ade80;
}

.status-msg.error {
  color: #f87171;
}

.log-section {
  margin-top: 1rem;
}

.log-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #a1a1aa;
  margin-bottom: 0.75rem;
  font-family: var(--font-display), Georgia, serif;
}

.log-entries {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #27272a;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  padding: 0.25rem 0;
  border-bottom: 1px solid #1e1e23;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry code {
  font-size: 0.75rem;
  color: #71717a;
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 1fr 1fr;
  }

  .col-modified,
  .col-status,
  .col-category {
    display: none;
  }
}
</style>
