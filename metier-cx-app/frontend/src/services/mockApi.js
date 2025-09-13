// metier-cx-app/frontend/src/services/mockApi.js
// Forward everything to the real API so App.jsx can keep using MockApiService.
import ApiService from "./api";

export default {
  fetchProducts:      (params)      => ApiService.fetchProducts(params),
  fetchProductDetail: (id)          => ApiService.fetchProductDetail(id),
  fetchCategories:    ()            => ApiService.fetchCategories(),
  getCartCount:       ()            => ApiService.getCartCount(),
  getCart:            ()            => ApiService.getCart(),
  addToCart:          (id, qty)     => ApiService.addToCart(id, qty),
  updateCartItem:     (itemId, qty) => ApiService.updateCartItem(itemId, qty),
  removeFromCart:     (itemId)      => ApiService.removeFromCart(itemId),
  clearCart:          ()            => ApiService.clearCart(),
};
