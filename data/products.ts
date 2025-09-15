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
    name: "Lavender Bliss",
    desc: "Relaxing lavender scent.",
    price: 20,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzla8aEtRJmZqe02bU6alEfwxbnq4pVs48lJ429Wi9NNomixtBXsdCtH5mjAht4kxG6HsD_SlZuoKo2Vv7_0MA_oGIAUdb_5RrNH0a1fyagUfj9UaAo68wAU9lltXfO5Uyls4EsoQ7K4-mUEtqtSfEguSfdPofQgCWjtbCanM9wlXvQHvhnzQTxlx4ea7FsskSgVNVty-lggCLMMfSomClJmUj9-yqtdDpvQtBhykAgCULX7QvB1sW4IgP7PsbpvSZS9YvpAisKrQ",
  },
  {
    id: "2",
    name: "Citrus Burst",
    desc: "Fresh citrus aroma.",
    price: 25,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsLjb5KKBppIDmg1chVvAKnP7LCwdw8mdW-cbHSDFrkJ1kEybpB41dL614HNDfc4I8nC5HMUapL3_yldQFi38W8lf41TXzF3N-dRRZnKYrrhw23RYyve-glEUpEcyKjoyNceRf6_zhvxgwuFERsyf4q-sp87CRe6tB1DEtxEm6_SZWTZ6chkdWjlOgxVsHEq7d8iI-B8_maG7vHXLggcLwqKQRApUTZyAIjDXIzrWYgtfPCHCYHgaOy-0lJx8sMwkgvUgsM0Mu90U",
  },
  {
    id: "3",
    name: "Vanilla Dream",
    desc: "Sweet vanilla fragrance.",
    price: 32,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkeQHD-nW4Y5OPL0yXw0JHgADOK9ZbDUiCVnyjazzkmQJTtml03JuH5OgUaH_y4xug1Piufv8Z6Och6qiOid4UcO3kfO2uaU2qpv0hfgsNoNjk2Ul2RZOQyao8vq8zR0f3eQcSe85S-Jbd5vHbsF7RBLJGdmbq7YC2qlyG70XcDa64Cf3-Ud8AgtiCQWfM5a5WihwjPwrXA_VIN1zMwzbAE2tY_VpZs2-LnOsOjXt7VE7D_TOTefHHGA12DfYMCmcXzSKHnGPaRos",
  },
];

export const PRODUCTS_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export default PRODUCTS;
