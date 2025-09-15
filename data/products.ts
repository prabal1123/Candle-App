// app/data/products.ts
export type Product = {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: ReturnType<typeof require>;
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Scented Candle",
    desc: "Made with essential oils.",
    price: 20,
    img: require("../assets/images/candles/product1.jpg"),
  },
  {
    id: "2",
    name: "Aromatherapy Candle",
    desc: "Calming scents.",
    price: 25,
    img: require("../assets/images/candles/product2.jpg"),
  },
  {
    id: "3",
    name: "Luxury Soy Candle",
    desc: "Eco-friendly soy wax.",
    price: 32,
    img: require("../assets/images/candles/product3.jpg"),
  },
];

export const PRODUCTS_MAP: Record<string, Product> = PRODUCTS.reduce(
  (acc, p) => ((acc[p.id] = p), acc),
  {} as Record<string, Product>
);
