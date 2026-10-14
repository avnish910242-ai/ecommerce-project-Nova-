
const backButton = document.getElementById("aiBackButton");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("aiChatForm");
const chatInput = document.getElementById("aiChatInput");
const emojiButton = document.getElementById("aiEmojiButton");
const sendButton = chatForm?.querySelector('[type="submit"]');

const AI_CHAT_STORAGE_KEY = "seashop_ai_chat_history";
const AI_API_URL = "https://nova-backend-7i1l.onrender.com/api/ai-chat";

let isSending = false;

// ========================================
// BACK BUTTON
// ========================================

backButton?.addEventListener("click", () => {
    window.location.href = "index.html";
});

// ========================================
// CHAT HISTORY - SAVE
// ========================================

function saveChatHistory() {
    try {
        const messages = chatMessages.querySelectorAll(
            ".chat-message.user-message, .chat-message.bot-message"
        );

        const history = Array.from(messages)
            .filter(message => !message.dataset.temporary)
            .map(message => ({
                type: message.classList.contains("user-message")
                    ? "user-message"
                    : "bot-message",
                text: message.textContent.trim()
            }))
            .filter(message => message.text.length > 0);

        localStorage.setItem(
            AI_CHAT_STORAGE_KEY,
            JSON.stringify(history)
        );
    } catch (error) {
        console.error("Unable to save SEASHOP AI chat:", error);
    }
}

// ========================================
// FORMAT AI REPLY SAFELY
// ========================================

function formatAIReply(text) {
    const safeText = String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    return safeText.replace(
        /\*\*(.+?)\*\*/gs,
        '<span class="ai-highlight">$1</span>'
    );
}

// ========================================
// ADD MESSAGE
// ========================================

function addMessage(text, type, shouldSave = true) {
    const message = document.createElement("div");

    message.className = `chat-message ${type}`;

    if (type === "bot-message") {
        message.innerHTML = formatAIReply(text);
    } else {
        message.textContent = String(text ?? "");
    }

    chatMessages.appendChild(message);

    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    if (shouldSave) {
        saveChatHistory();
    }

    scrollChatToBottom();

    return message;
}

// ========================================
// LOAD CHAT HISTORY
// ========================================

function loadChatHistory() {
    try {
        const saved = localStorage.getItem(AI_CHAT_STORAGE_KEY);

        if (!saved) return;

        const history = JSON.parse(saved);

        if (!Array.isArray(history)) return;

        history.forEach(item => {
            if (
                !item ||
                typeof item.text !== "string" ||
                !["user-message", "bot-message"].includes(item.type)
            ) {
                return;
            }

            addMessage(item.text, item.type, false);
        });

        if (history.length > 0 && welcomeScreen) {
            welcomeScreen.style.display = "none";
        }

        scrollChatToBottom();
    } catch (error) {
        console.error("Unable to load SEASHOP AI chat:", error);
    }
}

// ========================================
// SCROLL CHAT TO BOTTOM
// ========================================

function scrollChatToBottom() {
    const main = document.querySelector(".ai-main");

    if (!main) return;

    requestAnimationFrame(() => {
        main.scrollTop = main.scrollHeight;
    });
}

// ========================================
// MOBILE KEYBOARD VIEWPORT
// ========================================

function adjustChatViewport() {
    const viewport = window.visualViewport;

    if (!viewport) return;

    const keyboardHeight = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop
    );

    document.documentElement.style.setProperty(
        "--ai-keyboard-height",
        `${keyboardHeight}px`
    );
}

if (window.visualViewport) {
    window.visualViewport.addEventListener(
        "resize",
        adjustChatViewport
    );

    window.visualViewport.addEventListener(
        "scroll",
        adjustChatViewport
    );
}

window.addEventListener("resize", adjustChatViewport);

adjustChatViewport();

// ========================================
// TEXTAREA AUTO RESIZE
// ========================================

function resizeMessageInput() {
    if (!chatInput) return;

    chatInput.style.height = "auto";

    chatInput.style.height =
        Math.min(chatInput.scrollHeight, 140) + "px";
}

chatInput?.addEventListener("input", resizeMessageInput);

// ========================================
// EMOJI PICKER
// ========================================

const emojiList = [
    "😀", "😂", "😊", "😍",
    "❤️", "👍", "🔥", "🎉",
    "🙏", "😎", "🤔", "😢",
    "👏", "💙", "✨", "🛍️"
];

let emojiPicker = null;

