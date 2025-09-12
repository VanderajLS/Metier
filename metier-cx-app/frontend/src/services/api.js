// metier-cx-app/frontend/src/services/api.js
// Production-ready API client. Uses Vercel env if present, else your Railway URL.
const API_BASE_URL =
  (import.meta?.env?.VITE_API_BASE_URL || "").trim() ||
  "https://metier-backend-metier-back-end-new.up.railway.app/api";

class ApiService {
  async fetchProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search)   queryParams.append("search", params.search);
      if (params.category) queryParams.append("category", params.category);
      if (params.page)     queryParams.append("page", params.page);
      if (params.per_page) queryParams.append("per_page", params.per_page);

      const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async fetchProductDetail(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  }

  async fetchRelatedProducts(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/related`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching related products:", error);
      throw error;
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }
}

export default new ApiService();
