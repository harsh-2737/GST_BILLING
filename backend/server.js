const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const gstRoutes = require("./routes/GSTRoutes");
const customerRoutes = require("./routes/CustomerRoutes");
const productRoutes = require("./routes/ProductRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();


app.use("/api/users", userRoutes);
app.use("/api/gsts", gstRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products",productRoutes);
app.use("/api/payments",paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    app.get("/", (req, res) => {
    res.send("Server is running");
});
});