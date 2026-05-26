document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    // Form Toggle Event Listeners
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });

    // Authentication Logic (Simulated)
    const users = [
        { username: "admin", password: "admin" },
        { username: "user2", password: "password2" }
    ];

    // Login Form Submission
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const username = loginForm.querySelector("#loginUsername").value;
        const password = loginForm.querySelector("#loginPassword").value;
        authenticateUser(username, password);
    });

    function authenticateUser(username, password) {
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            // Authentication successful
            window.location.href = "http://127.0.0.1:5505/home/home.html"; // Redirect to Google's homepage
        } else {
            // Authentication failed
            setFormMessage(loginForm, "error", "Invalid username/password combination");
        }
    }

    // Signup Form Submission
    createAccountForm.addEventListener("submit", e => {
        e.preventDefault();
        const username = createAccountForm.querySelector("#signupUsername").value;
        const email = createAccountForm.querySelector("#signupEmail").value;
        const password = createAccountForm.querySelector("#signupPassword").value;
        const confirmPassword = createAccountForm.querySelector("#signupConfirmPassword").value;

        // Validate inputs
        if (validateSignupForm(username, email, password, confirmPassword)) {
            // Add user to the users array (or send to server for real application)
            users.push({ username, password });
            setFormMessage(createAccountForm, "success", "Account created successfully!");
            setTimeout(() => {
                // Optionally, switch to login form after a short delay
                createAccountForm.classList.add("form--hidden");
                loginForm.classList.remove("form--hidden");
            }, 2000);
        }
    });

    function validateSignupForm(username, email, password, confirmPassword) {
        let isValid = true;

        if (!username || !email || !password || !confirmPassword) {
            setFormMessage(createAccountForm, "error", "All fields are required");
            isValid = false;
        } else if (password !== confirmPassword) {
            setFormMessage(createAccountForm, "error", "Passwords do not match");
            isValid = false;
        } else if (users.some(user => user.username === username)) {
            setFormMessage(createAccountForm, "error", "Username already taken");
            isValid = false;
        }

        return isValid;
    }

    function setFormMessage(formElement, type, message) {
        const messageElement = formElement.querySelector(".form__message");
        messageElement.textContent = message;
        messageElement.classList.remove("form__message--success", "form__message--error");
        messageElement.classList.add(`form__message--${type}`);
    }

    // Image Effect JavaScript
    const distanceSlider = document.getElementById('distance');
    const thicknessSlider = document.getElementById('thickness');
    const imgWraps = document.querySelectorAll('.img-wrap');

    distanceSlider.oninput = e => {
        imgWraps.forEach(wrap => {
            wrap.style.setProperty('--distance', e.target.value + '%');
        });
    };

    thicknessSlider.oninput = e => {
        imgWraps.forEach(wrap => {
            wrap.style.setProperty('--border', e.target.value + 'px');
        });
    };
});


// =============================================================================================================

// Buttons
const btnLogin = document.getElementById('btnLogin');
const btnGoogle = document.getElementById('btnGoogle');
const loginForm = document.getElementById('loginForm');
const initialButtons = document.querySelector('.initial-buttons');

btnLogin.addEventListener('click', () => {
    // Hide initial buttons
    initialButtons.style.display = 'none';
    // Show login form
    loginForm.style.display = 'block';
});

btnGoogle.addEventListener('click', () => {
       // Hide initial buttons
    initialButtons.style.display = 'none';
    // Show login form
    loginForm.style.display = 'block';
});

