import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const product = await AsyncStorage.getItem('@Gobarber:product');

      if (product) {
        setProducts(JSON.parse(product));
      }
    }

    loadProducts();
  }, [products]);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => prod.id === id);

      if (productIndex < 0) {
        throw new Error('Product not provided');
      }

      const updateProduct = [...products];
      updateProduct[productIndex].quantity += 1;
      setProducts(updateProduct);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => prod.id === id);

      if (productIndex < 0) {
        throw new Error('Product not provided');
      }

      const updateProduct = [...products];
      updateProduct[productIndex].quantity -= 1;
      setProducts(updateProduct);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productId = products.findIndex(prod => prod.id === product.id);

      if (productId >= 0) {
        increment(product.id);
        await AsyncStorage.setItem(
          '@desafio8:product',
          JSON.stringify(products),
        );
      } else {
        const newProd = { ...product, quantity: 1 };
        setProducts(oldProd => [...oldProd, newProd]);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
