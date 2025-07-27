export interface User {
  uid: string;
  nickname: string;
  profileImageUrl: string;
}

// 상품 이미지 타입을 정의합니다.
export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  title: string;
  content: string;
  price: number;
  status: "FOR_SALE" | "RESERVED" | "SOLD_OUT";
  createdAt: string;
  updatedAt?: string;
  user: User;

  // 사용자 정보 직접 포함
  userUid: string;
  userNickname: string;
  userProfileImageUrl: string;

  // 상품 이미지 목록을 추가합니다.
  images: ProductImage[];
}