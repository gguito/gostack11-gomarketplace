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
      // await AsyncStorage.clear();
      const retrieveProducts = await AsyncStorage.getItem('cartProducts');
      if (retrieveProducts) {
        const parsedProducts = JSON.parse(retrieveProducts);
        setProducts(parsedProducts);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateStorage(): Promise<void> {
      await AsyncStorage.setItem('cartProducts', JSON.stringify([...products]));
    }

    updateStorage();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(p => p.id === product.id);
      if (productIndex >= 0) {
        const incrementProduct = [...products];
        incrementProduct[productIndex] = {
          ...products[productIndex],
          quantity: products[productIndex].quantity + 1,
        };

        setProducts(incrementProduct);
      } else {
        const newProduct: Product = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
          title: product.title,
        };

        setProducts([...products, newProduct]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProduct = [...products];
      const index = products.findIndex(p => p.id === id);
      if (index >= 0) {
        incrementProduct[index] = {
          ...products[index],
          quantity: products[index].quantity + 1,
        };

        setProducts(incrementProduct);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);
      if (index >= 0) {
        const decrementProduct = [...products];
        decrementProduct[index] = {
          ...products[index],
          quantity: products[index].quantity - 1,
        };

        if (decrementProduct[index].quantity === 0) {
          const filterProducts = products.filter(p => p.id !== id);
          setProducts(filterProducts);
        } else {
          setProducts(decrementProduct);
        }
      }
    },
    [products],
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
