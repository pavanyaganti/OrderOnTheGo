import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

import { Admin, Cart, FoodItem, Orders, Restaurant, User } from "./Schema.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6001;

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

/* ================= FILE UPLOAD SETUP ================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

/* ================= DATABASE CONNECTION ================= */

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Database connection failed ❌", error);
  }
};

startServer();

/* ================= ROUTES ================= */

// Default route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

/* ================= AUTH ================= */

app.post("/register", async (req, res) => {
  try {
    const { username, email, usertype, password, restaurantAddress, restaurantImage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      usertype,
      password: hashedPassword,
      approval: usertype === "restaurant" ? "pending" : "approved",
    });

    const savedUser = await newUser.save();

    if (usertype === "restaurant") {
      const restaurant = new Restaurant({
        ownerId: savedUser._id,
        title: username,
        address: restaurantAddress,
        mainImg: restaurantImage,
        menu: [],
      });

      await restaurant.save();
    }

    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= FETCH ROUTES ================= */

app.get("/fetch-users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch {
    res.status(500).json({ message: "Error occurred" });
  }
});

app.get("/fetch-restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch {
    res.status(500).json({ message: "Error occurred" });
  }
});

app.get("/fetch-items", async (req, res) => {
  try {
    const items = await FoodItem.find();
    res.json(items);
  } catch {
    res.status(500).json({ message: "Error occurred" });
  }
});

app.get("/fetch-orders", async (req, res) => {
  try {
    const orders = await Orders.find();
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Error occurred" });
  }
});

app.get("/fetch-cart", async (req, res) => {
  try {
    const cart = await Cart.find();
    res.json(cart);
  } catch {
    res.status(500).json({ message: "Error occurred" });
  }
});

/* ================= ADD TO CART ================= */

app.post("/add-to-cart", async (req, res) => {
  try {
    const { userId, foodItemId, foodItemName, restaurantId, foodItemImg, price, discount, quantity } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);

    const item = new Cart({
      userId,
      foodItemId,
      foodItemName,
      restaurantId,
      restaurantName: restaurant?.title,
      foodItemImg,
      price,
      discount,
      quantity,
    });

    await item.save();

    res.json({ message: "Added to cart" });
  } catch {
    res.status(500).json({ message: "Error occurred" });
  }
});
