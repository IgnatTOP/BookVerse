export interface ICartItem {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  discountPercentage?: number;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface ICheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'paypal' | 'cash';
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  };
} 