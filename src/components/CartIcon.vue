<script setup lang="ts">
import { ref, onMounted } from 'vue';

const count = ref(0);

onMounted(() => {
  const stored = sessionStorage.getItem('cart-count');
  if (stored) count.value = parseInt(stored, 10);
  window.addEventListener('cart-updated', () => {
    const val = sessionStorage.getItem('cart-count');
    count.value = val ? parseInt(val, 10) : 0;
  });
});
</script>

<template>
  <a href="#" class="cart" @click.prevent>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    <span v-if="count > 0" class="badge">{{ count }}</span>
  </a>
</template>

<style scoped>
.cart {
  position: relative;
  color: #a1a1aa;
  text-decoration: none;
  line-height: 1;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.cart:hover {
  color: #fafaf9;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #d97706;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-family: var(--font-body), system-ui, sans-serif;
}
</style>
