"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Product } from "@/types";
import ProductForm from "@/components/ProductForm";

interface ProductUpdateData {
  title: string;
  content: string;
  price: number;
  status?: "FOR_SALE" | "RESERVED" | "SOLD_OUT";
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/api/v1/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError("상품 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (
    data: ProductUpdateData,
    newImages: File[],
    deleteImageIds: number[]
  ) => {
    const formData = new FormData();

    // 전송할 데이터 객체에 deleteImageIds를 포함시킵니다.
    const requestData = {
      ...data,
      deleteImageIds: deleteImageIds,
    };

    // 1. JSON 데이터를 Blob으로 만들어 FormData에 추가
    formData.append(
      "request",
      // deleteImageIds가 포함된 객체를 JSON으로 변환합니다.
      new Blob([JSON.stringify(requestData)], { type: "application/json" })
    );

    // 2. 새로 추가할 이미지 파일들을 FormData에 추가
    newImages.forEach((image) => {
      formData.append("newImages", image);
    });

    try {
      await api.patch(`/api/v1/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("상품 정보가 성공적으로 수정되었습니다.");
      router.push(`/products/${id}`);
    } catch (error) {
      console.error("상품 수정 실패:", error);
      alert("상품 수정에 실패했습니다.");
    }
  };

  if (loading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">상품 정보 수정</h1>
      {product && (
        <ProductForm
          onSubmit={handleSubmit}
          initialData={product}
          isEdit={true}
        />
      )}
    </div>
  );
}