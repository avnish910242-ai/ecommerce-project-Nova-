
"use strict";

// ========================================
// SEASHOP AI ELEMENTS
// ========================================

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
let emojiPicker = null;

// ========================================
// BACK BUTTON
// ========================================

backButton?.addEventListener("click", () => {
    window.location.href = "index.html";
});

// ========================================
// SAVE CHAT HISTORY LOCALLY
// ========================================

function saveChatHistory() {
    try {
        if (!chatMessages) return;

        const messages = chatMessages.querySelectorAll(
            ".chat-message.user-message, .chat-message.bot-message"
        );

        const history = Array.from(messages)
            .filter(element => !element.dataset.temporary)
            .map(element => ({
                type: element.classList.contains("user-message")
                    ? "user-message"
                    : "bot-message",
                text: element.textContent.trim()
            }))
            .filter(item => item.text.length > 0);

        localStorage.setItem(
            AI_CHAT_STORAGE_KEY,
            JSON.stringify(history)
        );
    } catch (error) {
        console.error("Unable to save chat history:", error);
    }
}

// ========================================
// SAFE AI REPLY FORMATTING
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
// SCROLL CHAT
// ========================================

function scrollChatToBottom() {
    const main = document.querySelector(".ai-main");

    if (!main) return;

    requestAnimationFrame(() => {
        main.scrollTop = main.scrollHeight;
    });
}

// ========================================
// ADD CHAT MESSAGE
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
// LOAD SAVED CHAT
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

    } catch (error) {
        console.error("Unable to load chat history:", error);
    }
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

// ========================================
// INPUT AUTO RESIZE
// ========================================

function resizeMessageInput() {
    if (!chatInput) return;

    chatInput.style.height = "auto";

    chatInput.style.height =
        `${Math.min(chatInput.scrollHeight, 140)}px`;
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

    chatInput.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    chatInput.focus();
}

emojiButton?.addEventListener("click", () => {
    const picker = createEmojiPicker();

    picker.style.display =
        picker.style.display === "none" ? "grid" : "none";
});

// Send button tap se input ka focus bachane ki koshish.
// Browser keyboard ko phir bhi band kar sakta hai.
sendButton?.addEventListener("pointerdown", event => {
    if (document.activeElement === chatInput) {
        event.preventDefault();
    }
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
// SHOPPING INTENT DETECTION
// ========================================

function isShoppingMessage(message) {
    return (
        /\b(product|products|item|items|buy|purchase|shop|shopping|price|cost|stock|available|availability|show|find|search|recommend|suggest|catalog|catalogue|clothes|clothing|shoes|shirt|shirts|electronics|accessories|cart)\b/i.test(message)
        ||
        /प्रोडक्ट|उत्पाद|खरीद|कीमत|दाम|जूते|कपड़े|दिखाओ|उपलब्ध|प्राइस|प्रोडक्ट्स/i.test(message)
        ||
        /\b(kharid|kharidna|dikhao|dikha|chahiye|kitne ka|kitne ki|kaun sa|kaunsa|konsi|product batao|products batao)\b/i.test(message)
    );
}

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
        price.textContent =
            `₹${Number(product.price || 0).toLocaleString("en-IN")}`;

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
// SEND MESSAGE
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

        delete loading.dataset.temporary;

        loading.innerHTML = formatAIReply(
            data.reply || "Sorry, mujhe abhi jawab nahi mila."
        );

        saveChatHistory();

        if (
            isShoppingMessage(message) &&
            Array.isArray(data.products) &&
            data.products.length > 0
        ) {
            addProductCards(data.products);
        }

    } catch (error) {
        delete loading.dataset.temporary;

        loading.textContent = `Sorry, error: ${error.message}`;

        saveChatHistory();

        console.error("SEASHOP AI error:", error);

    } finally {
        isSending = false;

        if (sendButton) {
            sendButton.disabled = false;
        }

        adjustChatViewport();
        scrollChatToBottom();

        // Forcefully keyboard reopen nahi karte.
        // Isse close-open flicker kam ho sakta hai.
    }
});

// ========================================
// INITIALIZE CHAT
// ========================================

loadChatHistory();
resizeMessageInput();
adjustChatViewport();
scrollChatToBottom();
