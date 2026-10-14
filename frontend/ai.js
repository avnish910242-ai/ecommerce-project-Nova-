
const backButton = document.getElementById("aiBackButton");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("aiChatForm");
const chatInput = document.getElementById("aiChatInput");

let isSending = false;

backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

function scrollChatToBottom() {
    requestAnimationFrame(() => {
        const main = document.querySelector(".ai-main");

        if (main) {
            main.scrollTop = main.scrollHeight;
        }
    });
}

function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = `chat-message ${type}`;
    message.textContent = text;

    chatMessages.appendChild(message);
    welcomeScreen.style.display = "none";

    scrollChatToBottom();

    return message;
}

function formatAIReply(text) {
    const safeText = String(text || "Abhi jawab nahi mila.")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return safeText.replace(
        /\*\*(.+?)\*\*/gs,
        '<span class="ai-highlight">$1</span>'
    );
}

/* Automatically adjust textarea height */
function resizeMessageInput() {
    if (chatInput.tagName !== "TEXTAREA") return;

    chatInput.style.height = "auto";

    const maxHeight = 140;
    chatInput.style.height =
        Math.min(chatInput.scrollHeight, maxHeight) + "px";

    chatInput.style.overflowY =
        chatInput.scrollHeight > maxHeight ? "auto" : "hidden";
}

chatInput.addEventListener("input", resizeMessageInput);

/* Insert emoji at the cursor */
function insertEmoji(emoji) {
    const start = chatInput.selectionStart ?? chatInput.value.length;
    const end = chatInput.selectionEnd ?? start;

    chatInput.setRangeText(emoji, start, end, "end");
    chatInput.focus({ preventScroll: true });
    resizeMessageInput();
}

/* Emoji picker */
const emojiButton = document.getElementById("aiEmojiButton");

if (emojiButton) {
    emojiButton.addEventListener("click", () => {
        let picker = document.getElementById("aiEmojiPicker");

        if (picker) {
            picker.remove();
            return;
        }

        picker = document.createElement("div");
        picker.id = "aiEmojiPicker";
        picker.className = "ai-emoji-picker";

        ["😀", "😂", "😊", "😍", "👍", "❤️", "🙏", "🎉",
         "😎", "🤔", "😢", "🔥", "✨", "💙", "🛍️", "✅"]
            .forEach(emoji => {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = emoji;
                button.setAttribute("aria-label", emoji);

                button.addEventListener("click", () => {
                    insertEmoji(emoji);
                    picker.remove();
                });

                picker.appendChild(button);
            });

        chatForm.appendChild(picker);
    });
}

/* Suggested prompts */
document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        chatInput.value = button.textContent.trim();
        resizeMessageInput();
        chatForm.requestSubmit();
    });
});

/* Submit chat message */
chatForm.addEventListener("submit", async event => {
    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message || isSending) return;

    const quantityMatch = message.match(
        /\b(\d+)\s*(?:products?|items?)\b/i
    );

    window.aiRequestedProductCount = quantityMatch
        ? Math.min(Number(quantityMatch[1]), 30)
        : (/\b(product|products|item|items|dikhao|dikhaiye|show)\b/i.test(message)
            ? 1
            : 0);

    addMessage(message, "user-message");

    chatInput.value = "";
    resizeMessageInput();

    const loading = addMessage(
        "SEASHOP AI is thinking...",
        "bot-message"
    );

    isSending = true;

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

        loading.innerHTML = formatAIReply(data.reply);

        const productQuestion =
            /\b(product|products|item|items|price|cost|stock|buy|purchase|hoodie|shirt|shoes|phone|mobile|laptop|show|dikhao|dikhaiye|chahiye|keemat|daam|samaan|kapde)\b/i;

        if (
            productQuestion.test(message) &&
            Array.isArray(data.products) &&
            data.products.length > 0 &&
            window.aiRequestedProductCount > 0
        ) {
            addProductCards(
                data.products.slice(
                    0,
                    window.aiRequestedProductCount
                )
            );
        }

    } catch (error) {
        loading.textContent =
            error.message ||
            "Connection nahi ho paya. Dobara try karein.";
    } finally {
        isSending = false;

        scrollChatToBottom();

        /*
         * Keep focus on the input.
         * Mobile browsers may still close the keyboard depending
         * on their keyboard and focus behavior.
         */
        chatInput.focus({ preventScroll: true });
    }
});

/* Product cards */
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
        scrollChatToBottom();
    }
}
