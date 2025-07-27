// frontend/src/hooks/useProducts.ts
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Product } from "@/types";

// 모든 상품 목록을 가져오는 훅
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>("/api/v1/products");
        setProducts(response.data);
      } catch (err) {
        setError("상품 목록을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
}

// 특정 상품 하나의 정보를 가져오는 훅
export function useProduct(id: string | string[] | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/api/v1/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError("상품 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
