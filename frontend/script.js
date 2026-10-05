

// INTERNET STATUS
// ==========================================

function updateInternetStatus() {

    const navbar = document.querySelector(".navbar");

    if (!navbar) return;
    if (navigator.onLine) {

    navbar.classList.remove("offline");

  

} else {

    navbar.classList.add("offline");

}

    if (navigator.onLine) {

        navbar.classList.remove("offline");

    } else {

        navbar.classList.add("offline");

    }
}

window.addEventListener("online", updateInternetStatus);
window.addEventListener("offline", updateInternetStatus);

window.addEventListener("load", updateInternetStatus);


// ==========================================
// NOVA - COMPLETE JAVASCRIPT
// ==========================================

function similarity(a, b) {

    a = String(a || "").toLowerCase();
    b = String(b || "").toLowerCase();

    if (a === b) {
        return 100;
    }

    if (!a || !b) {
        return 0;
    }

    const distance =
        levenshteinDistance(a, b);

    const maxLength =
        Math.max(a.length, b.length);

    return (
        1 -
        (distance / maxLength)
    ) * 100;
}


function levenshteinDistance(a, b) {

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            if (b.charAt(i - 1) === a.charAt(j - 1)) {

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            } else {

                matrix[i][j] =
                    Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
            }
        }
    }

    return matrix[b.length][a.length];
}


function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (!sidebar) {
        console.log("Sidebar not found");
        return;
    }

    sidebar.classList.toggle("active");

    if (overlay) {
        overlay.classList.toggle("active");
    }

}


function closeSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

}
function checkLogin() {

    const accountName =
        document.getElementById("accountName");

    if (!accountName) {
        return;
    }

    const savedUser =
        localStorage.getItem("novaUser");

    if (!savedUser) {

        accountName.textContent =
            "My Account";

        return;

    }

    try {

        const user =
            JSON.parse(savedUser);

        accountName.textContent =
            user.name || "My Account";

    } catch (error) {

        console.log("Login data error:", error);

    }

}
// CART DATA
// ==========================================

let cart = JSON.parse(localStorage.getItem("novaCart")) || [];
// ==========================================
// ==========================================
// SAVE CART
// ==========================================

function saveCart() {

    localStorage.setItem(
        "novaCart",
        JSON.stringify(cart)
    );

}
// ==========================================
// ADD TO CART
// ==========================================

function addToCart(
    productName,
    productPrice,
    productId,
    productImage
) {

    // Check product already in cart
    const existingIndex =
        cart.findIndex(function(item) {

            return item.productId === productId;

        });


    // Already exists
    if (existingIndex !== -1) {

        cart[existingIndex].quantity += 1;

    }

    // New product
    else {

        cart.push({

            productId: productId,

            name: productName,

            price: Number(productPrice) || 0,

            image: productImage || "",

            quantity: 1

        });

    }


    // Save
    saveCart();


    // Update cart number
    updateCartCount();


    // Refresh cart
    displayCart();


    console.log(
        "Added to cart:",
        productName
    );

}

// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cartButton =
        document.querySelector(".cart-btn");

    if (!cartButton) {
        return;
    }

    let totalItems = 0;

    cart.forEach(function(item) {
        totalItems += Number(item.quantity) || 0;
    });

    cartButton.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"></path>

            <circle cx="10" cy="20" r="1.3"></circle>
            <circle cx="18" cy="20" r="1.3"></circle>

        </svg>

        ${
            totalItems > 0
            ? `<span class="cart-number">${totalItems}</span>`
            : ""
        }

    `;
}
// ==========================================
// OPEN CART
// ==========================================
function openCart() {
    locationOpenedFrom = "cart";

    const overlay =
        document.getElementById("cartOverlay");

    const sidebar =
        document.getElementById("cartSidebar");

    const cartBody =
        document.getElementById("cartBody");

    const ordersList =
        document.getElementById("ordersList");

    const cartFooter =
        document.getElementById("cartFooter");

    const deliveryBox =
        document.querySelector(".delivery-address-box");

    const paymentMethod =
        document.getElementById("paymentMethod");


    if (!overlay || !sidebar) {
        return;
    }


    // CART SHOW
    if (cartBody) {
        cartBody.style.display = "block";
    }


    // MY ORDERS HIDE
    if (ordersList) {
        ordersList.style.display = "none";
    }


    // DELIVERY FORM HIDE
    if (deliveryBox) {
        deliveryBox.style.display = "none";
    }


    // PAYMENT SECTION HIDE
    if (paymentMethod) {
        paymentMethod.style.display = "none";
    }


    // CART FOOTER SHOW
    if (cartFooter) {
        cartFooter.style.display = "block";
    }


    // OPEN CART
    overlay.classList.add("active");

    sidebar.classList.add("active");


    displayCart();

}
// ==========================================
// CLOSE CART
// ==========================================

function closeCart() {

    const overlay =
        document.getElementById("cartOverlay");

    const sidebar =
        document.getElementById("cartSidebar");


    if (overlay) {

        overlay.classList.remove("active");

    }


    if (sidebar) {

        sidebar.classList.remove("active");

    }

}

// ==========================================
// DISPLAY CART
// ==========================================

function displayCart() {

    const cartBody =
        document.getElementById("cartBody");

    const cartTotal =
        document.getElementById("cartTotal");

    const cartSubtotal =
        document.getElementById("cartSubtotal");


    if (!cartBody) {
        return;
    }


    // ==========================================
    // EMPTY CART
    // ==========================================

    if (cart.length === 0) {

        cartBody.innerHTML = `

            <div class="empty-cart">

                <div style="font-size:50px;">
                      🛒 
                </div>

                <h3>Your cart is empty</h3>

                <p>
                    Add some products to your cart.
                </p>

            </div>

        `;


        if (cartSubtotal) {
            cartSubtotal.textContent = "₹0";
        }

        if (cartTotal) {
            cartTotal.textContent = "₹0";
        }

        return;
    }


    // ==========================================
    // CALCULATE SUBTOTAL
    // ==========================================

    let subtotal = 0;


    cartBody.innerHTML = "";


    // ==========================================
    // DISPLAY PRODUCTS
    // ==========================================

    cart.forEach(function(item, index) {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            price * quantity;


        subtotal += itemTotal;


        // ==========================================
        // PRODUCT IMAGE
        // ==========================================

        let imageURL = "";


     if (item.image) {

    if (item.image.startsWith("http")) {

        imageURL = item.image;

    } else {

        imageURL =
            "https://nova-backend-7i1l.onrender.com" +
            item.image;

    }

}

        // ==========================================
        // CART ITEM
        // ==========================================

        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div class="cart-product-image">

                ${
                    imageURL
                    ?
                    `<img
                        src="${imageURL}"
                        alt="${item.name || "Product"}"
                    >`
                    :
                    `<div class="no-cart-image">
                        📦
                    </div>`
                }

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name || "Product"}
                </h3>


                <p class="cart-price">
                    ₹${price.toLocaleString("en-IN")}
                </p>


                <div class="quantity-controls">

                    <button
                        type="button"
                        onclick="decreaseQuantity(${index})">
                        −
                    </button>


                    <span>
                        ${quantity}
                    </span>


                    <button
                        type="button"
                        onclick="increaseQuantity(${index})">
                        +
                    </button>

                </div>


                <button
                    type="button"
                    class="remove-btn"
                    onclick="removeFromCart(${index})">

                    Remove

                </button>

            </div>


            <strong class="cart-item-total">

                ₹${itemTotal.toLocaleString("en-IN")}

            </strong>

        `;


        cartBody.appendChild(cartItem);

    });


    // ==========================================
    // UPDATE SUBTOTAL
    // ==========================================

    if (cartSubtotal) {

        cartSubtotal.textContent =
            "₹" + subtotal.toLocaleString("en-IN");

    }


    // ==========================================
    // UPDATE TOTAL
    // ==========================================

    if (cartTotal) {

        cartTotal.textContent =
            "₹" + subtotal.toLocaleString("en-IN");

    }

}



// ==========================================
// INCREASE QUANTITY
// ==========================================

function increaseQuantity(index) {

    if (!cart[index]) {

        return;

    }


    cart[index].quantity += 1;

    saveCart();

    updateCartCount();

    displayCart();

}


// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity(index) {

    if (!cart[index]) {

        return;

    }


    if (cart[index].quantity > 1) {

        cart[index].quantity -= 1;

    } else {

        cart.splice(index, 1);

    }


    saveCart();

    updateCartCount();

    displayCart();

}


// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(index) {

    if (!cart[index]) {

        return;

    }


    cart.splice(index, 1);

    saveCart();

    updateCartCount();

    displayCart();

}
// ==========================================
// CHECKOUT
// ==========================================

async function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }


    // ==========================================
    // CURRENT USER
    // ==========================================

    const user = JSON.parse(
        localStorage.getItem("novaUser") || "null"
    );


    if (!user || !user.email) {

        alert("Please login first.");

        return;
    }


    // ==========================================
    // CHECK DATABASE ADDRESS
    // ==========================================

    try {

        const response = await fetch(
              "https://nova-backend-7i1l.onrender.com/api/delivery-address/" +
            encodeURIComponent(user.email)
        );


        if (response.status === 404) {

            addressSavedForCheckout = false;

        }

        else if (response.ok) {

            addressSavedForCheckout = true;

        }

        else {

            throw new Error(
                "Address check failed"
            );

        }


    } catch (error) {

        console.error(
            "Checkout address error:",
            error
        );

        alert(
            "❌ Address check nahi ho paaya."
        );

        return;
    }


    // ==========================================
    // ELEMENTS
    // ==========================================

    const cartBody =
        document.getElementById("cartBody");

    const cartFooter =
        document.getElementById("cartFooter");

    const deliveryBox =
        document.querySelector(
            ".delivery-address-box"
        );


    // ==========================================
    // ADDRESS NOT SAVED
    // ==========================================
if (!addressSavedForCheckout) {

   showDeliveryForm("checkout");

    return;
}

    // ==========================================
    // ADDRESS ALREADY SAVED
    // ==========================================

    if (deliveryBox) {
        deliveryBox.style.display = "none";
    }

    showPaymentMethod();

}


 // ==========================================
// PAYMENT METHOD
// ==========================================

function startOnlinePayment() {

    alert("💳 Online Payment Coming Soon!");

}
function selectDeliveryOnPayment() {

    console.log(
        "Selected payment method: DELIVERY_ON_PAYMENT"
    );

    placeOrder("DELIVERY_ON_PAYMENT");
}
function showPaymentMethod() {

    const cartBody =
        document.getElementById("cartBody");

    const cartFooter =
        document.getElementById("cartFooter");


    const paymentMethod =
        document.getElementById("paymentMethod");

    if (cartBody) {
        cartBody.style.display = "none";
    }

    if (cartFooter) {
        cartFooter.style.display = "none";
    }

   const deliveryBox =
    document.querySelector(".delivery-address-box");

     if (deliveryBox) {
        deliveryBox.style.display = "none";
     }
    if (paymentMethod) {
        paymentMethod.style.display = "block";
    }
}
// ==========================================
// LOAD PRODUCTS FROM MONGODB
// ==========================================
let allProducts = [];

let selectedCategory = "All";

let productsShown = 0;

const productsPerLoad = 8;

let isLoadingProducts = false;
// ==========================================
// LOAD PRODUCTS
// ==========================================
async function loadProducts() {

    const productGrid =
        document.getElementById("productGrid");

    if (!productGrid) {

        console.log("productGrid nahi mila");

        return;
    }

    try {

        console.log("Products loading...");

        const response =
            await fetch(
                "https://nova-backend-7i1l.onrender.com/api/products"
            );

        if (!response.ok) {

            throw new Error(
                "API Error: " +
                response.status
            );

        }

        allProducts =
            await response.json();

        console.log(
            "MongoDB Products:",
            allProducts
        );


        // ==========================================
        // SAVE PRODUCTS FOR OFFLINE USE
        // ==========================================

        localStorage.setItem(
            "novaProducts",
            JSON.stringify(allProducts)
        );


        productGrid.innerHTML = "";

        productsShown = 0;


        if (
            !Array.isArray(allProducts) ||
            allProducts.length === 0
        ) {

            productGrid.innerHTML =
                "<p>No products found.</p>";

            return;
        }


        loadMoreProducts();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        // ==========================================
        // LOAD SAVED PRODUCTS OFFLINE
        // ==========================================

        const savedProducts =
            localStorage.getItem("novaProducts");


        if (savedProducts) {

            try {

                allProducts =
                    JSON.parse(savedProducts);

                console.log(
                    "OFFLINE PRODUCTS:",
                    allProducts
                );


                if (
                    Array.isArray(allProducts) &&
                    allProducts.length > 0
                ) {

                    productGrid.innerHTML = "";

                    productsShown = 0;

                    loadMoreProducts();

                    return;
                }

            } catch (offlineError) {

                console.error(
                    "Offline products error:",
                    offlineError
                );

            }
        }


        productGrid.innerHTML =
            "<p>No offline products available.</p>";
    }
}

// ==========================================
// LOAD MORE PRODUCTS
// ==========================================

