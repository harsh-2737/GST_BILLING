
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const GST = require("../models/GST");
const Payment = require("../models/Payment");
const Counter = require("../models/Counter");

const UserRepository = require("./UserRepository");
const CustomerRepository = require("./CustomerRepository");
const ProductRepository = require("./ProductRepository");

const getNextInvoiceId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "invoiceid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};

const getNextPaymentId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "paymentid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};

const addWarning = (warnings, message) => {
    if (!warnings.includes(message)) {
        warnings.push(message);
    }
};

const normalize = (value) => {
    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();
};

const normalizeGSTIN = (value) => {
    return normalize(value).toUpperCase();
};

const isSameUser = (user, data) => {
    if (!data) {
        return false;
    }

    return (
        normalize(user.name) ===
            normalize(data.name) &&
        normalize(user.email) ===
            normalize(data.email) &&
        normalize(user.phone_no) ===
            normalize(data.phone_no) &&
        normalize(user.role) ===
            normalize(data.role || "User")
    );
};

const isSameCustomer = (
    customer,
    data
) => {
    if (!data) {
        return false;
    }

    return (
        normalize(customer.name) ===
            normalize(data.name) &&
        normalize(customer.email) ===
            normalize(data.email) &&
        normalize(customer.phone_no) ===
            normalize(data.phone_no)
    );
};

const isSameGST = (
    gst,
    data
) => {
    if (!data) {
        return false;
    }

    return (
        Number(gst.gstrate) ===
            Number(data.gstrate) &&
        normalize(gst.gsttype) ===
            normalize(data.gsttype) &&
        normalizeGSTIN(gst.gstin) ===
            normalizeGSTIN(data.gstin)
    );
};

const isSameProduct = (
    product,
    data
) => {
    if (!data) {
        return false;
    }

    if (
        normalize(product.productname) !==
            normalize(data.productname) ||
        Number(product.price) !==
            Number(data.price) ||
        normalize(product.hsncode) !==
            normalize(data.hsncode)
    ) {
        return false;
    }

    if (
        !product.gst ||
        !data.gst
    ) {
        return (
            !product.gst &&
            !data.gst
        );
    }

    return (
        normalize(product.gst.gsttype) ===
            normalize(data.gst.gsttype) &&
        Number(product.gst.gstrate) ===
            Number(data.gst.gstrate) &&
        normalizeGSTIN(product.gst.gstin) ===
            normalizeGSTIN(data.gstin)
    );
};

const findSameUser = async (
    data
) => {
    if (!data) {
        return null;
    }

    const users = await User.find({
        name: data.name,
        email: data.email,
        phone_no: data.phone_no,
        role: data.role || "User"
    });

    for (
        const user
        of users
    ) {
        if (
            isSameUser(
                user,
                data
            )
        ) {
            return user;
        }
    }

    return null;
};

const findSameCustomer = async (
    data,
    ownerid
) => {
    if (!data) {
        return null;
    }

    const query = {
        name: data.name,
        email: data.email,
        phone_no: data.phone_no
    };
    if (ownerid !== undefined) query.ownerid = Number(ownerid);

    const customers = await Customer.find(query);

    for (
        const customer
        of customers
    ) {
        if (
            isSameCustomer(
                customer,
                data
            )
        ) {
            return customer;
        }
    }

    return null;
};

const findSameGST = async (
    data
) => {
    if (!data) {
        return null;
    }

    const gstList =
        await GST.find({
            gstrate:
                Number(
                    data.gstrate
                ),
            gsttype:
                data.gsttype
        });

    for (
        const gst
        of gstList
    ) {
        if (
            isSameGST(
                gst,
                data
            )
        ) {
            return gst;
        }
    }

    return null;
};

const findSameProduct = async (
    data,
    ownerid
) => {
    if (!data) {
        return null;
    }

    const query = {
        productname: data.productname,
        price: Number(data.price),
        hsncode: data.hsncode,
        archived: { $ne: true }
    };
    if (ownerid !== undefined) query.ownerid = Number(ownerid);

    const products = await Product.find(query);

    for (
        const product
        of products
    ) {
        if (
            isSameProduct(
                product,
                data
            )
        ) {
            return product;
        }
    }

    return null;
};

