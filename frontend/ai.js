
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

    document.getElementById("welcomeScreen").style.display = "none";

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
    if (!message) return;

    addMessage(message, "user-message");
    chatInput.value = "";
    chatInput.disabled = true;

    const loading = addMessage("SEASHOP AI is thinking...", "bot-message");

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
        "Backend se JSON nahi mila. Server ya API route check karna hoga."
    );
}

        if (!response.ok) {
            throw new Error(data.message || "AI abhi available nahi hai.");
        }

        loading.textContent = data.reply || "Abhi jawab nahi mila.";

    } catch (error) {
        loading.textContent =
            error.message || "Connection nahi ho paya. Dobara try karein.";
    } finally {
        chatInput.disabled = false;
        chatInput.focus();
    }
});
