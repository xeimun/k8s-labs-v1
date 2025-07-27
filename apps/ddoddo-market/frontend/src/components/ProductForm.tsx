"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Product, ProductImage } from "@/types";
import { useState } from "react";

// 폼 데이터 인터페이스
interface ProductFormData {
  title: string;
  content: string;
  price: number;
  status?: "FOR_SALE" | "RESERVED" | "SOLD_OUT";
}

// 컴포넌트 Props 인터페이스
interface ProductFormProps {
  onSubmit: (data: ProductFormData, images: File[], deleteImageIds: number[]) => void;
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({
  onSubmit,
  initialData,
  isEdit = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      price: initialData?.price || 0,
      status: initialData?.status || "FOR_SALE",
    },
  });

  // 새로 추가될 이미지 파일 목록 상태
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // 새로 추가될 이미지 미리보기 URL 목록 상태
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  // 삭제될 기존 이미지 ID 목록 상태
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  // 화면에 표시될 기존 이미지 목록 상태
  const [existingImages, setExistingImages] = useState<ProductImage[]>(
    initialData?.images || []
  );

  // 파일 선택 시 호출될 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // 새로 추가할 이미지 미리보기 삭제 핸들러
  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // 메모리 누수 방지를 위해 URL 객체 해제
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  // 기존 이미지 삭제 핸들러
  const handleRemoveExistingImage = (imageId: number) => {
    setDeleteImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // 폼 제출 시 호출될 함수
  const onFormSubmit: SubmitHandler<ProductFormData> = (data) => {
    onSubmit(data, newImageFiles, deleteImageIds);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 max-w-lg mx-auto"
    >
      {/* 상품명, 가격, 상세설명 입력 필드 (기존과 동일) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">상품명</label>
        <input id="title" type="text" {...register("title", { required: "상품명은 필수입니다." })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">가격</label>
        <input id="price" type="number" {...register("price", { required: "가격은 필수입니다.", valueAsNumber: true, min: { value: 0, message: "가격은 0원 이상이어야 합니다." } })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">상세 설명</label>
        <textarea id="content" rows={6} {...register("content", { required: "상세 설명은 필수입니다." })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>}
      </div>

      {/* --- 이미지 업로드 섹션 --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700">상품 이미지</label>
        <div className="mt-2 flex flex-col items-center">
            {/* 기존 이미지 미리보기 */}
            <div className="flex flex-wrap gap-4 mb-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative w-24 h-24">
                  <img src={image.imageUrl} alt="기존 이미지" className="w-full h-full object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveExistingImage(image.id)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                </div>
              ))}
            </div>
            {/* 새로 추가된 이미지 미리보기 */}
            <div className="flex flex-wrap gap-4 mb-4">
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img src={preview} alt={`미리보기 ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                </div>
              ))}
            </div>
            {/* 파일 선택 버튼 */}
            <input type="file" multiple onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
      </div>
      {/* --- 끝: 이미지 업로드 섹션 --- */}

      {isEdit && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">판매 상태</label>
          <select id="status" {...register("status")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" >
            <option value="FOR_SALE">판매중</option>
            <option value="RESERVED">예약중</option>
            <option value="SOLD_OUT">판매완료</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "처리 중..." : isEdit ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}