const getOrCreateUser = async (
    data,
    warnings = []
) => {
    if (!data) {
        throw new Error(
            "User details are required"
        );
    }

    const requestedUserId =
        data.userid !== undefined
            ? Number(data.userid)
            : undefined;

    if (
        requestedUserId !==
        undefined
    ) {
        const existingUser =
            await User.findOne({
                userid:
                    requestedUserId
            });

        if (existingUser) {
            addWarning(
                warnings,
                `User ID ${requestedUserId} already exists. Existing User ${existingUser.userid} from database was used and JSON User data was ignored.`
            );

            return existingUser;
        }
    }

    if (
        data.email
    ) {
        const existingByEmail =
            await User.findOne({
                email:
                    data.email
            });

        if (
            existingByEmail
        ) {
            if (
                isSameUser(
                    existingByEmail,
                    data
                )
            ) {
                addWarning(
                    warnings,
                    `User ID ${requestedUserId ?? "new"} does not exist, but the same User data already exists as User ${existingByEmail.userid}. Existing User was used and JSON User data was ignored.`
                );

                return existingByEmail;
            }

            throw new Error(
                `User email ${data.email} already belongs to User ${existingByEmail.userid} with different data`
            );
        }
    }

    const sameUser =
        await findSameUser(
            data
        );

    if (sameUser) {
        addWarning(
            warnings,
            `User ID ${requestedUserId ?? "new"} does not exist, but the same User data already exists as User ${sameUser.userid}. Existing User was used and JSON User data was ignored.`
        );

        return sameUser;
    }

    const createdUser =
        await UserRepository.createUser(
            data
        );

    const user =
        await User.findOne({
            userid:
                Number(
                    createdUser.userid
                )
        });

    if (!user) {
        throw new Error(
            "User creation failed"
        );
    }

    return user;
};

const getOrCreateCustomer = async (
    data,
    warnings = [],
    ownerid
) => {
    if (!data) {
        throw new Error(
            "Customer details are required"
        );
    }

    const requestedCustomerId =
        data.customerid !== undefined
            ? Number(
                data.customerid
            )
            : undefined;

    if (
        requestedCustomerId !==
        undefined
    ) {
        const existingCustomer =
            await Customer.findOne({
                customerid:
                    requestedCustomerId,
                ownerid: Number(ownerid)
            });

        if (existingCustomer) {
            addWarning(
                warnings,
                `Customer ID ${requestedCustomerId} already exists. Existing Customer ${existingCustomer.customerid} from database was used and JSON Customer data was ignored.`
            );

            return existingCustomer;
        }
    }

    if (
        data.email
    ) {
        const existingByEmail =
            await Customer.findOne({
                email:
                    data.email,
                ownerid: Number(ownerid)
            });

        if (
            existingByEmail
        ) {
            if (
                isSameCustomer(
                    existingByEmail,
                    data
                )
            ) {
                addWarning(
                    warnings,
                    `Customer ID ${requestedCustomerId ?? "new"} does not exist, but the same Customer data already exists as Customer ${existingByEmail.customerid}. Existing Customer was used and JSON Customer data was ignored.`
                );

                return existingByEmail;
            }

            throw new Error(
                `Customer email ${data.email} already belongs to Customer ${existingByEmail.customerid} with different data`
            );
        }
    }

    if (
        data.phone_no
    ) {
        const existingByPhone =
            await Customer.findOne({
                phone_no:
                    data.phone_no,
                ownerid: Number(ownerid)
            });

        if (
            existingByPhone
        ) {
            if (
                isSameCustomer(
                    existingByPhone,
                    data
                )
            ) {
                addWarning(
                    warnings,
                    `Customer ID ${requestedCustomerId ?? "new"} does not exist, but the same Customer data already exists as Customer ${existingByPhone.customerid}. Existing Customer was used and JSON Customer data was ignored.`
                );

                return existingByPhone;
            }

            throw new Error(
                `Customer phone number ${data.phone_no} already belongs to Customer ${existingByPhone.customerid} with different data`
            );
        }
    }

    const sameCustomer =
        await findSameCustomer(
            data,
            ownerid
        );

    if (sameCustomer) {
        addWarning(
            warnings,
            `Customer ID ${requestedCustomerId ?? "new"} does not exist, but the same Customer data already exists as Customer ${sameCustomer.customerid}. Existing Customer was used and JSON Customer data was ignored.`
        );

        return sameCustomer;
    }

    const createdCustomer =
        await CustomerRepository.createCustomer(
            { ...data, ownerid: Number(ownerid) }
        );

    const customer =
        await Customer.findOne({
            customerid:
                Number(
                    createdCustomer.customerid
                ),
            ownerid: Number(ownerid)
        });

    if (!customer) {
        throw new Error(
            "Customer creation failed"
        );
    }

    return customer;
};

