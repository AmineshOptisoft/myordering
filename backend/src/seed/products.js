"use strict";

/**
 * Seed catalogue. Prices are integer cents. `stock` is deliberately low on a
 * couple of items so the INSUFFICIENT_STOCK path is easy to exercise.
 */

module.exports = [
  {
    id: "prod_margherita",
    name: "Margherita",
    description: "Tomato, mozzarella, basil",
    priceCents: 1299,
    category: "pizza",
    imageUrl: "https://picsum.photos/seed/margherita/400/300",
    stock: 12,
  },
  {
    id: "prod_pepperoni",
    name: "Pepperoni",
    description: "Tomato, mozzarella, pepperoni",
    priceCents: 1499,
    category: "pizza",
    imageUrl: "https://picsum.photos/seed/pepperoni/400/300",
    stock: 8,
  },
  {
    id: "prod_veggie",
    name: "Garden Veggie",
    description: "Peppers, onion, mushroom, olives",
    priceCents: 1399,
    category: "pizza",
    imageUrl: "https://picsum.photos/seed/veggie/400/300",
    stock: 3,
  },
  {
    id: "prod_garlic_bread",
    name: "Garlic Bread",
    description: "Stone-baked, rosemary salt",
    priceCents: 549,
    category: "sides",
    imageUrl: "https://picsum.photos/seed/garlicbread/400/300",
    stock: 20,
  },
  {
    id: "prod_wings",
    name: "Buffalo Wings (6)",
    description: "Blue cheese dip",
    priceCents: 799,
    category: "sides",
    imageUrl: "https://picsum.photos/seed/wings/400/300",
    stock: 2,
  },
  {
    id: "prod_cola",
    name: "Cola",
    description: "330ml can",
    priceCents: 249,
    category: "drinks",
    imageUrl: "https://picsum.photos/seed/cola/400/300",
    stock: 40,
  },
  {
    id: "prod_lemonade",
    name: "Cloudy Lemonade",
    description: "330ml can",
    priceCents: 279,
    category: "drinks",
    imageUrl: "https://picsum.photos/seed/lemonade/400/300",
    stock: 0,
  },
  {
    id: "prod_tiramisu",
    name: "Tiramisu",
    description: "Single serving",
    priceCents: 599,
    category: "dessert",
    imageUrl: "https://picsum.photos/seed/tiramisu/400/300",
    stock: 6,
  },
];
