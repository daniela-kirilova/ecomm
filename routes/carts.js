const express = require("express");
const cartsRepo = require("../repositories/carts");
const productsRepo = require("../repositories/products");
const cartShowTemplate = require("../views/carts/show");

const router = express.Router();

// Receive a post request to add an item to a cart
router.post("/cart/products", async (req, res) => {
  let cart;
  if (!req.session.cartId) {
    //  create card and store the id on the req.session.cartId
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    // We have a cart now, get it from the repository
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  const existingItem = cart.items.find(
    (item) => item.id === req.body.productId
  );
  if (existingItem) {
    // increment quantity and save cart
    existingItem.quantity++;
  } else {
    // add new product id to items array
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }
  await cartsRepo.update(cart.id, {
    items: cart.items,
  });

  res.send(`<h1 style="color:purple;text-align:center;margin-top:5em">Product added! To see your cart <a href="/cart">click here</a>
  
   <h2 style="color:purple;text-align:center;margin-top:1em"> To continue shopping <a href="/">click here</a></h2>`);
});

// Receive a GET request to show all items in cart
router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/");
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    const product = await productsRepo.getOne(item.id);

    item.product = product;
  }

  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive a post request to delete an item from a cart
router.post("/cart/products/delete", async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter((item) => item.id !== itemId);
  await cartsRepo.update(req.session.cartId, { items });
  res.redirect("/cart")
});
module.exports = router;
