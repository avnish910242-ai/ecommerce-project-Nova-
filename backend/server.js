const { initializeApp, cert } = require("firebase-admin/app");

const serviceAccount = require("./sheshop99-firebase-adminsdk-fbsvc-502dcf728c.json");

initializeApp({
    credential: cert(serviceAccount)
});

const { getMessaging } = require("firebase-admin/messaging");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID =
    "172487693630-f62h6g0m0itq8pcbe01saqeeho9u6o8h.apps.googleusercontent.com";

const googleClient =
    new OAuth2Client(GOOGLE_CLIENT_ID);
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// ==========================================
// UPLOAD FOLDER
// ==========================================

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {

    fs.mkdirSync(uploadFolder);

}
const DeliveryAddress = require("./DeliveryAddress");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// IMAGE UPLOAD
// ==========================================

const storage = multer.memoryStorage();

const upload = multer({

    storage: storage,

    fileFilter: function (req, file, cb) {

        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }

    }

});

// ==========================================
// MONGODB
// ==========================================
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected!");
    })
    .catch((error) => {
        console.log("MongoDB error:", error.message);
    });



// ==========================================
// PRODUCT SCHEMA
// ==========================================

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        default: ""
    },

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        default: 0
    },

    description: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    sellerEmail: {
        type: String,
        default: ""
    }

});

const Product =
    mongoose.model("Product", productSchema);
    // ==========================================
// NOTIFICATION SCHEMA
// ==========================================