const getOrCreateGST = async (
    data,
    warnings = []
) => {
    if (!data) {
        throw new Error(
            "GST details are required"
        );
    }

    const requestedGSTId =
        data.gstid !== undefined
            ? Number(
                data.gstid
            )
            : undefined;

    if (
        requestedGSTId !==
        undefined
    ) {
        const existingGST =
            await GST.findOne({
                gstid:
                    requestedGSTId
            });

        if (existingGST) {
            addWarning(
                warnings,
                `GST ID ${requestedGSTId} already exists. Existing GST ${existingGST.gstid} from database was used and JSON GST data was ignored.`
            );

            return existingGST;
        }
    }

    if (
        data.gstin
    ) {
        const existingByGSTIN =
            await GST.findOne({
                gstin: data.gstin,
                gsttype: data.gsttype,
                gstrate: Number(data.gstrate)
            });

        if (
            existingByGSTIN
        ) {
            addWarning(
                warnings,
                `GST ID ${requestedGSTId ?? "new"} does not exist, but the same GST data already exists as GST ${existingByGSTIN.gstid}. Existing GST was used and JSON GST data was ignored.`
            );
            return existingByGSTIN;
        }
    }

    const sameGST =
        await findSameGST(
            data
        );

    if (sameGST) {
        addWarning(
            warnings,
            `GST ID ${requestedGSTId ?? "new"} does not exist, but the same GST data already exists as GST ${sameGST.gstid}. Existing GST was used and JSON GST data was ignored.`
        );

        return sameGST;
    }

    return await GST.create({
        gstid:
            requestedGSTId,

        gstrate:
            Number(
                data.gstrate
            ),

        gsttype:
            data.gsttype,

        gstin:
            data.gstin
    });
};

const getOrCreateProduct = async (
    item,
    warnings = [],
    ownerid
) => {
    const productData =
        item.product;

    if (!productData) {
        throw new Error(
            `Product details are required for Product ${item.productid ?? ""}`
        );
    }

    const requestedProductId =
        item.productid !== undefined
            ? Number(
                item.productid
            )
            : productData.productid !==
                undefined
                ? Number(
                    productData.productid
                )
                : undefined;

    if (
        requestedProductId !==
        undefined
    ) {
        const existingProduct =
            await Product.findOne({
                productid:
                    requestedProductId,
                ownerid: Number(ownerid),
                archived: { $ne: true }
            });

        if (existingProduct) {
            addWarning(
                warnings,
                `Product ID ${requestedProductId} already exists. Existing Product ${existingProduct.productid} from database was used and JSON Product data was ignored.`
            );

            return existingProduct;
        }
    }

    const sameProduct =
        await findSameProduct(
            productData,
            ownerid
        );

    if (sameProduct) {
        addWarning(
            warnings,
            `Product ID ${requestedProductId ?? "new"} does not exist, but the same Product data already exists as Product ${sameProduct.productid}. Existing Product was used and JSON Product data was ignored.`
        );

        return sameProduct;
    }

    if (!productData.gst) {
        throw new Error(
            `GST details are required for new Product ${requestedProductId ?? ""}`
        );
    }

    const gst =
        await getOrCreateGST(
            productData.gst,
            warnings
        );

    const createdProduct =
        await ProductRepository.createProduct({
            productid:
                requestedProductId,

            productname:
                productData.productname,

            quantity:
                Number(
                    productData.quantity
                ),

            price:
                Number(
                    productData.price
                ),

            hsncode:
                productData.hsncode,

            ownerid:
                Number(ownerid),

            gst: {
                gstid:
                    gst.gstid,

                gsttype:
                    gst.gsttype,

                gstrate:
                    gst.gstrate,

                gstin:
                    gst.gstin
            }
        });

    const product =
        await Product.findOne({
            productid:
                Number(
                    createdProduct.productid
                ),
            ownerid: Number(ownerid)
        });

    if (!product) {
        throw new Error(
            "Product creation failed"
        );
    }

    return product;
};

