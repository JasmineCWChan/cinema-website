require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db("tododb");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectToMongo();


//Routes

//Post to collection("orders") when order is made
app.post("/api/orders", async (req, res) => {
    try {
        // Extract data from req.body
        const { userid, movieid, seats, totalPrice, showTime } = req.body;

        // Validate essential data
        if (!userid || !movieid || !seats || !totalPrice || !showTime) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        // Create the order object
        const order = {
            _id: new ObjectId(), // Generate a unique ObjectId
            userid,
            movieid,
            seats,
            totalPrice,
            showTime,
        };

        // Insert the order into the database
        const result = await db.collection("orders").insertOne(order);

        res.status(201).send({ message: "Order created", orderId: order._id });
    } catch (err) {
        res.status(500).send({ message: "Failed to create order", error: err.message });
    }
});

//GET all orders

// app.get("/api/orders", async (req, res) => {
//   try {
//     const orders = await db.collection("orders").find().toArray(); 
//     res.json(orders);
// } catch (err) {
//     console.error("Error fetching orders:", err);
//     res.status(500).send({ message: "Error fetching orders", error: err.message });
// }
// });

//GET from collection("orders") for confirmation page
app.get("/api/orders/:id", async (req, res) => {

  try {
        const { id } = req.params;
        
        if(!ObjectId.isValid(id)){
          return res.status(400).json({ "error": "Invalid concert ID format." });
        }

        const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
        if (!order) {
            res.status(404).send({ message: "Order not found" });
            return;
        }
        res.send(order);
    } catch (err) {
      console.error("Error fetching order: " + err);
        res.status(500).send({ message: "Error fetching order", error: err });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});