function loadMoreProducts() {

    if (isLoadingProducts) {
        return;
    }

    const productGrid =
        document.getElementById("productGrid");

    if (!productGrid) {
        return;
    }


    // ONLY IN-STOCK + SELECTED CATEGORY
    const filteredProducts =
        allProducts.filter(function(product) {

            const stock =
                Number(product.stock) || 0;

            const category =
                String(product.category || "")
                    .trim()
                    .toLowerCase();

            const selected =
                String(selectedCategory || "All")
                    .trim()
                    .toLowerCase();


            const categoryMatch =
                selected === "all" ||
                category === selected;

return categoryMatch;

        });


    // NO PRODUCT FOUND
    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <p class="no-products-message">
                No products found.
            </p>
        `;

        productsShown = 0;

        return;
    }


    // ALL PRODUCTS ALREADY SHOWN
    if (
        productsShown >=
        filteredProducts.length
    ) {
        return;
    }


    isLoadingProducts = true;


    // LOAD NEXT 8 PRODUCTS
    const nextProducts =
        filteredProducts.slice(
            productsShown,
            productsShown + productsPerLoad
        );


    nextProducts.forEach(function(product) {

        createProductCard(
            productGrid,
            product
        );

    });


    productsShown +=
        nextProducts.length;


    isLoadingProducts = false;
}
// ==========================================
// FILTER PRODUCTS BY CATEGORY
// ==========================================
function filterCategory(category) {

    selectedCategory =
        String(category || "All").trim();


    const productGrid =
        document.getElementById("productGrid");

    if (!productGrid) {
        return;
    }


    // OLD PRODUCTS REMOVE
    productGrid.innerHTML = "";


    // START FROM FIRST PRODUCT
    productsShown = 0;


    isLoadingProducts = false;


    // LOAD FILTERED PRODUCTS
    loadMoreProducts();


    // GO TO SHOP
    const shop =
        document.getElementById("shop");

    if (shop) {

        shop.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
}

// ==========================================
// CREATE PRODUCT CARD
// ==========================================

function createProductCard(productGrid, product) {

    const productCard =
        document.createElement("div");

    productCard.className =
        "product-card";


    // ==========================================
    // PRODUCT NAME
    // ==========================================

    const productName =
        product.name ||
        product.productName ||
        "Product";


    // ==========================================
    // PRODUCT PRICE
    // ==========================================

    let productPrice =
        Number(
            product.price ??
            product.productPrice
        );

    if (!Number.isFinite(productPrice)) {
        productPrice = 0;
    }


    // ==========================================
    // PRODUCT CATEGORY
    // ==========================================

    const productCategory =
        product.category ||
        "Product";

    productCard.dataset.category =
        productCategory;


    // ==========================================
    // PRODUCT STOCK
    // ==========================================

    const productStock =
        Number(product.stock) || 0;


    // ==========================================
    // PRODUCT DESCRIPTION
    // ==========================================

    const productDescription =
        product.description ||
        "";


    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    const productImage =
        product.image || "";

    let imageURL = "";


    if (productImage) {

        if (
            productImage.startsWith("http://") ||
            productImage.startsWith("https://")
        ) {

            imageURL =
                productImage;

        } else {

            imageURL =
                "https://nova-backend-7i1l.onrender.com" +
                (
                    productImage.startsWith("/")
                    ? productImage
                    : "/" + productImage
                );

        }

    }


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
        "Product:",
        productName,
        "| Image:",
        productImage,
        "| Image URL:",
        imageURL
    );


    // ==========================================
    // PRODUCT CARD HTML
    // ==========================================

    productCard.innerHTML = `

        <div class="product-image">

            ${
                imageURL
                ?
                `
                <img
                    src="${imageURL}"
                    alt="${productName}"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="no-product-image"
                    style="display:none;"
                >
                    🛍️
                </div>
                `
                :
                `
                <div class="no-product-image">
                    🛍️
                </div>
                `
            }


            <!-- 3 DOTS -->

            <button
                class="product-menu-btn"
                type="button"
                aria-label="Product options"
            >
                ⋮
            </button>


            <!-- SHARE MENU -->

            <div class="product-menu">

                <button
                    class="product-share-btn"
                    type="button"
                >
                    ↗ Share
                </button>

            </div>


        </div>


        <p class="product-category">
            ${productCategory}
        </p>


        <h3 class="product-name">
            ${productName}
        </h3>


        <strong class="product-price">
            ₹${productPrice.toLocaleString("en-IN")}
        </strong>


        <p class="product-stock">
            ${
                productStock > 0
                ? "✓ In Stock (" + productStock + ")"
                : "✕ Out of Stock"
            }
        </p>


        <p class="product-description">
            ${productDescription}
        </p>


        <div class="product-bottom">

            <button
                class="add-product-btn"
                type="button"
                ${productStock <= 0 ? "disabled" : ""}
            >

                <svg
                    viewBox="0 0 24 24"
                    width="26"
                    height="26"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <path
                        d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6">
                    </path>

                    <circle
                        cx="10"
                        cy="20"
                        r="1.3">
                    </circle>

                    <circle
                        cx="18"
                        cy="20"
                        r="1.3">
                    </circle>

                </svg>

                Add cart

            </button>

        </div>

    `;


    // ==========================================
    // 3 DOTS MENU
    // ==========================================

    const menuButton =
        productCard.querySelector(
            ".product-menu-btn"
        );

    const productMenu =
        productCard.querySelector(
            ".product-menu"
        );

    if (menuButton && productMenu) {

        menuButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                document
                    .querySelectorAll(".product-menu.show")
                    .forEach(function(menu) {

                        if (menu !== productMenu) {
                            menu.classList.remove("show");
                        }

                    });

                productMenu.classList.toggle("show");

            }
        );

    }
// ==========================================
// SHARE PRODUCT
// ==========================================

const shareButton =
    productCard.querySelector(
        ".product-share-btn"
    );

if (shareButton) {

    shareButton.addEventListener(
        "click",
        async function(event) {

            event.stopPropagation();

            const productId =
                product._id || "";

            const shareURL =
                window.location.origin +
                window.location.pathname +
                "?product=" +
                encodeURIComponent(productId);

            try {

                await navigator.share({

                    title:
                        productName,

                    text:
                        "Check out " +
                        productName +
                        " on NOVA",

                    url:
                        shareURL

                });

            } catch (error) {

                console.log(
                    "Share cancelled:",
                    error
                );

            }

            productMenu.classList.remove(
                "show"
            );

        }
    );

}

    // ==========================================
    // ADD TO CART
    // ==========================================

    const addButton =
        productCard.querySelector(
            ".add-product-btn"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            function() {

                addToCart(
                    productName,
                    productPrice,
                    product._id,
                    product.image
                );

            }
        );

    }


    // ==========================================
    // ADD CARD TO GRID
    // ==========================================

    productGrid.appendChild(
        productCard
    );

}





// ==========================================
// SCROLL → LOAD MORE PRODUCTS
// ==========================================

window.addEventListener(
    "scroll",
    function() {

        const scrollPosition =
            window.innerHeight +
            window.scrollY;


        const pageHeight =
            document.documentElement.scrollHeight;


        /*
           Bottom se 500px pehle
           next products load honge.
        */

        if (
            scrollPosition >=
            pageHeight - 500
        ) {

            loadMoreProducts();

        }

    }
);

// ==========================================
// SEARCH PRODUCTS
// ==========================================

function searchProduct() {

    const input =
        document.getElementById("searchInput");
        const productGrid =
    document.getElementById("productGrid");

    if (!input) {
        console.log("Search input is not found.");
        return;
    }

    const query =
        input.value.trim().toLowerCase();

    const products =
        document.querySelectorAll(".product-card");


    // ==========================================
    // SEARCH EMPTY → SAB PRODUCTS SHOW
    // ==========================================

   if (query === "") {

    products.forEach(function(card) {

        card.style.display = "";
        card.style.outline = "";

    });

    const oldMessage =
        document.getElementById("searchNoProductsMessage");

    if (oldMessage) {
        oldMessage.style.display = "none";
    }

    return;
}


    // ==========================================
    // FIND MATCHING PRODUCTS
    // ==========================================

    let matchedProducts = [];


    products.forEach(function(card) {

        const text =
            card.innerText.toLowerCase();

        let bestScore = 0;


        // EXACT MATCH
        if (text.includes(query)) {

            bestScore = 100;

        } else {

            // SPELLING MISTAKE MATCH
            const words =
                text.split(/\s+/);

            words.forEach(function(word) {

                const cleanWord =
                    word.replace(
                        /[^a-z0-9]/g,
                        ""
                    );

                if (!cleanWord) {
                    return;
                }

                const score =
                    similarity(
                        query,
                        cleanWord
                    );

                if (score > bestScore) {
                    bestScore = score;
                }

            });

        }


        // PRODUCT MATCH
        if (bestScore >= 55) {

            matchedProducts.push(card);

        }

    });


    // ==========================================
    // NO PRODUCT
    // ==========================================

  if (matchedProducts.length === 0) {

    products.forEach(function(card) {
        card.style.display = "none";
        card.style.outline = "";
    });

    let message =
        document.getElementById("searchNoProductsMessage");

    if (!message) {

        message = document.createElement("p");

        message.id = "searchNoProductsMessage";
        message.className = "no-products-message";
        message.textContent = "No products found.";

        productGrid.appendChild(message);
    }

 const productsSection =
    document.getElementById("shop");

if (productsSection) {
    productsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

    return;
}
const oldMessage =
    document.getElementById("searchNoProductsMessage");

if (oldMessage) {
    oldMessage.style.display = "none";
}
    // ==========================================
    // HIDE ALL
    // ==========================================

    products.forEach(function(card) {

        card.style.display = "none";
        card.style.outline = "";

    });


    // ==========================================
    // SHOW ALL MATCHING PRODUCTS
    // ==========================================

    matchedProducts.forEach(function(card) {

        card.style.display = "";

        card.style.outline =
            "1px  #fefafafb";

    });


    // ==========================================
    // SCROLL TO FIRST MATCH
    // ==========================================

    matchedProducts[0].scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    // ==========================================
    // REMOVE HIGHLIGHT
    // ==========================================

    setTimeout(function() {

        matchedProducts.forEach(function(card) {

            card.style.outline = "";

        });

    }, 2000);

}


// ==========================================
// SEARCH ENTER
// ==========================================

// ==========================================
// SAVE SEARCH IN LOCAL STORAGE
// ==========================================

function saveSearchTerm(term) {

    term = String(term || "").trim();

    if (!term) {
        return;
    }

    let searches =
        JSON.parse(
            localStorage.getItem("novaSearches")
        ) || [];

    searches =
        searches.filter(function(item) {
            return item.toLowerCase() !== term.toLowerCase();
        });

    searches.unshift(term);

    searches = searches.slice(0, 10);

    localStorage.setItem(
        "novaSearches",
        JSON.stringify(searches)
    );
}

// ==========================================
// SHOW MOBILE SEARCH SUGGESTIONS
// ==========================================
function showMobileSearchSuggestions() {

    const box =
        document.getElementById(
            "mobileSearchSuggestions"
        );

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!box || !input) {
        return;
    }

    const typed =
        input.value.trim().toLowerCase();


    // ==========================================
    // EMPTY SEARCH
    // ==========================================

    if (!typed) {

        box.innerHTML = "";
        box.style.display = "none";

        return;
    }


    // ==========================================
    // SEARCH KE BAAD SAME TEXT PAR HINT MAT DIKHAO
    // ==========================================

    if (
        input.dataset.lastSearched === typed
    ) {

        box.innerHTML = "";
        box.style.display = "none";

        return;
    }


    box.innerHTML = "";


    // ==========================================
    // PRODUCTS
    // ==========================================

    const products =
        document.querySelectorAll(
            ".product-card"
        );


    products.forEach(
        function(card) {

            const productName =
                card.querySelector(
                    ".product-name"
                );

            if (!productName) {
                return;
            }


            const name =
                productName.textContent.trim();


            if (
                name
                    .toLowerCase()
                    .includes(typed)
            ) {

                const suggestion =
                    document.createElement(
                        "div"
                    );

                suggestion.className =
                    "mobile-search-suggestion";

                suggestion.textContent =
                    name;


                // ==================================
                // HINT PAR CLICK
                // ==================================

                suggestion.onclick =
                    function(event) {

                        event.preventDefault();
                        event.stopPropagation();

                        input.value = name;

                        input.dataset.lastSearched =
                            name.toLowerCase();

                        box.innerHTML = "";

                        box.style.display =
                            "none";

                        searchProduct();

                    };


                box.appendChild(
                    suggestion
                );

            }

        }
    );


    // ==========================================
    // SHOW / HIDE HINTS
    // ==========================================

    if (
        box.children.length > 0
    ) {

        box.style.display =
            "block";

    } else {

        box.style.display =
            "none";

    }

}
// ==========================================
// SEARCH ENTER
// ==========================================
function handleSearchKey(event) {

    if (event.key !== "Enter") {
        return;
    }

    const input =
        document.getElementById("searchInput");

    const suggestions =
        document.getElementById(
            "mobileSearchSuggestions"
        );

    if (!input) {
        return;
    }

    const term =
        input.value.trim();

    // ==========================================
    // ENTER DABATE HI HINTS CLOSE
    // ==========================================

    if (suggestions) {
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
    }

    // ==========================================
    // SEARCH
    // ==========================================

    if (term) {

        saveSearchTerm(term);

        input.dataset.lastSearched =
            term.toLowerCase();

        searchProduct();
    }

    // ==========================================
    // SEARCH KE BAAD HINTS CLOSED
    // ==========================================

    if (suggestions) {
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
    }
}
// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        // Cart

        updateCartCount();


        // Login / Account

        if (
            typeof checkLogin ===
            "function"
        ) {

            checkLogin();

        }


        // MongoDB Products

        loadProducts();
        const searchInput =
    document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener(
        "input",
        showMobileSearchSuggestions
    );
}


        console.log(
            "NOVA JavaScript loaded successfully!"
        );

    }
);


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(id) {

    try {

        const response =
            await fetch(
                "https://nova-backend-7i1l.onrender.com/api/products"
            );


        const products =
            await response.json();


        if (!response.ok) {

            alert(
                "❌ product is not loading."
            );

            return;

        }


        const product =
            products.find(
                function(item) {

                    return item._id === id;

                }
            );


        if (!product) {

            alert(
                "❌ Product not found."
            );

            return;

        }


        // Product ID

        document.getElementById(
            "editProductId"
        ).value =
            product._id;


        // Name

        document.getElementById(
            "editProductName"
        ).value =
            product.name || "";


        // Category

        document.getElementById(
            "editProductCategory"
        ).value =
            product.category || "";


        // Price

        document.getElementById(
            "editProductPrice"
        ).value =
            product.price || "";


        // Stock

        document.getElementById(
            "editProductStock"
        ).value =
            product.stock || 0;


        // Description

        document.getElementById(
            "editProductDescription"
        ).value =
            product.description || "";


        // Current Image

        const currentImage =
            document.getElementById(
                "editCurrentImage"
            );


        const currentPreview =
            document.getElementById(
                "editCurrentPreview"
            );
if (product.image) {

    if (
        product.image.startsWith("http://") ||
        product.image.startsWith("https://")
    ) {

        currentPreview.src =
            product.image;

    } else {

        currentPreview.src =
            "https://nova-backend-7i1l.onrender.com" +
            product.image;

    }

    currentImage.style.display =
        "block";

}

      else {

            currentImage.style.display =
                "none";

        }


        // New image reset

        document.getElementById(
            "editProductImage"
        ).value = "";


        document.getElementById(
            "editImagePreview"
        ).style.display =
            "none";


        // Show edit form

        document.getElementById(
            "editProductBox"
        ).style.display =
            "block";


        // Scroll to edit form

        document.getElementById(
            "editProductBox"
        ).scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });


    } catch (error) {

        console.error(error);

        alert(
            "❌ Backend server is not connected."
        );

    }

}


// ==========================================
// PREVIEW NEW EDIT IMAGE
// ==========================================

function previewEditImage(event) {

    const file =
        event.target.files[0];


    const previewBox =
        document.getElementById(
            "editImagePreview"
        );


    const preview =
        document.getElementById(
            "editPreview"
        );


    if (!file) {

        previewBox.style.display =
            "none";

        return;

    }


    const imageURL =
        URL.createObjectURL(file);


    preview.src =
        imageURL;


    previewBox.style.display =
        "block";

}


// ==========================================
// UPDATE PRODUCT
// ==========================================

async function updateProduct() {

    const id =
        document.getElementById(
            "editProductId"
        ).value;


    const name =
        document.getElementById(
            "editProductName"
        ).value.trim();


    const category =
        document.getElementById(
            "editProductCategory"
        ).value;


    const price =
        document.getElementById(
            "editProductPrice"
        ).value;


    const stock =
        document.getElementById(
            "editProductStock"
        ).value;


    const description =
        document.getElementById(
            "editProductDescription"
        ).value.trim();


    const imageInput =
        document.getElementById(
            "editProductImage"
        );


    if (!id) {

        alert(
            "❌ Product ID missing."
        );

        return;

    }


    if (!name) {

        alert(
            "⚠️ Product name enter karo."
        );

        return;

    }


    if (price === "") {

        alert(
            "⚠️ Price enter karo."
        );

        return;

    }


    if (stock === "") {

        alert(
            "⚠️ Stock enter karo."
        );

        return;

    }


    // FormData

    const formData =
        new FormData();


    formData.append(
        "name",
        name
    );

    formData.append(
        "category",
        category
    );

    formData.append(
        "price",
        price
    );

    formData.append(
        "stock",
        stock
    );

    formData.append(
        "description",
        description
    );


    // New image selected hai to upload karo

    if (
        imageInput.files.length > 0
    ) {

        formData.append(
            "image",
            imageInput.files[0]
        );

    }


    try {

        const response =
            await fetch(

                "https://nova-backend-7i1l.onrender.com/api/products/" +
                id,

                {

                    method:
                        "PUT",

                    body:
                        formData

                }

            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                "✅ Product updated successfully!"
            );


            // Hide edit form

            document.getElementById(
                "editProductBox"
            ).style.display =
                "none";


            // Reload products

            loadSellerProducts();


        } else {

            alert(
                "❌ " +
                (
                    data.message ||
                    "Update failed."
                )
            );

        }


    } catch (error) {

        console.error(error);

        alert(
            "❌ Backend server is not connected."
        );

    }

}


// ==========================================
// CANCEL EDIT
// ==========================================

function cancelEditProduct() {

    document.getElementById(
        "editProductBox"
    ).style.display =
        "none";

}

// ==========================================
// SAVE DELIVERY ADDRESS
// ==========================================
// ==========================================
// SAVE DELIVERY ADDRESS
// ==========================================
async function saveDeliveryAddress() {

    // =========================
    // GET FORM VALUES
    // =========================

    const fullName =
        document.getElementById(
            "deliveryFullName"
        ).value.trim();


    const phone =
        document.getElementById(
            "deliveryPhone"
        ).value.trim();


    const pin =
        document.getElementById(
            "deliveryPin"
        ).value.trim();


    const house =
        document.getElementById(
            "deliveryHouse"
        ).value.trim();


    const area =
        document.getElementById(
            "deliveryArea"
        ).value.trim();


    const city =
        document.getElementById(
            "deliveryCity"
        ).value.trim();


    const state =
        document.getElementById(
            "deliveryState"
        ).value;


    const landmarkElement =
        document.getElementById(
            "deliveryLandmark"
        );


    const landmark =
        landmarkElement
            ? landmarkElement.value.trim()
            : "";


    // =========================
    // VALIDATION
    // =========================

    // NAME REQUIRED
    if (!fullName) {

        alert(
            "Full Name enter karo."
        );

        return;
    }


    // MOBILE REQUIRED - 10 DIGITS
    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Valid 10-digit mobile number enter karo."
        );

        return;
    }


    // PIN REQUIRED - 6 DIGITS
    if (!/^[0-9]{6}$/.test(pin)) {

        alert(
            "Valid 6-digit PIN Code enter karo."
        );

        return;
    }


    // AREA REQUIRED
    if (!area) {

        alert(
            "Area, Street, Sector, Village enter karo."
        );

        return;
    }


    // LANDMARK REQUIRED
    if (!landmark) {

        alert(
            "Landmark enter karo."
        );

        return;
    }


    // =========================
    // COMPLETE ADDRESS
    // =========================

    const addressParts = [];


    if (house) {
        addressParts.push(house);
    }


    if (area) {
        addressParts.push(area);
    }


    if (landmark) {
        addressParts.push(landmark);
    }


    if (city) {
        addressParts.push(city);
    }


    if (state) {
        addressParts.push(state);
    }


    addressParts.push(pin);


    const completeAddress =
        addressParts.join(", ");


    console.log(
        "COMPLETE ADDRESS:",
        completeAddress
    );


    // =========================
    // LOCATION
    // =========================

    const latitudeElement =
        document.getElementById(
            "deliveryLatitude"
        );


    const longitudeElement =
        document.getElementById(
            "deliveryLongitude"
        );


    const latitude =
        latitudeElement
            ? latitudeElement.value
            : "";


    const longitude =
        longitudeElement
            ? longitudeElement.value
            : "";


    // =========================
    // LOGGED-IN USER
    // =========================

    const user =
        JSON.parse(
            localStorage.getItem(
                "novaUser"
            ) || "null"
        );


    if (!user || !user.email) {

        alert(
            "Please login first."
        );

        return;
    }


    // =========================
    // DELIVERY DATA
    // =========================

    const deliveryData = {

        email:
            user.email,

        fullName:
            fullName,

        mobile:
            phone,

        pincode:
            pin,

        house:
            house,

        area:
            area,

        landmark:
            landmark,

        city:
            city,

        state:
            state,

        address:
            completeAddress,

        latitude:
            latitude
                ? Number(latitude)
                : null,

        longitude:
            longitude
                ? Number(longitude)
                : null

    };


    console.log(
        "Saving address:",
        deliveryData
    );


    // =========================
    // SAVE TO DATABASE
    // =========================

    try {

        const response =
            await fetch(
                "https://nova-backend-7i1l.onrender.com/api/delivery-address",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            deliveryData
                        )

                }
            );


        const data =
            await response.json();


        // =========================
        // BACKEND ERROR
        // =========================

        if (!response.ok) {

            alert(
                "❌ " +
                (
                    data.message ||
                    "Address save nahi hua."
                )
            );

            return;
        }


        // =========================
        // SAVE LOCAL STORAGE
        // =========================

        localStorage.setItem(

            "novaDeliveryAddress_" +
            user.email,

            JSON.stringify({

                email:
                    user.email,

                fullName:
                    fullName,

                mobile:
                    phone,

                pincode:
                    pin,

                house:
                    house,

                area:
                    area,

                landmark:
                    landmark,

                city:
                    city,

                state:
                    state,

                address:
                    completeAddress,

                latitude:
                    latitude,

                longitude:
                    longitude

            })

        );


        addressSavedForCheckout =
            true;


        // =========================
        // UPDATE HEADER ADDRESS
        // =========================

        const savedAddressText =
            document.getElementById(
                "savedAddressText"
            );


        if (savedAddressText) {

            savedAddressText.textContent =
                " - " +
                completeAddress;

        }


        // =========================
        // HIDE ADDRESS FORM
        // =========================

        const deliveryBox =
            document.querySelector(
                ".delivery-address-box"
            );


        if (deliveryBox) {

            deliveryBox.style.display =
                "none";

        }


        // =========================
        // GET ELEMENTS
        // =========================

        const cartBody =
            document.getElementById(
                "cartBody"
            );


        const cartFooter =
            document.getElementById(
                "cartFooter"
            );


        const ordersList =
            document.getElementById(
                "ordersList"
            );


        const paymentMethod =
            document.getElementById(
                "paymentMethod"
            );


        // =========================
        // PAYMENT HIDE
        // =========================

        if (paymentMethod) {

            paymentMethod.style.display =
                "none";

        }


        // =========================
        // RETURN TO MY ORDERS
        // =========================

        if (
            locationOpenedFrom ===
            "orders"
        ) {

            if (cartBody) {

                cartBody.style.display =
                    "none";

            }


            if (cartFooter) {

                cartFooter.style.display =
                    "none";

            }


            if (ordersList) {

                ordersList.style.display =
                    "block";

            }


            loadMyOrders();

        }


        // =========================
        // RETURN TO CART
        // =========================

        else if (
            locationOpenedFrom ===
            "cart"
        ) {

            if (ordersList) {

                ordersList.style.display =
                    "none";

            }


            if (cartBody) {

                cartBody.style.display =
                    "block";

            }


            if (cartFooter) {

                cartFooter.style.display =
                    "block";

            }


            displayCart();

        }


        // =========================
        // CHECKOUT → PAYMENT
        // =========================

        else if (
            locationOpenedFrom ===
            "checkout"
        ) {

            if (cartBody) {

                cartBody.style.display =
                    "none";

            }


            if (cartFooter) {

                cartFooter.style.display =
                    "none";

            }


            if (paymentMethod) {

                paymentMethod.style.display =
                    "block";

            }

        }


        // =========================
        // SUCCESS
        // =========================

        alert(
            "✅ Delivery address saved successfully!"
        );


        console.log(
            "Delivery address saved:",
            data.address ||
            deliveryData
        );


    } catch (error) {

        console.error(
            "Address save error:",
            error
        );


        alert(
            "❌ Delivery address save nahi hua."
        );

    }

}
let locationActive = false;
let locationWatchId = null;

function useCurrentLocation() {

    const status =
        document.getElementById("locationStatus");

    // ==========================================
    // SECOND CLICK → CLOSE
    // ==========================================

    if (locationActive) {

        locationActive = false;

        if (
            locationWatchId !== null &&
            navigator.geolocation.clearWatch
        ) {
            navigator.geolocation.clearWatch(
                locationWatchId
            );

            locationWatchId = null;
        }

        if (status) {
            status.style.display = "none";
        }

        return;
    }


    // ==========================================
    // FIRST CLICK → OPEN / START
    // ==========================================

    if (!navigator.geolocation) {

        alert(
            "Browser location dosenot support."
        );

        return;
    }

    locationActive = true;

    if (status) {

        status.style.display = "block";

        status.textContent =
            "📍 Location  is loading...";

    }


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            // Agar second click karke already close
            // kar diya gaya hai to kuch mat karo

            if (!locationActive) {
                return;
            }


            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            // ==========================================
            // LATITUDE
            // ==========================================

            const latitudeInput =
                document.getElementById(
                    "deliveryLatitude"
                );

            if (latitudeInput) {
                latitudeInput.value = latitude;
            }


            // ==========================================
            // LONGITUDE
            // ==========================================

            const longitudeInput =
                document.getElementById(
                    "deliveryLongitude"
                );

            if (longitudeInput) {
                longitudeInput.value = longitude;
            }


            if (status) {

                status.textContent =
                    "📍 Address is finding...";

            }


            try {

                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );


                if (!response.ok) {
                    throw new Error(
                        "Address request failed"
                    );
                }


                const data =
                    await response.json();


                console.log(
                    "Location address:",
                    data
                );


                if (!data.address) {

                    throw new Error(
                        "Address nahi mila"
                    );

                }


                const address =
                    data.address;


                // ==========================================
                // HOUSE
                // ==========================================

                const house =
                    document.getElementById(
                        "deliveryHouse"
                    );

                if (house) {

                    house.value =
                        [
                            address.house_number,
                            address.building
                        ]
                        .filter(Boolean)
                        .join(", ");

                }


                // ==========================================
                // AREA
                // ==========================================

                const area =
                    document.getElementById(
                        "deliveryArea"
                    );

                if (area) {

                    area.value =
                        [
                            address.road,
                            address.neighbourhood,
                            address.suburb
                        ]
                        .filter(Boolean)
                        .join(", ");

                }


                // ==========================================
                // CITY
                // ==========================================

                const city =
                    document.getElementById(
                        "deliveryCity"
                    );

                if (city) {

                    city.value =
                        address.city ||
                        address.town ||
                        address.municipality ||
                        "";

                }


                // ==========================================
                // PIN
                // ==========================================

                const pin =
                    document.getElementById(
                        "deliveryPin"
                    );

                if (pin) {

                    pin.value =
                        address.postcode || "";

                }


                // ==========================================
                // STATE
                // ==========================================

                const state =
                    document.getElementById(
                        "deliveryState"
                    );

                if (state) {

                    const stateName =
                        address.state || "";

                    for (
                        let i = 0;
                        i < state.options.length;
                        i++
                    ) {

                        if (
                            state.options[i]
                                .text
                                .toLowerCase()
                                .includes(
                                    stateName.toLowerCase()
                                )
                        ) {

                            state.selectedIndex = i;

                            break;
                        }

                    }

                }


                if (status) {

                    status.style.display =
                        "block";

                    status.textContent =
                        "✅ address is fill using Current location.";

                }


                console.log(
                    "Latitude:",
                    latitude
                );

                console.log(
                    "Longitude:",
                    longitude
                );
                console.log(
    "GPS Accuracy:",
    position.coords.accuracy,
    "meters"
);
console.log("GPS Accuracy:", position.coords.accuracy, "meters");

            }

            catch (error) {

                console.error(
                    "Address error:",
                    error
                );

                if (status) {

                    status.textContent =
                        "⚠️ location is not found";

                }

            }

        },


        function(error) {

            // Agar second click se close ho chuka hai
            if (!locationActive) {
                return;
            }


            console.log(
                "Location error:",
                error
            );


            locationActive = false;


            if (status) {

                status.style.display =
                    "block";

                status.textContent =
                    "❌ Location is not detect.";

            }


            alert(
                "Location permission not found.please enter Address manually ."
            );

        },


        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
        

    );

console.log("GPS Accuracy:", position.coords.accuracy, "meters");
}
let addressSavedForCheckout = false;

let locationOpenedFrom = "cart";

// ==========================================
// SIDEBAR
// ==========================================
// ==========================================
// SHOW DELIVERY FORM
// LOAD SAVED ADDRESS FROM DATABASE
async function showDeliveryForm(source = locationOpenedFrom) {

    locationOpenedFrom = source;

    console.log(
        "showDeliveryForm opened from:",
        locationOpenedFrom
    );

    const cartBody =
        document.getElementById("cartBody");

    const cartFooter =
        document.getElementById("cartFooter");

    const ordersList =
        document.getElementById("ordersList");

    const deliveryBox =
        document.querySelector(".delivery-address-box");

    const paymentMethod =
        document.getElementById("paymentMethod");

    const user =
        JSON.parse(
            localStorage.getItem("novaUser") || "null"
        );


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!user || !user.email) {

        alert("Please login first.");
        return;

    }


    console.log(
        "CURRENT USER EMAIL:",
        user.email
    );


    // ==========================================
    // SHOW DELIVERY FORM
    // ==========================================

    if (deliveryBox) {
        deliveryBox.style.display = "flex";
    }

    if (cartBody) {
        cartBody.style.display = "none";
    }

    if (ordersList) {
        ordersList.style.display = "none";
    }

    if (paymentMethod) {
        paymentMethod.style.display = "none";
    }

    if (cartFooter) {
        cartFooter.style.display = "none";
    }


    // ==========================================
    // GET FORM FIELDS
    // ==========================================

    const fullName =
        document.getElementById("deliveryFullName");

    const phone =
        document.getElementById("deliveryPhone");

    const pin =
        document.getElementById("deliveryPin");

    const house =
        document.getElementById("deliveryHouse");

    const area =
        document.getElementById("deliveryArea");

    const landmark =
        document.getElementById("deliveryLandmark");

    const city =
        document.getElementById("deliveryCity");

    const state =
        document.getElementById("deliveryState");

    const latitude =
        document.getElementById("deliveryLatitude");

    const longitude =
        document.getElementById("deliveryLongitude");


    // ==========================================
    // CLEAR OLD DATA
    // ==========================================

    if (fullName) fullName.value = "";
    if (phone) phone.value = "";
    if (pin) pin.value = "";
    if (house) house.value = "";
    if (area) area.value = "";
    if (landmark) landmark.value = "";
    if (city) city.value = "";
    if (state) state.value = "";
    if (latitude) latitude.value = "";
    if (longitude) longitude.value = "";


    // ==========================================
    // LOAD SAVED ADDRESS FROM DATABASE
    // ==========================================

    try {

        const response =
            await fetch(
                "https://nova-backend-7i1l.onrender.com/api/delivery-address/" +
                encodeURIComponent(user.email)
            );


        // ==========================================
        // NO SAVED ADDRESS
        // ==========================================

        if (response.status === 404) {

            console.log(
                "No saved address for:",
                user.email
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Address load failed"
            );

        }


        const data =
            await response.json();


        console.log(
            "DELIVERY ADDRESS FROM DATABASE:",
            data
        );


        const address =
            data.address || data;


        console.log(
            "ADDRESS OBJECT:",
            address
        );


        if (!address) {

            console.log(
                "No address data found."
            );

            return;
        }


        // ==========================================
        // FILL SAVED ADDRESS
        // ==========================================

        if (fullName) {

            fullName.value =
                address.fullName || "";

        }


        if (phone) {

            phone.value =
                address.mobile || "";

        }


        if (pin) {

            pin.value =
                address.pincode || "";

        }


        if (house) {

            house.value =
                address.house || "";

        }


        if (area) {

            area.value =
                address.area || "";

        }


        if (landmark) {

            landmark.value =
                address.landmark || "";

        }


        if (city) {

            city.value =
                address.city || "";

        }


        if (state) {

            state.value =
                address.state || "";

        }


        if (latitude) {

            latitude.value =
                address.latitude ?? "";

        }


        if (longitude) {

            longitude.value =
                address.longitude ?? "";

        }


        console.log(
            "SAVED ADDRESS FILLED SUCCESSFULLY"
        );


    }
    catch (error) {

        console.error(
            "Database address load error:",
            error
        );

        alert(
            "❌ Saved address load nahi hua."
        );

    }

}
function loadSavedDeliveryAddress() {

    const user =
        JSON.parse(
            localStorage.getItem("novaUser") || "null"
        );

    // User login nahi hai
    if (!user || !user.email) {
        return;
    }

    const saved =
        localStorage.getItem(
            "novaDeliveryAddress_" + user.email
        );

    if (!saved) {
        return;
    }

    try {

        const address =
            JSON.parse(saved);

        addressSavedForCheckout = true;


        // ==========================================
        // FULL NAME
        // ==========================================

        const fullName =
            document.getElementById("deliveryFullName");

        if (fullName) {
            fullName.value =
                address.fullName || "";
        }


        // ==========================================
        // PHONE
        // ==========================================

        const phone =
            document.getElementById("deliveryPhone");

        if (phone) {
            phone.value =
                address.mobile || "";
        }


        // ==========================================
        // PIN CODE
        // ==========================================

        const pin =
            document.getElementById("deliveryPin");

        if (pin) {
            pin.value =
                address.pincode || "";
        }


        // ==========================================
        // HOUSE
        // ==========================================

        const house =
            document.getElementById("deliveryHouse");

        if (house) {
            house.value =
                address.house || "";
        }


        // ==========================================
        // AREA
        // ==========================================

        const area =
            document.getElementById("deliveryArea");

        if (area) {
            area.value =
                address.area || "";
        }


        // ==========================================
        // LANDMARK
        // ==========================================

        const landmark =
            document.getElementById("deliveryLandmark");

        if (landmark) {
            landmark.value =
                address.landmark || "";
        }


        // ==========================================
        // CITY
        // ==========================================

        const city =
            document.getElementById("deliveryCity");

        if (city) {
            city.value =
                address.city || "";
        }


        // ==========================================
        // STATE
        // ==========================================

        const state =
            document.getElementById("deliveryState");

        if (state) {
            state.value =
                address.state || "";
        }


        // ==========================================
        // LATITUDE
        // ==========================================

        const latitude =
            document.getElementById("deliveryLatitude");

        if (latitude) {
            latitude.value =
                address.latitude ?? "";
        }


        // ==========================================
        // LONGITUDE
        // ==========================================

        const longitude =
            document.getElementById("deliveryLongitude");

        if (longitude) {
            longitude.value =
                address.longitude ?? "";
        }


        // ==========================================
        // SAVED ADDRESS TEXT
        // ==========================================

        const savedAddressText =
            document.getElementById(
                "savedAddressText"
            );

        if (savedAddressText) {

            savedAddressText.textContent =
                " ➤ " +
                (address.address || "");

        }


        console.log(
            "Saved address loaded:",
            address
        );


    } catch (error) {

        console.error(
            "Saved address load error:",
            error
        );

    }
}
document.addEventListener("DOMContentLoaded", function () {

    // Saved address load karo
    loadSavedDeliveryAddress();

    // Refresh ke baad hamesha CART dikhao
    const cartBody =
        document.getElementById("cartBody");

    const cartFooter =
        document.getElementById("cartFooter");
const deliveryBox =
    document.querySelector(".delivery-address-box");

if (deliveryBox) {
    deliveryBox.style.display = "none";
}

    if (cartBody) {
        cartBody.style.display = "block";
    }

    if (cartFooter) {
        cartFooter.style.display = "block";
    }

});

// ==========================================
// PLACE ORDER
// ==========================================
async function placeOrder(paymentMethod) {

    // ==============================
    // CART CHECK
    // ==============================


    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }


    // ==============================
    // LOGIN USER
    // ==============================

    const savedUser =
        localStorage.getItem("novaUser");

    if (!savedUser) {
        alert("Please login first.");
        return;
    }

    const user =
        JSON.parse(savedUser);

    const customerName =
        user.name;

    const customerEmail =
        user.email;


    // ==============================
    // DELIVERY ADDRESS
    // ==============================

   const savedAddress =
    localStorage.getItem(
        "novaDeliveryAddress_" + customerEmail
    );

    if (!savedAddress) {
        alert("Please save your delivery address first.");
        return;
    }

    const addressData =
        JSON.parse(savedAddress);

    const phone =
        addressData.mobile;

    const address =
        addressData.address;


    // ==============================
    // TOTAL CALCULATE
    // ==============================

    let totalAmount = 0;

    cart.forEach(function(item) {

        totalAmount +=
            (Number(item.price) || 0) *
            (Number(item.quantity) || 1);

    });
    console.log(
    "placeOrder paymentMethod =",
    paymentMethod
);


    // ==============================
    // ORDER DATA
    // ==============================

    const orderData = {

        customerName:
            customerName,

        customerEmail:
            customerEmail,

        items:
            cart,

        totalAmount:
            totalAmount,

        address:
            address,

        phone:
            phone,

        paymentMethod:
            paymentMethod

    };


    console.log(
        "Sending order:",
        orderData
    );


    // ==============================
    // SEND TO BACKEND
    // ==============================

    try {

        const response =
            await fetch(
                "https://nova-backend-7i1l.onrender.com/api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(orderData)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                "❌ Order save nahi hua: " +
                (data.message ||
                    "Unknown error")
            );

            return;
        }


        // ==============================
        // CART EMPTY
        // ==============================

        cart = [];

        saveCart();

        updateCartCount();


        // ==============================
        // SAVE MY ORDERS
        // ==============================

        let myOrders =
            JSON.parse(
                localStorage.getItem(
                    "novaOrders"
                )
            ) || [];


        myOrders.unshift(
            data.order
        );


        localStorage.setItem(
            "novaOrders",
            JSON.stringify(myOrders)
        );


        // ==============================
        // PAYMENT BOX HIDE
        // ==============================

        const paymentMethodBox =
            document.getElementById(
                "paymentMethod"
            );

        if (paymentMethodBox) {

            paymentMethodBox.style.display =
                "none";

        }


        alert(
            "✅ Order placed successfully!"
        );
// ==============================
// CLOSE CART
// ==============================

closeCart();

// ==============================
// OPEN MY ORDERS
// ==============================

showOrdersPage();

    } catch (error) {

        console.error(
            "Order error:",
            error
        );

        alert(
            "❌ Backend server se connection nahi ho raha."
        );

    }
}
// ==========================================
// START PRODUCTS
// ==========================================


// ==========================================
// MY ORDERS
// ==========================================

const API_URL = "https://nova-backend-7i1l.onrender.com";
// ==========================================
// SHOW MY ORDERS PAGE
// ==========================================
function showOrdersPage() {
    locationOpenedFrom = "orders";

    const overlay =
        document.getElementById("cartOverlay");

    const sidebar =
        document.getElementById("cartSidebar");

    const cartBody =
        document.getElementById("cartBody");

    const ordersList =
        document.getElementById("ordersList");

    const cartFooter =
        document.getElementById("cartFooter");

    const deliveryBox =
        document.querySelector(".delivery-address-box");

    const paymentMethod =
        document.getElementById("paymentMethod");


    if (!overlay || !sidebar || !cartBody || !ordersList) {
        return;
    }


    // CART HIDE
    cartBody.style.display = "none";


    // ORDERS SHOW
    ordersList.style.display = "block";


    // DELIVERY FORM HIDE
    if (deliveryBox) {
        deliveryBox.style.display = "none";
    }


    // PAYMENT SECTION HIDE
    if (paymentMethod) {
        paymentMethod.style.display = "none";
    }


    // CART FOOTER HIDE
    if (cartFooter) {
        cartFooter.style.display = "none";
    }


    // SIDEBAR OPEN
    overlay.classList.add("active");

    sidebar.classList.add("active");


    // LOAD ORDERS
    loadMyOrders();

}
function closeOrders() {

    const overlay =
        document.getElementById("ordersOverlay");

    const sidebar =
        document.getElementById("ordersSidebar");

    if (overlay) {
        overlay.classList.remove("active");
    }

    if (sidebar) {
        sidebar.classList.remove("active");
    }
}


// ==========================================
// LOAD MY ORDERS
// ==========================================

async function loadMyOrders() {

    const ordersList =
        document.getElementById("ordersList");


    if (!ordersList) {
        return;
    }


    // Login check
    const savedUser =
        localStorage.getItem("novaUser");


    if (!savedUser) {

        ordersList.innerHTML = `
            <div class="orders-empty">

                <h2>🔐 Please Login</h2>

                <p>
                    You need to login to see your orders.
                </p>

            </div>
        `;

        return;
    }


    // User data
    let user;

    try {

        user =
            JSON.parse(savedUser);

    } catch (error) {

        ordersList.innerHTML = `
            <div class="orders-empty">

                <h2>❌ User data error</h2>

                <p>
                    Please login again.
                </p>

            </div>
        `;

        return;
    }






    if (!user.email) {

        ordersList.innerHTML = `
            <div class="orders-empty">

                <h2>❌ Email not found</h2>

            </div>
        `;

        return;
    }


    // Loading
    ordersList.innerHTML = `
        <div class="orders-empty">
            ⏳ Loading orders...
        </div>
    `;


    try {

        const response =
            await fetch(
                API_URL +
                "/api/orders/customer/" +
                encodeURIComponent(user.email)
            );


        const orders =
            await response.json();


        if (!response.ok) {

            throw new Error(
                orders.message ||
                "Orders load failed"
            );

        }


        if (
            !Array.isArray(orders) ||
            orders.length === 0
        ) {

            ordersList.innerHTML = `
                <div class="orders-empty">

                    <h2>📦 No Orders Yet</h2>

                    <p>
                        You haven't placed any orders yet.
                    </p>

                </div>
            `;

            return;
        }


        // Clear loading
        ordersList.innerHTML = "";


        // Every order
        orders.forEach(function(order) {

            const orderBox =
                document.createElement("div");


            orderBox.className =
                "order-box";


            // ==================================
            // ORDER ITEMS
            // ==================================

            let itemsHTML = "";


            order.items.forEach(function(item) {

                let imageURL = "";


                if (item.image) {

                    if (
                        item.image.startsWith("http")
                    ) {

                        imageURL =
                            item.image;

                    } else {

                        imageURL =
                            API_URL +
                            item.image;

                    }

                }


                itemsHTML += `

                    <div class="order-item">

                        ${
                            imageURL
                            ?
                            `
                            <img
                                class="order-item-image"
                                src="${imageURL}"
                                alt="${item.name}"
                            >
                            `
                            :
                            `
                            <div
                                class="order-item-image"
                                style="
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:30px;
                                "
                            >
                                📦
                            </div>
                            `
                        }


                        <div class="order-item-info">

                            <h3>
                                ${item.name}
                            </h3>

                            <p>
                                Quantity:
                                ${item.quantity}
                            </p>

                            <p>
                                Price:
                                ₹${Number(
                                    item.price
                                ).toLocaleString("en-IN")}
                            </p>

                            <p>
                                Subtotal:
                                ₹${(
                                    Number(item.price) *
                                    Number(item.quantity)
                                ).toLocaleString("en-IN")}
                            </p>

                        </div>

                    </div>

                `;

            });


            // ==================================
            // ORDER DATE
            // ==================================

            const orderDate =
                new Date(
                    order.createdAt
                ).toLocaleString("en-IN");


            // ==================================
            // STATUS
            // ==================================

            let statusText =
                order.status;


            if (order.status === "Pending") {

                statusText =
                    "🟡 Pending";

            }
            else if (
                order.status === "Confirmed"
            ) {

                statusText =
                    "🔵 Confirmed";

            }
            else if (
                order.status === "Shipped"
            ) {

                statusText =
                    "🚚 Shipped";

            }
            else if (
                order.status === "Delivered"
            ) {

                statusText =
                    "🟢 Delivered";

            }
            else if (
                order.status === "Cancelled"
            ) {

                statusText =
                    "🔴 Cancelled";

            }


            // ==================================
            // CANCEL BUTTON
            // ==================================

            let cancelButton = "";


            if (
                order.status !== "Delivered" &&
                order.status !== "Cancelled" &&
                order.status !== "Shipped"
            ) {

                cancelButton = `

                    <button
                        class="order-cancel-btn"
                        onclick="
                            cancelOrder('${order._id}')
                        "
                    >
                        ❌ Cancel Order
                    </button>

                `;

            }


            // ==================================
            // COMPLETE ORDER BOX
            // ==================================

            orderBox.innerHTML = `

                <div class="order-header">

                    <div>

                        <strong>
                            📦 Order ID
                        </strong>

                        <p
                            style="
                                word-break:break-all;
                            "
                        >
                            ${order._id}
                        </p>

                    </div>


                    <div>

                        <strong >
                            Status
                        </strong>

                        <p
                            class="order-status"
                            onclick="
                                openOrderStatus(
                                    '${order._id}'
                                )
                            "
                        >
                            ${statusText}
                        </p>

                    </div>

                </div>


                <p>

                    📅
                    <strong>
                        Order Date:
                    </strong>

                    ${orderDate}

                </p>


                <hr
                    style="
                        margin:15px 0;
                        border:none;
                        border-top:1px solid #eee;
                    "
                >


                <h3>
                    🛍️ Order Details
                </h3>


                ${itemsHTML}


                <div class="order-total">

                    💰 Total:

                    ₹${Number(
                        order.totalAmount
                    ).toLocaleString("en-IN")}

                </div>


                <div class="order-delivery">

                    <strong>
                        🚚 Delivery Information
                    </strong>


                    <p>
                         ${order.address}
                    </p>


                    <p>
                        📞 ${order.phone}
                    </p>

                </div>


                ${cancelButton}

            `;


            ordersList.appendChild(orderBox);

        });


    } catch (error) {

        console.error(
            "Orders error:",
            error
        );


        ordersList.innerHTML = `

            <div class="orders-empty">

                <h2>
                    ❌ Orders is not loading.
                </h2>


            </div>

        `;

    }

}


// ==========================================
// CANCEL ORDER
// ==========================================

async function cancelOrder(orderId) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmCancel) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL +
                "/api/orders/" +
                orderId +
                "/cancel",
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                "❌ " +
                (
                    data.message ||
                    "Order cancellation failed."
                )
            );

            return;
        }


        alert(
            "✅ Order cancelled successfully!"
        );


        loadMyOrders();


    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );


        alert(
            "❌ Backend server se connection nahi ho raha."
        );

    }

}


// ==========================================
// OPEN ORDER STATUS
// ==========================================

function openOrderStatus(orderId) {

    window.location.href =
        "status.html?id=" +
        encodeURIComponent(orderId);

}

function shopNow() {

    const shop =
        document.getElementById("shop");

    if (shop) {

        shop.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}
// ==========================================
// SIDEBAR SHOP
// ==========================================
function openShop() { 
 
    const shop = 
        document.getElementById("shop"); 
 
    if (!shop) { 
        return; 
    } 
 
    // Sidebar close 
    closeSidebar(); 
 
    // Shop section par scroll 
    shop.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
    }); 
 }function goHome() {

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo(0, 0);

    const home = document.getElementById("home");

    if (home) {
        home.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}
// ==========================================
// SHOW MOBILE SEARCH SUGGESTIONS
// ==========================================

function showMobileSearchSuggestions() {

    const box =
        document.getElementById(
            "mobileSearchSuggestions"
        );

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!box || !input) {
        return;
    }

    const typed =
        input.value.trim().toLowerCase();


    // ==========================================
    // SEARCH KE BAAD SAME TEXT PAR HINT MAT DIKHAO
    // ==========================================

    if (
        input.dataset.lastSearched === typed &&
        typed !== ""
    ) {

        box.innerHTML = "";
        box.style.display = "none";

        return;
    }


    box.innerHTML = "";

    if (!typed) {

        box.style.display = "none";

        return;
    }


    const products =
        document.querySelectorAll(
            ".product-card"
        );

    const names = [];


    products.forEach(function(card) {

        const nameElement =
            card.querySelector(
                ".product-name"
            );

        if (!nameElement) {
            return;
        }

        const name =
            nameElement.textContent.trim();

        if (
            name &&
            name.toLowerCase().includes(typed) &&
            !names.includes(name)
        ) {

            names.push(name);

        }

    });


    names.forEach(function(name) {

        const suggestion =
            document.createElement("div");

        suggestion.className =
            "mobile-search-suggestion";

        suggestion.textContent =
            name;


        suggestion.onclick =
            function() {

                input.value = name;

                input.dataset.lastSearched =
                    name.toLowerCase();

                box.innerHTML = "";

                box.style.display = "none";

                searchProduct();

            };


        box.appendChild(
            suggestion
        );

    });


    if (names.length > 0) {

        box.style.display = "block";

    } else {

        box.style.display = "none";

    }

}
// ==========================================
// MOBILE VOICE SEARCH
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let voiceRecognition = null;

if (SpeechRecognition) {

    voiceRecognition = new SpeechRecognition();

    voiceRecognition.lang = "en-IN";
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;


    // ==========================================
    // MIC START
    // ==========================================

    voiceRecognition.onstart = function () {

        const micScreen =
            document.getElementById("voiceMicScreen");

        if (micScreen) {
            micScreen.classList.add("active");
        }

    };


    // ==========================================
    // VOICE RESULT
    // ==========================================

voiceRecognition.onresult = function (event) {

    const spokenText =
        event.results[0][0].transcript;

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.value =
            spokenText;

        // Cross ko show karo
        searchInput.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        // Voice se bolna khatam hote hi
        // automatically search karo
        handleSearchButton();

    }

};

    // ==========================================
    // MIC ERROR
    // ==========================================

    voiceRecognition.onerror = function (event) {

        console.log(
            "Voice search error:",
            event.error
        );

        const micScreen =
            document.getElementById("voiceMicScreen");

        if (micScreen) {
            micScreen.classList.remove("active");
        }

    };


    // ==========================================
    // MIC END
    // ==========================================

    voiceRecognition.onend = function () {

        const micScreen =
            document.getElementById("voiceMicScreen");

        if (micScreen) {
            micScreen.classList.remove("active");
        }

    };

}


// ==========================================
// START VOICE SEARCH
// ==========================================

function startVoiceSearch() {

    if (!voiceRecognition) {

        alert(
            "Voice search is not supported in this browser."
        );

        return;

    }

    try {

        voiceRecognition.start();

    } catch (error) {

        console.log(
            "Voice search:",
            error
        );

    }

}
// ==========================================
// SEASHOP APP INTRO
// INSTALLED APP ONLY
// ==========================================

(function () {

    const intro =
        document.getElementById("seashopIntro");

    if (!intro) {
        return;
    }

    const isInstalled =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
        ||
        window.navigator.standalone === true;

    // Normal browser mein intro nahi
    if (!isInstalled) {
        intro.remove();
        return;
    }

    // Installed app mein intro show
    intro.style.display = "flex";

    // 2.5 second baad main app
    setTimeout(function () {

        intro.classList.add(
            "seashopIntroHide"
        );

        setTimeout(function () {
            intro.remove();
        }, 500);

    }, 2500);

})();
function toggleClearSearch() {

    const input = document.getElementById("searchInput");
    const clearButton =
        document.getElementById("clearSearchButton");

    if (!input || !clearButton) {
        return;
    }

    if (input.value.trim() !== "") {
        clearButton.classList.add("show");
    } else {
        clearButton.classList.remove("show");
    }
}


function clearSearch() {

    const input =
        document.getElementById("searchInput");

    if (!input) {
        return;
    }

    input.value = "";

    toggleClearSearch();

    handleSearchButton();

    input.focus();
}
function loadAccountProfilePicture() {

    const savedUser =
        localStorage.getItem("novaUser");

    const profilePic =
        document.getElementById("accountProfilePic");

    const defaultIcon =
        document.getElementById("accountDefaultIcon");

    if (!profilePic || !defaultIcon) {
        return;
    }

    function showDefaultIcon() {

        profilePic.style.setProperty(
            "display",
            "none",
            "important"
        );

        defaultIcon.style.setProperty(
            "display",
            "block",
            "important"
        );

    }

    function showProfilePicture() {

        profilePic.style.setProperty(
            "display",
            "block",
            "important"
        );

        defaultIcon.style.setProperty(
            "display",
            "none",
            "important"
        );

    }

    if (!savedUser) {
        showDefaultIcon();
        return;
    }

    try {

        const user =
            JSON.parse(savedUser);

        if (
            user.picture &&
            typeof user.picture === "string"
        ) {

            profilePic.onerror = function () {

                console.log(
                    "Google profile picture failed to load"
                );

                showDefaultIcon();

            };

            profilePic.onload = function () {

                showProfilePicture();

            };

            profilePic.src = user.picture;

        } else {

            showDefaultIcon();

        }

    } catch (error) {

        console.log(
            "Profile picture error:",
            error
        );

        showDefaultIcon();

    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadAccountProfilePicture
);