const resolveProductAndGST = async (
    item,
    warnings = [],
    ownerid
) => {
    let product =
        await Product.findOne({
            productid:
                Number(
                    item.productid
                ),
            ownerid: Number(ownerid),
            archived: { $ne: true }
        });

    if (product) {
        addWarning(
            warnings,
            `Product ID ${item.productid} already exists. Existing Product ${product.productid} from database was used and JSON Product data was ignored.`
        );

        const gst =
            await getGSTForExistingProduct(
                product,
                item.gst ||
                    item.product?.gst,
                warnings
            );

        return {
            product,
            gst
        };
    }

    product =
        await getOrCreateProduct(
            item,
            warnings,
            ownerid
        );

    const gst =
        await getGSTForExistingProduct(
            product,
            item.gst ||
                item.product?.gst ||
                product.gst,
            warnings
        );

    return {
        product,
        gst
    };
};

const getGSTForExistingProduct = async (
    product,
    jsonGST,
    warnings = []
) => {
    if (!product.gst) {
        return await getOrCreateGST(
            jsonGST,
            warnings
        );
    }

    const productGST =
        product.gst;

    if (
        jsonGST &&
        (
            normalize(productGST.gsttype) !==
                normalize(jsonGST.gsttype) ||
            Number(productGST.gstrate) !==
                Number(jsonGST.gstrate) ||
            normalizeGSTIN(productGST.gstin) !==
                normalizeGSTIN(jsonGST.gstin)
        )
    ) {
        addWarning(
            warnings,
            `GST data in existing Product ${product.productid} differs from JSON GST data. Existing Product GST from database was used and JSON GST data was ignored.`
        );
    }

    let gst =
        await GST.findOne({
            gstid:
                Number(
                    productGST.gstid
                )
        });

    if (gst) {
        addWarning(
            warnings,
            `GST ${gst.gstid} for Product ${product.productid} was loaded from database.`
        );

        return gst;
    }

    gst =
        await GST.findOne({
            gstin: productGST.gstin,
            gsttype: productGST.gsttype,
            gstrate: Number(productGST.gstrate)
        });

    if (gst) {
        addWarning(
            warnings,
            `GST ${productGST.gstid} for Product ${product.productid} was not found by ID, but the matching GST record ${gst.gstid} was used.`
        );

        return gst;
    }

    const sameGST =
        await findSameGST(
            productGST
        );

    if (sameGST) {
        addWarning(
            warnings,
            `GST ${productGST.gstid} for Product ${product.productid} does not exist by ID, but the same GST data exists as GST ${sameGST.gstid}. Existing GST was used.`
        );

        return sameGST;
    }

    return await GST.create({
        gstid:
            Number(
                productGST.gstid
            ),

        gstrate:
            Number(
                productGST.gstrate
            ),

        gsttype:
            productGST.gsttype,

        gstin:
            productGST.gstin
    });
};

const calculateItem = (
    product,
    gst,
    buyitem
) => {
    const productAmount =
        Number(product.price) *
        Number(buyitem);

    const gstAmount =
        productAmount *
        Number(gst.gstrate) /
        100;

    const itemTotal =
        productAmount +
        gstAmount;

    return {
        productAmount,
        gstAmount,
        itemTotal
    };
};

