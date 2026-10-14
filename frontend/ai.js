
function addProductCards(products) {
    if (!Array.isArray(products) || products.length === 0) return;

    const section = document.createElement("div");
    section.className = "ai-product-results";

    products.forEach((product, index) => {
    if (index >= window.aiRequestedProductCount) return;
        if (!product.image) return;

        const card = document.createElement("article");
        card.className = "ai-product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name || "SEASHOP product";
        image.loading = "lazy";

        image.onerror = () => {
            image.style.display = "none";
        };

        const details = document.createElement("div");
        details.className = "ai-product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "Product";

        const price = document.createElement("p");
        price.textContent = product.price != null
            ? `₹${product.price}`
            : "Price unavailable";

        const stock = document.createElement("p");
        stock.textContent = product.stock != null
            ? `Stock: ${product.stock}`
            : "Stock information unavailable";

        const description = document.createElement("p");
        description.textContent = product.description || "";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "ai-view-product";
        button.textContent = "View Product";

        button.addEventListener("click", () => {
            if (!product.id) {
                alert("Product ID available nahi hai.");
                return;
            }

            window.location.href =
                `index.html?productId=${encodeURIComponent(product.id)}`;
        });

        details.append(name, price, stock, description, button);
        card.append(image, details);
        section.appendChild(card);
    });

    if (section.children.length > 0) {
        chatMessages.appendChild(section);

        const main = document.querySelector(".ai-main");
        main.scrollTop = main.scrollHeight;
    }
}

const backButton = document.getElementById("aiBackButton");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("aiChatForm");
const chatInput = document.getElementById("aiChatInput");

backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = `chat-message ${type}`;
    message.textContent = text;
    chatMessages.appendChild(message);

    welcomeScreen.style.display = "none";

    const main = document.querySelector(".ai-main");
    main.scrollTop = main.scrollHeight;

    return message;
}

document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        chatInput.value = button.textContent.trim();
        chatForm.requestSubmit();
    });
});

chatForm.addEventListener("submit", async event => {
    event.preventDefault();

    const message = chatInput.value.trim();
   const quantityMatch = message.match(
    /\b(\d+)\s*(?:products?|items?)\b/i
);

window.aiRequestedProductCount = quantityMatch
    ? Math.min(Number(quantityMatch[1]), 30)
    : (/\b(product|products|item|items|dikhao|dikhaiye|show)\b/i.test(message)
        ? 1
        : 0);
    if (!message) return;

    addMessage(message, "user-message");
    chatInput.value = "";
    chatInput.disabled = true;

    const loading = addMessage(
        "SEASHOP AI is thinking...",
        "bot-message"
    );

    try {
        const response = await fetch(
            "https://nova-backend-7i1l.onrender.com/api/ai-chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message })
            }
        );

        const rawResponse = await response.text();

        let data;

        try {
            data = JSON.parse(rawResponse);
        } catch {
            throw new Error(
                "Backend se valid JSON nahi mila. Server ya API route check karein."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.message || "AI abhi available nahi hai."
            );
        }
loading.innerHTML = (data.reply || "Abhi jawab nahi mila.")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<span class="ai-highlight">$1</span>');

const productQuestion =
    /\b(product|products|item|items|price|cost|stock|buy|purchase|hoodie|shirt|shoes|phone|mobile|laptop|show|dikhao|dikhaiye|chahiye|keemat|daam|samaan|kapde)\b/i;

if (
    productQuestion.test(message) &&
    Array.isArray(data.products) &&
    data.products.length > 0 &&
    window.aiRequestedProductCount > 0
) {
    addProductCards(
        data.products.slice(0, window.aiRequestedProductCount)
    );

}

    } catch (error) {
        loading.textContent =
            error.message || "Connection nahi ho paya. Dobara try karein.";
    } finally {
        chatInput.disabled = false;
        chatInput.focus();
    }
});