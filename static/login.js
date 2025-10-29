document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("relatorioData");
    console.log("✅ localStorage limpo ao entrar no dashboard.");
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');
    
    // Load saved credentials
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (isRemembered && savedUsername && savedPassword) {
        usernameInput.value = savedUsername;
        passwordInput.value = savedPassword;
        rememberCheckbox.checked = true;
    }
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        if (type === 'text') {
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        if (rememberCheckbox.checked) {
            // Save credentials
            localStorage.setItem('rememberedUsername', usernameInput.value);
            localStorage.setItem('rememberedPassword', passwordInput.value);
            localStorage.setItem('rememberMe', 'true');
        } else {
            // Clear saved credentials
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberedPassword');
            localStorage.removeItem('rememberMe');
        }
    });
});