const createInvoice = async (
    invoiceData
) => {
    try {
        if (
            !invoiceData ||
            !Array.isArray(
                invoiceData.items
            ) ||
            invoiceData.items.length === 0
        ) {
            throw new Error(
                "Missing required invoice fields"
            );
        }

        const warnings = [];

        const user =
            await getOrCreateUser(
                invoiceData.user,
                warnings
            );

        const customer =
            await getOrCreateCustomer(
                invoiceData.customer,
                warnings,
                user.userid
            );

        const items = [];
        let totalamount = 0;

        const requestedProductIds =
            new Set();

        const resolvedProductIds =
            new Set();

        for (
            const item
            of invoiceData.items
        ) {
            if (
                item.productid ===
                undefined
            ) {
                throw new Error(
                    "Product ID is required"
                );
            }

            const requestedProductId =
                Number(
                    item.productid
                );

            if (
                requestedProductIds.has(
                    requestedProductId
                )
            ) {
                throw new Error(
                    `Product ${requestedProductId} cannot appear more than once in an invoice`
                );
            }

            requestedProductIds.add(
                requestedProductId
            );

            const buyitem =
                Number(
                    item.buyitem
                );

            if (
                item.buyitem ===
                undefined ||
                !Number.isInteger(
                    buyitem
                ) ||
                buyitem <= 0
            ) {
                throw new Error(
                    `buyitem must be a positive whole number for product ${requestedProductId}`
                );
            }

            const {
                product,
                gst
            } =
                await resolveProductAndGST(
                    item,
                    warnings,
                    user.userid
                );

            if (
                resolvedProductIds.has(
                    Number(
                        product.productid
                    )
                )
            ) {
                throw new Error(
                    `Product ${product.productid} is already included in this invoice after ID/data matching`
                );
            }

            resolvedProductIds.add(
                Number(
                    product.productid
                )
            );

            if (
                !Number.isInteger(
                    product.quantity
                ) ||
                product.quantity < 0
            ) {
                throw new Error(
                    `Invalid stock quantity for ${product.productname}`
                );
            }

            if (
                product.quantity <
                buyitem
            ) {
                throw new Error(
                    `Insufficient stock for ${product.productname}. Available: ${product.quantity}, requested: ${buyitem}`
                );
            }

            const stockBeforePurchase =
                product.quantity;

            const calculation =
                calculateItem(
                    product,
                    gst,
                    buyitem
                );

            totalamount +=
                calculation.itemTotal;

            items.push({
                productid:
                    product.productid,

                productname:
                    product.productname,

                quantity:
                    stockBeforePurchase,

                buyitem:
                    buyitem,

                price:
                    product.price,

                hsncode:
                    product.hsncode,

                gst: {
                    gstid:
                        gst.gstid,

                    gsttype:
                        gst.gsttype,

                    gstrate:
                        gst.gstrate,

                    gstin:
                        gst.gstin
                }
            });

            product.quantity =
                Number(
                    product.quantity
                ) -
                buyitem;
            product.archived = product.quantity <= 0;

            await product.save();
        }

        totalamount =
            Number(
                totalamount.toFixed(2)
            );

        const invoiceid =
            await getNextInvoiceId();

        const paymentid =
            await getNextPaymentId();

        const invoice =
            await Invoice.create({
                invoiceid:
                    invoiceid,

                customer: {
                    customerid:
                        customer.customerid,

                    name:
                        customer.name,

                    email:
                        customer.email,

                    phone_no:
                        customer.phone_no,

                    gstin:
                        customer.gstin,
                    address:
                        customer.address
                },

                user: {
                    userid:
                        user.userid,

                    name:
                        user.name,

                    email:
                        user.email
                },

                invoicedate:
                    invoiceData.invoicedate ||
                    Date.now(),

                items:
                    items,

                totalamount:
                    totalamount,

                payment: {
                    paymentid:
                        paymentid,

                    paymentamount:
                        totalamount,

                    paymentstatus:
                        invoiceData.payment?.paymentstatus ||
                        "Pending",

                    paymentdate:
                        invoiceData.payment?.paymentdate ||
                        Date.now(),

                    paymentmode:
                        invoiceData.payment?.paymentmode ||
                        "Cash"
                },

                status:
                    invoiceData.status ||
                    "Draft"
            });

        const payment =
            await Payment.create({
                paymentid:
                    invoice.payment.paymentid,

                invoiceid:
                    invoice.invoiceid,

                paymentstatus:
                    invoice.payment.paymentstatus,

                paymentdate:
                    invoice.payment.paymentdate,

                paymentmode:
                    invoice.payment.paymentmode,

                paymentamount:
                    invoice.payment.paymentamount
            });

        return {
            invoice:
                invoice.toJSON(),

            payment:
                payment.toJSON(),

            warnings:
                warnings
        };

    } catch (error) {
        throw new Error(
            "Error creating invoice: " +
            error.message
        );
    }
};

