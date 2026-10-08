const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("node:path");

const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const gstRoutes = require("./routes/GSTRoutes");
const customerRoutes = require("./routes/CustomerRoutes");
const productRoutes = require("./routes/ProductRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const invoiceRoutes = require("./routes/InvoiceRoutes");

dotenv.config();

const app = express();
const frontendDist = path.resolve(__dirname, "../frontend/dist");
const frontendIndex = path.join(frontendDist, "index.html");

app.use(cors());
app.use(express.json());

app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/gsts", gstRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use(express.static(frontendDist));
app.use((req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
        return res.status(404).json({ message: "API route not found" });
    }

    if (req.method === "GET") {
        return res.sendFile(frontendIndex, (error) => {
            if (error) next(error);
        });
    }

    return next();
});

app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        error: err.message || "Internal server error"
    });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
});