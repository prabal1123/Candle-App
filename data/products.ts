// // app/data/products.ts
// export type Product = {
//   id: string;
//   name: string;
//   desc: string;
//   price: number;
//   img: ReturnType<typeof require>;
// };
    
// export const PRODUCTS: Product[] = [
//   {
//     id: "1",
//     name: "Scented Candle",
//     desc: "Made with essential oils.",
//     price: 20,
//     img: require("../assets/images/candles/product1.jpg"),
//   },
//   {
//     id: "2",
//     name: "Aromatherapy Candle",
//     desc: "Calming scents.",
//     price: 25,
//     img: require("../assets/images/candles/product2.jpg"),
//   },
//   {
//     id: "3",
//     name: "Luxury Soy Candle",
//     desc: "Eco-friendly soy wax.",
//     price: 32,
//     img: require("../assets/images/candles/product3.jpg"),
//   },
// ];

// export const PRODUCTS_MAP: Record<string, Product> = PRODUCTS.reduce(
//   (acc, p) => ((acc[p.id] = p), acc),
//   {} as Record<string, Product>
// );



// data/products.ts
export type Product = {
  id: string;
  name: string;
  desc?: string;
  price: number;
  img: string; // URL string instead of require()
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "PUMPKIN SPICE",
    desc: "WOODY AND SPICY SMELL.",
    price: 20,
    //img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzla8aEtRJmZqe02bU6alEfwxbnq4pVs48lJ429Wi9NNomixtBXsdCtH5mjAht4kxG6HsD_SlZuoKo2Vv7_0MA_oGIAUdb_5RrNH0a1fyagUfj9UaAo68wAU9lltXfO5Uyls4EsoQ7K4-mUEtqtSfEguSfdPofQgCWjtbCanM9wlXvQHvhnzQTxlx4ea7FsskSgVNVty-lggCLMMfSomClJmUj9-yqtdDpvQtBhykAgCULX7QvB1sW4IgP7PsbpvSZS9YvpAisKrQ",
    img: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/sign/Product%20List/autumn_candle_website_optimized.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hODJlNzVlZC1jMzk3LTRhZTYtODY3YS1jNDRjYmVkOGI5MmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcm9kdWN0IExpc3QvYXV0dW1uX2NhbmRsZV93ZWJzaXRlX29wdGltaXplZC5qcGciLCJpYXQiOjE3NTg0NTU2MDUsImV4cCI6MjA3MzgxNTYwNX0.EsmvdJ51KxLcjsfmZkElqk7UVbH05jbcm4r0EAlqWic",
  },
  {
    id: "2",
    name: "FLOATING CANDLES WITH FLOWERS",
    desc: "FLOATING CANDLES TO TAKE YOUR DECORATIONS TO NEXT LEVEL.",
    price: 25,
    img: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/sign/Product%20List/hd_floating_candles_with_flowers.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hODJlNzVlZC1jMzk3LTRhZTYtODY3YS1jNDRjYmVkOGI5MmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcm9kdWN0IExpc3QvaGRfZmxvYXRpbmdfY2FuZGxlc193aXRoX2Zsb3dlcnMuanBnIiwiaWF0IjoxNzU4NDU3MjM0LCJleHAiOjIwNzM4MTcyMzR9.IsOOQMKCBUlet9Nu6HrgUwJbCvBB78avwRuZ5Kl32es",
  },
  {
    id: "3",
    name: "BOQUET FLOWER CANDLE",
    desc: "FLOWERS BOUQUETS WITH YOUR FAVOURITE FRAGNANCE.",
    price: 32,
    img: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/sign/Product%20List/decorative_candle_bouquet_collection.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hODJlNzVlZC1jMzk3LTRhZTYtODY3YS1jNDRjYmVkOGI5MmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcm9kdWN0IExpc3QvZGVjb3JhdGl2ZV9jYW5kbGVfYm91cXVldF9jb2xsZWN0aW9uLmpwZyIsImlhdCI6MTc1ODQ1NjY0MiwiZXhwIjoyMDczODE2NjQyfQ.bkNcGJHklA1-EaZCApSmCgO4Ws7IkBhdZMrsR1SbAAo",
  },
];

export const PRODUCTS_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export default PRODUCTS;
