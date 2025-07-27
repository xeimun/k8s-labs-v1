"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useProduct } from "@/hooks/useProducts";
import { User } from "@supabase/supabase-js";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { product, loading, error } = useProduct(id as string);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    const checkOwnershipAndSetImage = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (product) {
        if (user && product.userUid === user.id) {
          setIsOwner(true);
        }

        if (product.images && product.images.length > 0) {
          setMainImage(product.images[0].imageUrl);
        }
      }
    };
    checkOwnershipAndSetImage();
  }, [product]);

  const handleDelete = async () => {
    // ... (기존과 동일)
  };

  const handleCreateChatRoom = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    if (!product) return;

    try {
      const response = await api.post<{ roomId: number }>(
        "/api/v1/chat/rooms",
        null, // body가 없으므로 null 전달
        { params: { productId: product.id } }
      );
      const { roomId } = response.data;
      router.push(`/chat/${roomId}`);
    } catch (err: any) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("채팅방을 생성하는 데 실패했습니다.");
      }
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!product) return <p className="text-center mt-10">상품을 찾을 수 없습니다.</p>;

  return (
    <main className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ... (이미지 갤러리 부분은 기존과 동일) ... */}
          <div>
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-2">
              <img
                src={mainImage || "/placeholder.png"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2 hover:border-blue-500"
                    onClick={() => setMainImage(image.imageUrl)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`상품 이미지 ${image.displayOrder + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-2xl font-semibold text-gray-800 mb-4">
              {new Intl.NumberFormat("ko-KR").format(product.price)}원
            </p>
            <div className="text-sm text-gray-500 mb-4">
              <p>판매자: {product.userNickname}</p>
              <p>판매상태: {product.status}</p>
            </div>
            <div className="prose max-w-none mb-6 flex-grow">
              <p>{product.content}</p>
            </div>
            <div className="flex gap-2 mt-auto">
              {isOwner ? (
                <>
                  <Link href={`/products/${id}/edit`} className="flex-1">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                      수정하기
                    </button>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
                  >
                    삭제하기
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateChatRoom}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                  채팅하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}