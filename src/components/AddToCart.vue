<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  productId: string;
  productName: string;
}>();

const added = ref(false);

function addToCart() {
  const current = parseInt(sessionStorage.getItem('cart-count') || '0', 10);
  sessionStorage.setItem('cart-count', String(current + 1));
  window.dispatchEvent(new CustomEvent('cart-updated'));
  added.value = true;
  setTimeout(() => {
    added.value = false;
  }, 1500);
}
</script>

<template>
  <button class="add-btn" :class="{ added }" @click="addToCart">
    <span v-if="added">Added!</span>
    <span v-else>Add to Cart</span>
  </button>
</template>

<style scoped>
.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #d97706;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body), system-ui, sans-serif;
  width: 100%;
  letter-spacing: 0.02em;
}

.add-btn:hover {
  background: #b45309;
}

.add-btn:active {
  transform: scale(0.98);
}

.add-btn.added {
  background: #16a34a;
}
</style>
