"use client";

import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (
    data: { title: string; content: string; price: number },
    images: File[] // 추가된 이미지 파일 목록
  ) => {
    // FormData 객체 생성
    const formData = new FormData();

    // 1. JSON 데이터를 Blob으로 만들어 FormData에 추가
    formData.append(
      "request",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    // 2. 이미지 파일들을 FormData에 추가
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      // api.post 호출 시, Content-Type을 multipart/form-data로 설정
      await api.post("/api/v1/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("상품이 성공적으로 등록되었습니다.");
      router.push("/products");
    } catch (error) {
      console.error("상품 등록 실패:", error);
      alert("상품 등록에 실패했습니다.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">새 상품 등록</h1>
      {/* ProductForm의 onSubmit을 새로운 handleSubmit으로 전달 */}
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}