const notificationSchema = new mongoose.Schema(
    {
        sellerEmail: {
            type: String,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification =
    mongoose.model(
        "Notification",
        notificationSchema
    );


// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

  password: {
    type: String,
    required: false,
    default: null
},

  roles: {
    type: [String],
    enum: ["customer", "seller"],
    default: ["customer"]
},
fcmTokens: {
    type: [String],
    default: []
}

});

const User =
    mongoose.model("User", userSchema);


// ==========================================
// ORDER SCHEMA
// ==========================================

const orderSchema = new mongoose.Schema({

    customerName: {
        type: String,
        required: true
    },

    customerEmail: {
        type: String,
        required: true
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },

            name: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                required: true
            },

            image: {
                type: String,
                default: ""
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

paymentMethod: {
    type: String,

    enum: [
        "ONLINE",
        "DELIVERY_ON_PAYMENT"
    ],

    required: true
},

    status: {
        type: String,

        enum: [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],

        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Order =
    mongoose.model("Order", orderSchema);


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.send("E-commerce Backend is running!");

});


// ==========================================
// GET ALL PRODUCTS
// ==========================================

app.get("/api/products", async (req, res) => {

    try {

        const products =
            await Product.find().sort({ _id: -1 });

        res.json(products);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

});
// ==========================================
// ADD PRODUCT
// ==========================================

app.post(
    "/api/products",
    upload.single("image"),
    async (req, res) => {

        try {

            console.log("Adding product...");
            console.log(req.body);

            let imageUrl = "";

            // ==========================================
            // UPLOAD IMAGE TO CLOUDINARY
            // ==========================================

            if (req.file) {

                const result =
                    await new Promise((resolve, reject) => {

                        const stream =
                            cloudinary.uploader.upload_stream(
                                {
                                    folder: "nova-products"
                                },

                                (error, result) => {

                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve(result);
                                    }
                                }
                            );

                        stream.end(req.file.buffer);

                    });

                imageUrl = result.secure_url;
            }

            // ==========================================
            // CREATE PRODUCT
            // ==========================================

            const product =
                new Product({

                    name:
                        req.body.name,

                    category:
                        req.body.category || "",

                    price:
                        Number(req.body.price),

                    stock:
                        Number(req.body.stock || 0),

                    description:
                        req.body.description || "",

                    image:
                        imageUrl,

                    sellerEmail:
                        req.body.sellerEmail || ""

                });

            const savedProduct =
                await product.save();

            console.log(
                "Product saved:",
                savedProduct
            );


            res.status(201).json(
                savedProduct
            );

        } catch (error) {

            console.log(
                "ADD PRODUCT ERROR:",
                error
            );

            res.status(500).json({
                message: error.message
            });

        }

    }
);

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

app.get(
    "/api/products/:id",
    async (req, res) => {

        try {

            const product =
                await Product.findById(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            res.json(product);

        } catch (error) {

            console.log(
                "GET PRODUCT ERROR:",
                error
            );

            res.status(500).json({
                message: error.message
            });

        }

    }
);
// ==========================================
// UPDATE PRODUCT
// ==========================================

app.put(
    "/api/products/:id",
    upload.single("image"),
    async (req, res) => {

        try {

            const product =
                await Product.findById(req.params.id);

            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            product.name =
                req.body.name;

            product.category =
                req.body.category || "";

            product.price =
                Number(req.body.price);

            product.stock =
                Number(req.body.stock || 0);

            product.description =
                req.body.description || "";

            // ==========================================
            // UPLOAD NEW IMAGE TO CLOUDINARY
            // ==========================================

            if (req.file) {

                const result =
                    await new Promise((resolve, reject) => {

                        const stream =
                            cloudinary.uploader.upload_stream(
                                {
                                    folder: "nova-products"
                                },

                                (error, result) => {

                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve(result);
                                    }

                                }
                            );

                        stream.end(req.file.buffer);

                    });

                product.image =
                    result.secure_url;
            }

            const updatedProduct =
                await product.save();

            res.json(updatedProduct);

        } catch (error) {

            console.log(
                "UPDATE ERROR:",
                error
            );

            res.status(500).json({
                message: error.message
            });

        }

    }
);

// ==========================================
// DELETE PRODUCT
// ==========================================

app.delete(
    "/api/products/:id",
    async (req, res) => {

        try {

            const product =
                await Product.findByIdAndDelete(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            res.json({
                message: "Product deleted successfully"
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// REGISTER
// ==========================================

app.post(
    "/api/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                role
            } = req.body;

            if (!name || !email || !password) {

                return res.status(400).json({
                    message: "All fields are required"
                });

            }

            const existingUser =
                await User.findOne({
                    email: email
                });

            if (existingUser) {

                return res.status(400).json({
                    message: "Email already registered"
                });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const user =
                new User({

                    name: name,

                    email: email,

                    password: hashedPassword,

                    role:
                        role === "retailer"
                            ? "retailer"
                            : "customer"

                });

            await user.save();

            res.status(201).json({

                message:
                    "Account created successfully!",

                user: {

                    name: user.name,

                    email: user.email,

                    role: user.role

                }

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// LOGIN
// ==========================================

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            if (!email || !password) {

                return res.status(400).json({
                    message:
                        "Email and password are required"
                });

            }

            const user =
                await User.findOne({
                    email: email
                });

            if (!user) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }

            res.json({

                message: "Login successful!",

                user: {

                    name: user.name,

                    email: user.email,

                    roles: user.roles

                }

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);
// ==========================================
// GOOGLE LOGIN
// ==========================================

app.post("/api/google-login", async (req, res) => {

    try {

        const { credential } = req.body;

        if (!credential) {

            return res.status(400).json({
                message: "Google credential is required"
            });

        }

        const ticket =
            await googleClient.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID
            });

        const payload =
            ticket.getPayload();

        const googleName =
            payload.name || "Google User";

        const googleEmail =
            payload.email;

        if (!googleEmail) {

            return res.status(400).json({
                message: "Google email not found"
            });

        }

        let user =
            await User.findOne({
                email: googleEmail
            });

        // ==========================================
        // CREATE NEW GOOGLE USER
        // ==========================================

        if (!user) {

            user = await User.create({

                name: googleName,

                email: googleEmail,

                password: null,

                roles: ["customer"],

                fcmTokens: []

            });

        }

        // ==========================================
        // LOGIN RESPONSE
        // ==========================================
// ==========================================
// LOGIN RESPONSE
// ==========================================

res.json({

    message: "Google login successful!",

    user: {

        name: user.name,

        email: user.email,

        roles: user.roles,

        picture: payload.picture || null

    }

});
    } catch (error) {

        console.log(
            "Google login error:",
            error
        );

        res.status(401).json({

            message:
                "Google login failed"

        });

    }

});
// ==========================================
// SAVE / UPDATE DELIVERY ADDRESS
// ==========================================

app.post(
    "/api/delivery-address",
    async (req, res) => {

        try {

            const {
                email,
                fullName,
                mobile,
                house,
                area,
                city,
                state,
                pincode,
                landmark,
                address,
                latitude,
                longitude
            } = req.body;


            // ==========================================
            // REQUIRED FIELDS
            // ==========================================

            if (!email) {
                return res.status(400).json({
                    message: "Email is required"
                });
            }

            if (!fullName) {
                return res.status(400).json({
                    message: "Full Name is required"
                });
            }

            if (!mobile) {
                return res.status(400).json({
                    message: "Mobile number is required"
                });
            }

       /*     if (!house) {
                return res.status(400).json({
                    message: "House is required"
                });
            } */

            if (!area) {
                return res.status(400).json({
                    message: "Area is required"
                });
            }
  /*
            if (!city) {
                return res.status(400).json({
                    message: "City is required"
                });
            }

            if (!state) {
                return res.status(400).json({
                    message: "State is required"
                });
            } */

            if (!pincode) {
                return res.status(400).json({
                    message: "PIN Code is required"
                });
            }


            // ==========================================
            // SAVE / UPDATE ADDRESS FOR THIS EMAIL
            // ==========================================
const savedAddress =
    await DeliveryAddress.findOneAndUpdate(

        {
            email: email
        },

        {
            email: email,

            fullName: fullName,

            mobile: mobile,

            house: house,

            area: area,

            city: city,

            state: state,

            pincode: pincode,

            landmark: landmark,

            address:
                address ||
                (
                    email +
                    " ," +
                    mobile +
                    ", " +
                    area +
                    ", " +
                    city +
                    ", " +
                    state
                ),

            latitude:
                latitude !== undefined &&
                latitude !== ""
                    ? Number(latitude)
                    : null,

            longitude:
                longitude !== undefined &&
                longitude !== ""
                    ? Number(longitude)
                    : null
        },

        {
            new: true,
            upsert: true
        }
    );


            // ==========================================
            // SUCCESS
            // ==========================================

            res.status(200).json({

                message:
                    "Delivery address saved successfully!",

                address:
                    savedAddress

            });


        } catch (error) {

            console.log(
                "DELIVERY ADDRESS ERROR:",
                error
            );

            res.status(500).json({

                message:
                    error.message

            });

        }

    }
);
// ==========================================
// GET DELIVERY ADDRESS BY EMAIL
// ==========================================

app.get(
    "/api/delivery-address/:email",
    async (req, res) => {

        try {

            const email =
                req.params.email;

            const address =
                await DeliveryAddress.findOne({
                    email: email
                });

            if (!address) {

                return res.status(404).json({
                    message: "Address not found"
                });

            }

            res.json({
                address: address
            });

        } catch (error) {

            console.log(
                "GET DELIVERY ADDRESS ERROR:",
                error
            );

            res.status(500).json({
                message: error.message
            });

        }

    }
);
// ==========================================
// SAVE SELLER FCM TOKEN
// ==========================================

app.post("/api/seller/fcm-token", async (req, res) => {

    try {

        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({
                message: "Email and token are required"
            });
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.roles.includes("seller")) {
            return res.status(403).json({
                message: "User is not a seller"
            });
        }

        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            await user.save();
        }

        res.json({
            message: "FCM token saved successfully"
        });

    } catch (error) {

        console.log("FCM token error:", error);

        res.status(500).json({
            message: error.message
        });
    }
});


/* ==========================================
   SAVE CUSTOMER FCM TOKEN
========================================== */

app.post("/api/customer/fcm-token", async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({
                message: "Email and token are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Seller-only accounts ko customer token ke roop mein register na karein.
        if (!user.roles.includes("customer")) {
            return res.status(403).json({
                message: "Customer account required"
            });
        }

        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            await user.save();
        }

        return res.json({
            message: "Customer notification token saved"
        });

    } catch (error) {
        console.error("Customer FCM token error:", error);

        return res.status(500).json({
            message: "Could not save notification token"
        });
    }
});

/* ==========================================
   SEASHOP ADMIN PRODUCT PUSH NOTIFICATION
========================================== */


app.post("/api/admin/send-product-notification", async (req, res) => {
    try {
        const adminEmail = String(req.body.adminEmail || "")
            .trim()
            .toLowerCase();

        const adminKey = String(req.body.adminKey || "");
        const productId = String(req.body.productId || "");

        // ADMIN VERIFICATION
        if (
            !process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_NOTIFICATION_KEY ||
            adminEmail !== process.env.ADMIN_EMAIL.trim().toLowerCase() ||
            adminKey !== process.env.ADMIN_NOTIFICATION_KEY
        ) {
            return res.status(403).json({
                message: "Admin verification failed"
            });
        }

        // VALIDATE PRODUCT ID
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Valid productId is required"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // FIND REGISTERED NOTIFICATION TOKENS
        const users = await User.find({
            fcmTokens: { $exists: true, $ne: [] }
        }).select("fcmTokens");

        const tokens = [
            ...new Set(
                users.flatMap(user => user.fcmTokens || [])
            )
        ];

        if (tokens.length === 0) {
            return res.status(200).json({
                message: "No registered notification devices found",
                sent: 0,
                failed: 0
            });
        }

        const messaging = getMessaging();

        let sent = 0;
        let failed = 0;

        // PRODUCT DETAIL URL
        const productUrl =
            "https://nova-frontend-7gu7.onrender.com/?productId=" +
            encodeURIComponent(String(product._id));

        // MAKE IMAGE URL ABSOLUTE
        const productImage = product.image
            ? (
                product.image.startsWith("http://") ||
                product.image.startsWith("https://")
                    ? product.image
                    : "https://nova-backend-7i1l.onrender.com" +
                      (
                          product.image.startsWith("/")
                              ? product.image
                              : "/" + product.image
                      )
            )
            : "";
                    // RESIZE PRODUCT IMAGE FOR PUSH NOTIFICATION
    
const notificationImage = productImage
  ? productImage.replace(
      "/upload/",
      "/upload/w_1200,h_900,c_limit,f_auto,q_90/"
    )
  : "";
console.log("Original product image:", productImage);
console.log("Notification image:", notificationImage);

            

        // SEND IN BATCHES OF 500
        for (let i = 0; i < tokens.length; i += 500) {
            const batch = tokens.slice(i, i + 500);

            const result = await messaging.sendEachForMulticast({
                tokens: batch,

                notification: {
                    title: "SEASHOP: " + product.name,
                    body: "Price: ₹" + product.price
                },

                data: {
                    productId: String(product._id),
                    productName: String(product.name),
                    productPrice: String(product.price),
                    productImage: productImage,
                    productUrl: productUrl
                },


webpush: {
    notification: {
        icon: "https://nova-frontend-7gu7.onrender.com/svg/seashop.svg",
        badge: "https://nova-frontend-7gu7.onrender.com/svg/seashop.svg",
        image: notificationImage || undefined,

        title: "SEASHOP: " + product.name,
        body: "Price: ₹" + product.price,

        tag: "seashop-product-" + String(product._id),

        data: {
            productUrl: productUrl
        }
    },

    fcmOptions: {
        link: productUrl
    }
}


            });

            sent += result.successCount;
            failed += result.failureCount;

            // REMOVE INVALID/EXPIRED TOKENS
            const invalidTokens = [];

            result.responses.forEach((response, index) => {
                if (
                    !response.success &&
                    (
                        response.error?.code ===
                            "messaging/registration-token-not-registered" ||
                        response.error?.code ===
                            "messaging/invalid-registration-token"
                    )
                ) {
                    invalidTokens.push(batch[index]);
                }
            });

            if (invalidTokens.length > 0) {
                await User.updateMany(
                    {},
                    {
                        $pull: {
                            fcmTokens: { $in: invalidTokens }
                        }
                    }
                );
            }
        }

        return res.json({
            message: "Product notification sending finished",
            sent,
            failed
        });

    } catch (error) {
        console.error(
            "Product push notification error:",
            error
        );

        return res.status(500).json({
            message: "Could not send product notifications"
        });
    }
});


// ==========================================
// CREATE ORDER
// ==========================================

app.post(
    "/api/orders",
    async (req, res) => {

        try {

          const {
    customerName,
    customerEmail,
    items,
    totalAmount,
    address,
    phone,
    paymentMethod
} = req.body;

            if (!customerName) {

                return res.status(400).json({
                    message:
                        "Customer name is required"
                });

            }

            if (!customerEmail) {

                return res.status(400).json({
                    message:
                        "Customer email is required"
                });

            }

            if (
                !items ||
                !Array.isArray(items) ||
                items.length === 0
            ) {

                return res.status(400).json({
                    message: "Cart is empty"
                });

            }

            if (!address) {

                return res.status(400).json({
                    message:
                        "Address is required"
                });

            }

            if (!phone) {

                return res.status(400).json({
                    message:
                        "Phone is required"
                });

            }
            if (!paymentMethod) {

    return res.status(400).json({
        message:
            "Payment method is required"
    });

}
const order =
    new Order({

        customerName:
            customerName,

        customerEmail:
            customerEmail,

        items:
            items,

        totalAmount:
            Number(totalAmount),

        address:
            address,

        phone:
            phone,

        paymentMethod:
            paymentMethod

    });
            const savedOrder =
    await order.save();
    // ==========================================
// FIND SELLERS FROM ORDER PRODUCTS
// ==========================================
const sellerEmails = new Set();

for (const item of items) {

    const product =
        await Product.findById(item.productId);

    if (!product) {
        continue;
    }

    if (product.sellerEmail) {
        sellerEmails.add(
            product.sellerEmail
        );
    }
}
    // DECREASE PRODUCT STOCK
for (const item of items) {
    const product =
        await Product.findById(item.productId);

    if (!product) {
        continue;
    }

    const quantity =
        Number(item.quantity) || 0;

    product.stock =
        Math.max(
            0,
            Number(product.stock || 0) - quantity
        );

    await product.save();
}
// ==========================================
// CREATE SELLER NOTIFICATIONS
// ==========================================

for (const sellerEmail of sellerEmails) {

    await Notification.create({
        sellerEmail: sellerEmail,

        title: "🔔 New Order",

        message:
            `${customerName} ordered ${items.length} item(s)\n` +
            `📍 ${address}`,

        orderId: savedOrder._id
    });

    // ==========================================
    // SEND FCM PUSH NOTIFICATION
    // ==========================================

    const seller = await User.findOne({
        email: sellerEmail
    });

    if (
        seller &&
        Array.isArray(seller.fcmTokens) &&
        seller.fcmTokens.length > 0
    ) {

        const messaging = getMessaging();

        for (const token of seller.fcmTokens) {

           
try {
    await messaging.send({
        token: token,

        notification: {
            title: "New Order",
            body: `${customerName} ordered ${items.length} item(s)`
        },

        webpush: {
            notification: {
                icon: "https://nova-frontend-7gu7.onrender.com/svg/seashop.svg",
                badge: "https://nova-frontend-7gu7.onrender.com/svg/seashop.svg"
            },

            fcmOptions: {
                link: "https://nova-frontend-7gu7.onrender.com/"
            }
        }
    });

    console.log("FCM notification sent to:", seller.email);

} catch (error) {
    console.error("FCM notification error:", error);
}

        }
    }
}

// ==========================================
// SEND SUCCESS RESPONSE
// ==========================================

res.status(201).json({

                message:
                    "Order placed successfully!",

                order:
                    savedOrder

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);
// ==========================================
// GET SELLER NOTIFICATIONS
// ==========================================

app.get(
    "/api/notifications/:sellerEmail",
    async (req, res) => {

        try {

            const notifications =
                await Notification
                    .find({
                        sellerEmail:
                            req.params.sellerEmail
                    })
                    .sort({
                        createdAt: -1
                    });

            res.json(notifications);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);

// ==========================================
// GET SELLER ORDERS
// ==========================================

app.get(
    "/api/orders/seller/:email",
    async (req, res) => {

        try {

            const sellerEmail =
                req.params.email;

            // ==========================================
            // CHECK SELLER
            // ==========================================

            const seller =
                await User.findOne({
                    email: sellerEmail
                });

            if (!seller) {

                return res.status(404).json({
                    message: "Seller not found"
                });

            }

            if (
                !seller.roles ||
                !seller.roles.includes("seller")
            ) {

                return res.status(403).json({
                    message: "User is not a seller"
                });

            }

            // ==========================================
            // GET ALL ORDERS
            // ==========================================

            const orders =
                await Order
                    .find()
                    .sort({
                        createdAt: -1
                    });

            const sellerOrders = [];

            // ==========================================
            // FIND SELLER PRODUCTS INSIDE ORDERS
            // ==========================================

            for (const order of orders) {

                const sellerItems = [];

                for (const item of order.items) {

                    const product =
                        await Product.findById(
                            item.productId
                        );

                    if (!product) {
                        continue;
                    }

                    if (
                        product.sellerEmail &&
                        product.sellerEmail.toLowerCase() ===
                        sellerEmail.toLowerCase()
                    ) {

                        sellerItems.push(item);

                    }

                }

                // ==========================================
                // ONLY ADD ORDER IF SELLER HAS PRODUCT
                // ==========================================

                if (sellerItems.length > 0) {

                    const sellerTotal =
                        sellerItems.reduce(
                            (sum, item) =>
                                sum +
                                (
                                    Number(item.price) *
                                    Number(item.quantity)
                                ),
                            0
                        );

                    sellerOrders.push({

                        _id: order._id,

                        customerName:
                            order.customerName,

                        customerEmail:
                            order.customerEmail,

                        phone:
                            order.phone,

                        address:
                            order.address,

                        paymentMethod:
                            order.paymentMethod,

                        status:
                            order.status,

                        createdAt:
                            order.createdAt,

                        totalAmount:
                            sellerTotal,

                        items:
                            sellerItems

                    });

                }

            }

            res.json(sellerOrders);

        } catch (error) {

            console.log(
                "GET SELLER ORDERS ERROR:",
                error
            );

            res.status(500).json({
                message: error.message
            });

        }

    }
);

// ==========================================
// GET ALL ORDERS
// ==========================================

app.get(
    "/api/orders",
    async (req, res) => {

        try {

            const orders =
                await Order
                    .find()
                    .sort({
                        createdAt: -1
                    });

            res.json(orders);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// GET CUSTOMER ORDERS
// ==========================================

app.get(
    "/api/orders/customer/:email",
    async (req, res) => {

        try {

            const orders =
                await Order
                    .find({
                        customerEmail:
                            req.params.email
                    })
                    .sort({
                        createdAt: -1
                    });

            res.json(orders);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// GET SINGLE ORDER
// ==========================================

app.get(
    "/api/orders/:id",
    async (req, res) => {

        try {

            const order =
                await Order.findById(
                    req.params.id
                );

            if (!order) {

                return res.status(404).json({
                    message:
                        "Order not found"
                });

            }

            res.json(order);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

app.put(
    "/api/orders/:id/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            const allowedStatuses = [

                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
                "Cancelled"

            ];

            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid status"
                });

            }

            const order =
                await Order.findById(
                    req.params.id
                );

            if (!order) {

                return res.status(404).json({
                    message:
                        "Order not found"
                });

            }

            order.status =
                status;

            const updatedOrder =
                await order.save();

            res.json({

                message:
                    "Order status updated successfully!",

                order:
                    updatedOrder

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// CANCEL ORDER
// ==========================================

app.put(
    "/api/orders/:id/cancel",
    async (req, res) => {

        try {

            const order =
                await Order.findById(
                    req.params.id
                );

            if (!order) {

                return res.status(404).json({
                    message:
                        "Order not found"
                });

            }

            if (
                order.status === "Delivered"
            ) {

                return res.status(400).json({
                    message:
                        "Delivered order cannot be cancelled"
                });

            }

            if (
                order.status === "Cancelled"
            ) {

                return res.status(400).json({
                    message:
                        "Order already cancelled"
                });

            }

            order.status =
                "Cancelled";

            const updatedOrder =
                await order.save();

            res.json({

                message:
                    "Order cancelled successfully!",

                order:
                    updatedOrder

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    3000,
    () => {

        console.log(
            "Server running at https://nova-backend-7i1l.onrender.com"
        );

    }
);