const getAllInvoices = async (userId) => {
    try {
        return await Invoice.find({ "user.userid": Number(userId) });
    } catch (error) {
        throw new Error(
            "Error retrieving invoices: " +
            error.message
        );
    }
};

const getInvoiceById = async (
    id,
    userId
) => {
    try {
        const invoice =
            await Invoice.findOne({
                invoiceid:
                    Number(id),
                "user.userid": Number(userId)
            });

        if (!invoice) {
            throw new Error(
                "Invoice not found"
            );
        }

        return invoice;
    } catch (error) {
        throw new Error(
            "Error retrieving invoice: " +
            error.message
        );
    }
};

const getInvoicesByCustomer = async (
    customerId,
    userId
) => {
    try {
        return await Invoice.find({
            "customer.customerid":
                Number(customerId),
            "user.userid": Number(userId)
        });
    } catch (error) {
        throw new Error(
            "Error retrieving customer invoices: " +
            error.message
        );
    }
};

const resolveCustomerForUpdate = async (
    customerData,
    currentCustomerId,
    warnings,
    ownerid
) => {
    if (!customerData) {
        throw new Error(
            "Customer details are required"
        );
    }

    const requestedCustomerId =
        customerData.customerid !==
        undefined
            ? Number(
                customerData.customerid
            )
            : undefined;

    if (
        requestedCustomerId !==
        undefined
    ) {
        const existingCustomer =
            await Customer.findOne({
                customerid:
                    requestedCustomerId,
                ownerid: Number(ownerid)
            });

        if (existingCustomer) {
            addWarning(
                warnings,
                `Customer ID ${requestedCustomerId} already exists. Existing Customer ${existingCustomer.customerid} from database was used and JSON Customer data was ignored.`
            );

            return existingCustomer;
        }
    }

    const sameCustomer =
        await findSameCustomer(
            customerData,
            ownerid
        );

    if (sameCustomer) {
        addWarning(
            warnings,
            `Customer ID ${requestedCustomerId ?? "new"} does not exist, but the same Customer data already exists as Customer ${sameCustomer.customerid}. Existing Customer was used and JSON Customer data was ignored.`
        );

        return sameCustomer;
    }

    if (
        customerData.email
    ) {
        const existingByEmail =
            await Customer.findOne({
                email:
                    customerData.email,
                ownerid: Number(ownerid)
            });

        if (
            existingByEmail
        ) {
            throw new Error(
                `Customer email ${customerData.email} already belongs to Customer ${existingByEmail.customerid} with different data`
            );
        }
    }

    if (
        customerData.phone_no
    ) {
        const existingByPhone =
            await Customer.findOne({
                phone_no:
                    customerData.phone_no,
                ownerid: Number(ownerid)
            });

        if (
            existingByPhone
        ) {
            throw new Error(
                `Customer phone number ${customerData.phone_no} already belongs to Customer ${existingByPhone.customerid} with different data`
            );
        }
    }

    if (
        !customerData.name ||
        !customerData.email ||
        !customerData.phone_no
    ) {
        const currentCustomer =
            currentCustomerId
                ? await Customer.findOne({
                    customerid:
                        Number(
                            currentCustomerId
                        ),
                    ownerid: Number(ownerid)
                })
                : null;

        if (
            currentCustomer
        ) {
            throw new Error(
                "Complete customer details are required when creating a new customer"
            );
        }

        throw new Error(
            "Complete customer details are required"
        );
    }

    const createdCustomer =
        await CustomerRepository.createCustomer(
            { ...customerData, ownerid: Number(ownerid) }
        );

    const customer =
        await Customer.findOne({
            customerid:
                Number(
                    createdCustomer.customerid
                ),
            ownerid: Number(ownerid)
        });

    if (!customer) {
        throw new Error(
            "Customer creation failed during invoice update"
        );
    }

    return customer;
};

