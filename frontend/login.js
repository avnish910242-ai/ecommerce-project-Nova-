// ==========================================
// NOVA LOGIN / ACCOUNT JAVASCRIPT
// ==========================================


// ==========================================
// SWITCH LOGIN / REGISTER
// ==========================================

function showForm(formName, button) {

    document.querySelectorAll(".form").forEach(function(form) {
        form.classList.remove("active");
    });

    document.querySelectorAll(".tab").forEach(function(tab) {
        tab.classList.remove("active");
    });

    const selectedForm =
        document.getElementById(formName + "Form");

    if (selectedForm) {
        selectedForm.classList.add("active");
    }

    if (button) {
        button.classList.add("active");
    }

    const message =
        document.getElementById("accountMessage");

    if (message) {
        message.textContent = "";
    }
}


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    if (!input || !button) {
        return;
    }

    if (input.type === "password") {

        input.type = "text";
        button.textContent = "🙈";

    } else {

        input.type = "password";
        button.textContent = "👁️";

    }
}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("accountMessage");

            if (!message) {
                return;
            }

            message.textContent =
                "Creating account...";

            try {
const response =
    await fetch(
        "https://nova-backend-7i1l.onrender.com/api/register",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (response.ok) {

                    const loggedInUser =
                        data.user || {
                            name: name,
                            email: email
                        };

                    localStorage.setItem(
                        "novaUser",
                        JSON.stringify(
                            loggedInUser
                        )
                    );

                    message.textContent =
                        "✅ Account created successfully!";

                    registerForm.reset();

                    setTimeout(function() {

                        window.location.href =
                            "index.html";

                    }, 1000);

                } else {

                    message.textContent =
                        "❌ " +
                        (data.message ||
                            "Account creation failed.");

                }

            } catch (error) {

                console.log(error);

                message.textContent =
                    "❌ Backend server is not connected.";

            }

        }
    );
}


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail").value.trim();

            const password =
                document.getElementById("loginPassword").value;

            const message =
                document.getElementById("accountMessage");

            if (!message) {
                return;
            }

            message.textContent =
                "Logging in...";

            try {

                const response =
                    await fetch(
                        "https://nova-backend-7i1l.onrender.com/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (response.ok) {

                    localStorage.setItem(
                        "novaUser",
                        JSON.stringify(
                            data.user
                        )
                    );

                    console.log(
                        "Logged in user:",
                        data.user
                    );

                    message.textContent =
                        "✅ Login successful!";

                    loginForm.reset();

                    setTimeout(function() {

                        window.location.href =
                            "index.html";

                    }, 1000);

                } else {

                    message.textContent =
                        "❌ " +
                        (data.message ||
                            "Login failed.");

                }

            } catch (error) {

                console.log(error);

                message.textContent =
                    "❌ Backend server is not connected.";

            }

        }
    );
}


// ==========================================
// SHOW LOGGED-IN USER
// ==========================================

function loadAccount() {

    const savedUser =
        localStorage.getItem("novaUser");

    if (!savedUser) {
        return;
    }

    try {

        const user =
            JSON.parse(savedUser);

        const profileSection =
            document.getElementById(
                "profileSection"
            );

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        if (!profileSection) {
            return;
        }

        if (profileName) {

            profileName.textContent =
                user.name || "User";

        }

        if (profileEmail) {

            profileEmail.textContent =
                user.email || "";

        }

        profileSection.style.display =
            "block";

        const tabs =
            document.querySelector(".tabs");

        if (tabs) {
            tabs.style.display = "none";
        }

        const login =
            document.getElementById("loginForm");

        if (login) {
            login.style.display = "none";
        }

        const register =
            document.getElementById("registerForm");

        if (register) {
            register.style.display = "none";
        }

    } catch (error) {

        console.log(
            "User data error:",
            error
        );

    }
}


// ==========================================
// LOGOUT
// ==========================================

function logoutAccount() {

    // LOGIN DATA
    localStorage.removeItem(
        "novaUser"
    );

    // CART DATA
    localStorage.removeItem(
        "novaCart"
    );

    // SESSION DATA
    sessionStorage.clear();

    // DELIVERY ADDRESS DELETE NAHI HOGA

    // HOME PAGE
    window.location.href =
        "index.html";
}


// ==========================================
// LOAD ACCOUNT
// ==========================================

loadAccount();