function createEmojiPicker() {
    if (emojiPicker) return emojiPicker;

    emojiPicker = document.createElement("div");
    emojiPicker.className = "emoji-picker";
    emojiPicker.style.display = "none";

    emojiList.forEach(emoji => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = emoji;
        button.setAttribute("aria-label", `Insert ${emoji}`);

        button.addEventListener("click", () => {
            insertEmoji(emoji);
            emojiPicker.style.display = "none";
        });

        emojiPicker.appendChild(button);
    });

    chatForm?.appendChild(emojiPicker);

    return emojiPicker;
}

function insertEmoji(emoji) {
    if (!chatInput) return;

    const start = chatInput.selectionStart ?? chatInput.value.length;
    const end = chatInput.selectionEnd ?? start;

    chatInput.setRangeText(emoji, start, end, "end");
    chatInput.dispatchEvent(new Event("input", { bubbles: true }));
    chatInput.focus();
}

emojiButton?.addEventListener("click", () => {
    const picker = createEmojiPicker();

    picker.style.display =
        picker.style.display === "none" ? "grid" : "none";
});

// ========================================
// SUGGESTION BUTTONS
// ========================================

document.querySelectorAll("[data-ai-suggestion]").forEach(button => {
    button.addEventListener("click", () => {
        if (!chatInput) return;

        chatInput.value =
            button.dataset.aiSuggestion ||
            button.textContent.trim();

        resizeMessageInput();
        chatInput.focus();
    });
});

// ========================================
// PRODUCT CARDS
// ========================================

function addProductCards(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return;
    }

    const section = document.createElement("div");
    section.className = "ai-product-results";

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "ai-product-card";

        const image = document.createElement("img");

        image.src = product.image || "svg/seashop.svg";
        image.alt = product.name || "Product";
        image.loading = "lazy";

        image.onerror = () => {
            image.onerror = null;
            image.src = "svg/seashop.svg";
        };

        const details = document.createElement("div");
        details.className = "ai-product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "Product";

        const price = document.createElement("p");
        price.textContent = `₹${Number(product.price || 0).toLocaleString("en-IN")}`;

        const stock = document.createElement("p");
        stock.textContent = `Stock: ${Number(product.stock || 0)}`;

        const description = document.createElement("p");
        description.textContent = product.description || "";

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.textContent = "View Product";

        viewButton.addEventListener("click", () => {
            if (product.id == null) {
                window.location.href = "index.html";
                return;
            }

            window.location.href =
                `index.html?productId=${encodeURIComponent(product.id)}`;
        });

        details.append(name, price, stock, description, viewButton);
        card.append(image, details);
        section.appendChild(card);
    });

    chatMessages.appendChild(section);

    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    scrollChatToBottom();
}

// ========================================
// SEND CHAT MESSAGE
// ========================================

chatForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const message = chatInput?.value.trim();

    if (!message || isSending) return;

    isSending = true;

    if (sendButton) {
        sendButton.disabled = true;
    }

    if (emojiPicker) {
        emojiPicker.style.display = "none";
    }

    addMessage(message, "user-message");

    chatInput.value = "";
    resizeMessageInput();

    const loading = addMessage(
        "SEASHOP AI is thinking...",
        "bot-message",
        false
    );

    loading.dataset.temporary = "true";

    try {
        const response = await fetch(AI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                requestedProductCount:
                    Number(window.aiRequestedProductCount) || 0
            })
        });

        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                "Server se valid response nahi mila. Thodi der baad try karo."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Request failed."
            );
        }

        loading.classList.remove("temporary");
        delete loading.dataset.temporary;

        loading.innerHTML = formatAIReply(
            data.reply || "Sorry, mujhe abhi jawab nahi mila."
        );

        saveChatHistory();

        if (Array.isArray(data.products)) {
            addProductCards(data.products);
        }

    } catch (error) {
        delete loading.dataset.temporary;

        loading.textContent =
            `Sorry, error: ${error.message}`;

        saveChatHistory();

        console.error("SEASHOP AI error:", error);

    } finally {
        isSending = false;

        if (sendButton) {
            sendButton.disabled = false;
        }

        scrollChatToBottom();
        adjustChatViewport();

        // Keyboard ko wapas kholne ki koshish.
        // Mobile browser ise hamesha allow nahi karta.
        chatInput?.focus({ preventScroll: true });
    }
});

// ========================================
// RESTORE SAVED CHAT ON PAGE LOAD
// ========================================

loadChatHistory();
resizeMessageInput();
scrollChatToBottom();