const updateInvoice = async (
    id,
    updateData,
    userId
) => {
    try {
        const invoice =
            await Invoice.findOne({
                invoiceid:
                    Number(id),
                "user.userid": Number(userId)
            });

        if (!invoice) {
            throw new Error(
                "Invoice not found"
            );
        }

        const warnings = [];

        if (
            updateData.user
        ) {
            const user =
                await getOrCreateUser(
                    updateData.user,
                    warnings
                );

            invoice.user = {
                userid:
                    user.userid,

                name:
                    user.name,

                email:
                    user.email
            };
        }

        if (
            updateData.invoicedate !==
            undefined
        ) {
            invoice.invoicedate =
                updateData.invoicedate;
        }

        if (
            updateData.status !==
            undefined
        ) {
            invoice.status =
                updateData.status;
        }

        if (
            updateData.customer !==
            undefined
        ) {
            const customer =
                await resolveCustomerForUpdate(
                    updateData.customer,
                    invoice.customer.customerid,
                    warnings,
                    userId
                );

            invoice.customer = {
                customerid:
                    customer.customerid,

                name:
                    customer.name,

                email:
                    customer.email,

                phone_no:
                    customer.phone_no
                ,
                gstin:
                    customer.gstin,
                address:
                    customer.address
            };
        }

        if (
            updateData.items !==
            undefined
        ) {
            if (
                !Array.isArray(
                    updateData.items
                ) ||
                updateData.items.length ===
                    0
            ) {
                throw new Error(
                    "Invoice must contain at least one product"
                );
            }

            const requestedProductIds =
                new Set();

            const resolvedProductIds =
                new Set();

            for (
                const item
                of updateData.items
            ) {
                if (
                    item.productid ===
                    undefined
                ) {
                    throw new Error(
                        "Product ID is required"
                    );
                }

                const productid =
                    Number(
                        item.productid
                    );

                if (
                    requestedProductIds.has(
                        productid
                    )
                ) {
                    throw new Error(
                        `Product ${productid} cannot appear more than once in an invoice`
                    );
                }

                requestedProductIds.add(
                    productid
                );

                const buyitem =
                    Number(
                        item.buyitem
                    );

                if (
                    item.buyitem ===
                        undefined ||
                    !Number.isInteger(
                        buyitem
                    ) ||
                    buyitem <= 0
                ) {
                    throw new Error(
                        `buyitem must be a positive whole number for product ${productid}`
                    );
                }
            }

            for (
                const oldItem
                of invoice.items
            ) {
                const oldProduct =
                    await Product.findOne({
                        productid:
                            Number(
                                oldItem.productid
                                ),
                            ownerid: Number(userId)
                    });

                if (oldProduct) {
                    oldProduct.quantity =
                        Number(
                            oldProduct.quantity
                        ) +
                        Number(
                            oldItem.buyitem
                        );
                    oldProduct.archived = false;

                    await oldProduct.save();
                }
            }

            const newItems = [];
            let newTotalAmount = 0;

            for (
                const item
                of updateData.items
            ) {
                const {
                    product,
                    gst
                } =
                    await resolveProductAndGST(
                        item,
                        warnings,
                        userId
                    );

                if (
                    resolvedProductIds.has(
                        Number(
                            product.productid
                        )
                    ) ){
                    throw new Error(
                        `Product ${product.productid} is already included in this invoice after ID/data matching`
                    );
                }

                resolvedProductIds.add(
                    Number(
                        product.productid
                    )
                );

                const buyitem =
                    Number(
                        item.buyitem
                    );

                if (
                    !Number.isInteger(
                        product.quantity
                    ) ||
                    product.quantity < 0
                ) {
                    throw new Error(
                        `Invalid stock quantity for ${product.productname}`
                    );
                }

                if (
                    product.quantity <
                    buyitem
                ) {
                    throw new Error(
                        `Insufficient stock for ${product.productname}. Available: ${product.quantity}, requested: ${buyitem}`
                    );
                }

                const stockBeforePurchase =
                    product.quantity;

                const calculation =
                    calculateItem(
                        product,
                        gst,
                        buyitem
                    );

                newTotalAmount +=
                    calculation.itemTotal;

                newItems.push({
                    productid:
                        product.productid,

                    productname:
                        product.productname,

                    quantity:
                        stockBeforePurchase,

                    buyitem:
                        buyitem,

                    price:
                        product.price,

                    hsncode:
                        product.hsncode,

                    gst: {
                        gstid:
                            gst.gstid,

                        gsttype:
                            gst.gsttype,

                        gstrate:
                            gst.gstrate,

                        gstin:
                            gst.gstin
                    }
                });

                product.quantity =
                    Number(
                        product.quantity
                    ) -
                    buyitem;
                product.archived = product.quantity <= 0;

                await product.save();
            }

            invoice.items =
                newItems;

            invoice.totalamount =
                Number(
                    newTotalAmount.toFixed(2)
                );
        }

        if (
            updateData.payment !==
            undefined
        ) {
            const paymentid =
                invoice.payment?.paymentid ||
                await getNextPaymentId();

            invoice.payment = {
                paymentid:
                    paymentid,

                paymentamount:
                    invoice.totalamount,

                paymentstatus:
                    updateData.payment.paymentstatus ??
                    invoice.payment?.paymentstatus ??
                    "Pending",

                paymentdate:
                    updateData.payment.paymentdate ??
                    invoice.payment?.paymentdate ??
                    Date.now(),

                paymentmode:
                    updateData.payment.paymentmode ??
                    invoice.payment?.paymentmode ??
                    "Cash"
            };
        }

        if (
            invoice.payment
        ) {
            invoice.payment.paymentamount =
                invoice.totalamount;

            if (invoice.payment.paymentstatus === "Paid") {
                invoice.status = "Paid";
            } else if (invoice.payment.paymentstatus === "Refunded") {
                invoice.status = "Overdue";
            } else if (["Pending", "Failed"].includes(invoice.payment.paymentstatus)) {
                invoice.status = "Draft";
            }
        }

        await invoice.save();

        let payment = null;

        if (
            invoice.payment
        ) {
            payment =
                await Payment.findOneAndUpdate(
                    {
                        paymentid:
                            invoice.payment.paymentid
                    },
                    {
                        paymentid:
                            invoice.payment.paymentid,

                        invoiceid:
                            invoice.invoiceid,

                        paymentamount:
                            invoice.totalamount,

                        paymentstatus:
                            invoice.payment.paymentstatus,

                        paymentdate:
                            invoice.payment.paymentdate,

                        paymentmode:
                            invoice.payment.paymentmode
                    },
                    {
                        upsert:
                            true,

                        new:
                            true,

                        runValidators:
                            true
                    }
                );
        }

        return {
            invoice:
                invoice.toJSON(),

            payment:
                payment
                    ? payment.toJSON()
                    : null,

            warnings:
                warnings
        };

    } catch (error) {
        throw new Error(
            "Error updating invoice: " +
            error.message
        );
    }
};

const deleteInvoice = async (
    id,
    userId
) => {
    try {
        const invoice =
            await Invoice.findOne({
                invoiceid:
                    Number(id),
                "user.userid": Number(userId)
            });

        if (!invoice) {
            throw new Error(
                "Invoice not found"
            );
        }

        for (
            const item
            of invoice.items
        ) {
            const product =
                await Product.findOne({
                    productid:
                        Number(
                            item.productid
                            ),
                        ownerid: Number(invoice.user.userid)
                });

            if (product) {
                product.quantity =
                    Number(
                        product.quantity
                    ) +
                    Number(
                        item.buyitem
                    );
                product.archived = false;

                await product.save();
            }
        }

        await Payment.deleteOne({
            invoiceid:
                invoice.invoiceid
        });

        await Invoice.deleteOne({
            invoiceid:
                invoice.invoiceid
        });

        return {
            message:
                "Invoice and associated payment deleted successfully"
        };

    } catch (error) {
        throw new Error(
            "Error deleting invoice: " +
            error.message
        );
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    getInvoicesByCustomer,
    updateInvoice,
    deleteInvoice
};

