import { Product } from '../domains/product/product.types';

export const demoProducts: Product[] = [
  {
    id: 'demo-p1',
    name: 'iPhone 15 Pro Max 256GB - Titanium Natural',
    price: 265000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    category: 'Smartphones & High-Tech',
    brand: 'Apple',
    rating: 4.9,
    stock: 12,
    freeShipping: true,
    warranty: '24 Mois Garantie Apple Care',
    description: 'Demo product description',
    sellerId: 'demo-seller',
    wilaya: 'Alger',
    status: 'active',
    specs: {
      "Processeur": "A17 Pro Bionic",
      "Écran": "6.7 pouces Super Retina XDR 120Hz",
      "Appareil Photo": "48 MP + 12 MP Telephoto 5x",
      "Batterie": "4422 mAh Fast Charge",
      "Poids": "221 Grammes"
    }
  },
  {
    id: 'demo-p2',
    name: 'Samsung Galaxy S24 Ultra 5G 512GB',
    price: 249000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    category: 'Smartphones & High-Tech',
    brand: 'Samsung',
    rating: 4.8,
    stock: 8,
    freeShipping: true,
    warranty: '24 Mois Garantie Samsung Official',
    description: 'Demo product description',
    sellerId: 'demo-seller',
    wilaya: 'Alger',
    status: 'active',
    specs: {
      "Processeur": "Snapdragon 8 Gen 3 for Galaxy",
      "Écran": "6.8 pouces Dynamic AMOLED 2X 120Hz",
      "Appareil Photo": "200 MP + 50 MP Periscope",
      "Batterie": "5000 mAh Fast Charge 45W",
      "Poids": "232 Grammes"
    }
  },
  {
    id: 'demo-p3',
    name: 'Google Pixel 8 Pro 256GB Obsidian',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    category: 'Smartphones & High-Tech',
    brand: 'Google',
    rating: 4.7,
    stock: 15,
    freeShipping: true,
    warranty: '12 Mois Garantie Officielle',
    description: 'Demo product description',
    sellerId: 'demo-seller',
    wilaya: 'Alger',
    status: 'active',
    specs: {
      "Processeur": "Google Tensor G3",
      "Écran": "6.7 pouces LTPO OLED 120Hz",
      "Appareil Photo": "50 MP + 48 MP Ultra-Wide",
      "Batterie": "5050 mAh Fast Charge",
      "Poids": "213 Grammes"
    }
  }
];
