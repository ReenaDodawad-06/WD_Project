// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Handle splash screen
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
    }, 3000);

    // Initialize user state
    let userPoints = 0;
    let currentUser = null;
    const pointsDisplay = document.getElementById('userPoints');
    
    // Check for existing token (auto-login)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        fetchUserData(token);
    }

    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            
            // Show target section
            document.getElementById(targetId).classList.remove('hidden');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Scroll to donate section
    window.scrollToDonate = () => {
        document.getElementById('donate').scrollIntoView({ behavior: 'smooth' });
        sections.forEach(section => section.classList.add('hidden'));
        document.getElementById('donate').classList.remove('hidden');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href') === '#donate') {
                link.classList.add('active');
            }
        });
    };

    // Category selection
    window.selectCategory = (category) => {
        const form = document.getElementById('donationForm');
        const categoryInput = document.getElementById('category');
        
        form.classList.remove('hidden');
        categoryInput.value = category.charAt(0).toUpperCase() + category.slice(1);
        
        form.scrollIntoView({ behavior: 'smooth' });
    };

    // Image preview handling
    const imageInput = document.getElementById('images');
    const previewContainer = document.getElementById('imagePreview');

    imageInput.addEventListener('change', () => {
        previewContainer.innerHTML = '';
        const files = imageInput.files;

        for(let i = 0; i < files.length; i++) {
            const file = files[i];
            if(file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // Form submission
    const donationForm = document.getElementById('donationForm');
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Simulate form submission
        const formData = {
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        // Show loading state
        const submitBtn = donationForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update points
            userPoints += 100;
            pointsDisplay.textContent = userPoints;

            // Show success message
            alert('Thank you for your donation! Our team will review your submission and contact you soon.');

            // Reset form
            donationForm.reset();
            previewContainer.innerHTML = '';
            donationForm.classList.add('hidden');

            // Show tracking section
            sections.forEach(section => section.classList.add('hidden'));
            document.getElementById('track').classList.remove('hidden');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if(link.getAttribute('href') === '#track') {
                    link.classList.add('active');
                }
            });

            // Update donation statistics
            updateDonationStats();

        } catch(error) {
            alert('An error occurred. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Update donation statistics
    function updateDonationStats() {
        const totalDonations = document.getElementById('totalDonations');
        const livesImpacted = document.getElementById('livesImpacted');
        const activeDonors = document.getElementById('activeDonors');

        // Animate number increment
        animateNumber(totalDonations, parseInt(totalDonations.textContent), parseInt(totalDonations.textContent) + 1);
        animateNumber(livesImpacted, parseInt(livesImpacted.textContent), parseInt(livesImpacted.textContent) + 5);
        animateNumber(activeDonors, parseInt(activeDonors.textContent), parseInt(activeDonors.textContent) + 1);
    }

    // Number animation helper
    function animateNumber(element, start, end) {
        let current = start;
        const increment = (end - start) / 30;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.round(current).toLocaleString();
            if(current >= end) {
                element.textContent = end.toLocaleString();
                clearInterval(timer);
            }
        }, 30);
    }

    // Initialize first section
    sections.forEach(section => {
        if(section.id !== 'home') {
            section.classList.add('hidden');
        }
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('mainNav');
        const currentScroll = window.pageYOffset;

        if(currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });
    
    // Modal handling
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const phoneForgotPasswordLink = document.getElementById('phoneForgotPasswordLink');
    const userMenu = document.getElementById('userMenu');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Open login modal
    loginBtn.addEventListener('click', () => {
        if (currentUser) {
            // Toggle user menu if logged in
            userMenu.classList.toggle('hidden');
        } else {
            // Show login modal if not logged in
            loginModal.classList.add('active');
        }
    });
    
    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            forgotPasswordModal.classList.remove('active');
            registerModal.classList.remove('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('active');
        if (e.target === forgotPasswordModal) forgotPasswordModal.classList.remove('active');
        if (e.target === registerModal) registerModal.classList.remove('active');
    });
    
    // Switch between login and register
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });
    
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });
    
    // Handle forgot password links
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        forgotPasswordModal.classList.add('active');
        // Set active tab to email
        document.querySelector('[data-tab="emailReset"]').click();
    });
    
    phoneForgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        forgotPasswordModal.classList.add('active');
        // Set active tab to phone
        document.querySelector('[data-tab="phoneReset"]').click();
    });
    
    // Tab switching in login and forgot password modals
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs in the same container
            const tabContainer = btn.closest('.login-tabs');
            tabContainer.querySelectorAll('.tab-btn').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked tab
            btn.classList.add('active');
            
            // Show corresponding form
            const tabName = btn.getAttribute('data-tab');
            const formContainer = btn.closest('.modal-content').querySelector('.login-form-container');
            
            formContainer.querySelectorAll('.login-form').forEach(form => {
                form.classList.add('hidden');
            });
            
            if (tabName === 'email') {
                document.getElementById('emailLoginForm').classList.remove('hidden');
            } else if (tabName === 'phone') {
                document.getElementById('phoneLoginForm').classList.remove('hidden');
            } else if (tabName === 'emailReset') {
                document.getElementById('emailResetForm').classList.remove('hidden');
            } else if (tabName === 'phoneReset') {
                document.getElementById('phoneResetForm').classList.remove('hidden');
            }
        });
    });
    
    // Handle login forms
    const emailLoginForm = document.getElementById('emailLoginForm');
    const phoneLoginForm = document.getElementById('phoneLoginForm');
    
    emailLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        await login(email, password, rememberMe);
    });
    
    phoneLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone').value;
        const password = document.getElementById('phoneLoginPassword').value;
        const rememberMe = document.getElementById('phoneRememberMe').checked;
        
        await login(phone, password, rememberMe);
    });
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            alert('Registration successful!');
            
            // Auto login after registration
            if (data.token) {
                localStorage.setItem('token', data.token);
                currentUser = data.user;
                updateUIForLoggedInUser();
                registerModal.classList.remove('active');
            } else {
                // If no token, redirect to login
                registerModal.classList.remove('active');
                loginModal.classList.add('active');
            }
        } catch (error) {
            alert(error.message);
        }
    });
    
    // Handle forgot password forms
    const emailResetForm = document.getElementById('emailResetForm');
    const phoneResetForm = document.getElementById('phoneResetForm');
    
    emailResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        await requestPasswordReset(email, 'email');
    });
    
    phoneResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('resetPhone').value;
        
        await requestPasswordReset(phone, 'phone');
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', () => {
        logout();
    });
    
    // Authentication functions
    async function login(identifier, password, rememberMe) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier, password, rememberMe })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store token in localStorage or sessionStorage based on rememberMe
            if (rememberMe) {
                localStorage.setItem('token', data.token);
            } else {
                sessionStorage.setItem('token', data.token);
            }
            
            currentUser = data.user;
            updateUIForLoggedInUser();
            loginModal.classList.remove('active');
            
        } catch (error) {
            alert(error.message);
        }
    }
    
    async function requestPasswordReset(identifier, type) {
        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier, type })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset link');
            }
            
            alert(data.message || 'Reset link sent successfully');
            forgotPasswordModal.classList.remove('active');
            
        } catch (error) {
            alert(error.message);
        }
    }
    
    function logout() {
        // Clear token from storage
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Reset user state
        currentUser = null;
        userPoints = 0;
        pointsDisplay.textContent = '0';
        
        // Update UI
        updateUIForLoggedOutUser();
    }
    
    async function fetchUserData(token) {
        try {
            const response = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const userData = await response.json();
            currentUser = userData;
            userPoints = userData.points || 0;
            pointsDisplay.textContent = userPoints;
            
            updateUIForLoggedInUser();
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Clear invalid token
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
        }
    }
    
    function updateUIForLoggedInUser() {
        // Update login button to show user name
        loginBtn.textContent = currentUser.name.split(' ')[0];
        userNameDisplay.textContent = currentUser.name;
        
        // Update points display
        pointsDisplay.textContent = currentUser.points || 0;
    }
    
    function updateUIForLoggedOutUser() {
        // Reset login button
        loginBtn.textContent = 'Login';
        
        // Hide user menu
        userMenu.classList.add('hidden');
    }
});