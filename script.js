// ==========================================
// Configuration
// ==========================================

// EXCHANGE_RATE removed - prices are now manual in JSON
const WHATSAPP_NUMBER = '967775211618';
const DATA_URL = 'data.json';

// Global State
let allAppsData = [];
let currentApp = null;
let selectedCategory = null;

// ==========================================
// Data Fetching
// ==========================================

/**
 * Fetch all apps data from JSON
 */
async function fetchAppsData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Failed to load data');
        allAppsData = await response.json();
        return allAppsData;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// ==========================================
// Home Page Logic
// ==========================================

async function initHomePage() {
    // Show loaders if you had them on home page, or just wait
    // For now we assume the HTML has empty grids

    await fetchAppsData();

    const programsGrid = document.getElementById('programsGrid');
    const gamesGrid = document.getElementById('gamesGrid');

    if (!programsGrid || !gamesGrid) return;

    programsGrid.innerHTML = '';
    gamesGrid.innerHTML = '';

    // Setup Search & Filter Listeners
    setupSearchAndFilter();

    // Initial Render
    renderFilteredApps();
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Search Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderFilteredApps();
        });
    }

    // Filter Buttons Listener
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');
            // Render
            renderFilteredApps();
        });
    });
}

function renderFilteredApps() {
    const searchInput = document.getElementById('searchInput');
    const activeFilterBtn = document.querySelector('.filter-btn.active');

    // Get current search term
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    // Get current active category filter
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

    // Filter Data
    const filteredApps = allAppsData.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm) ||
            app.nameAr.includes(searchTerm);

        const matchesCategory = activeFilter === 'all' || app.type === activeFilter;

        return matchesSearch && matchesCategory;
    });

    // Render Cards
    const programsGrid = document.getElementById('programsGrid');
    const gamesGrid = document.getElementById('gamesGrid');
    const programsSection = document.getElementById('programs');
    const gamesSection = document.getElementById('games');
    const salariesSection = document.getElementById('salaries');
    const noResults = document.getElementById('noResults');

    const salariesGrid = document.getElementById('salariesGrid');

    if (!programsGrid || !gamesGrid) return; // Not on home page

    // Clear currnet content
    programsGrid.innerHTML = '';
    gamesGrid.innerHTML = '';
    if (salariesGrid) salariesGrid.innerHTML = '';

    let programsCount = 0;
    let gamesCount = 0;
    let salariesCount = 0;

    filteredApps.forEach(app => {
        if (app.type === 'salary') {
            const card = createSalaryCard(app);
            if (salariesGrid) {
                salariesGrid.appendChild(card);
                salariesCount++;
            }
        } else {
            const card = createServiceCard(app);
            if (app.type === 'program') {
                programsGrid.appendChild(card);
                programsCount++;
            } else {
                gamesGrid.appendChild(card);
                gamesCount++;
            }
        }
    });

    // Toggle Section Visibility
    if (programsSection) programsSection.style.display = programsCount > 0 ? 'block' : 'none';
    if (gamesSection) gamesSection.style.display = gamesCount > 0 ? 'block' : 'none';
    if (salariesSection) salariesSection.style.display = salariesCount > 0 ? 'block' : 'none';

    // Show/Hide No Results
    if (filteredApps.length === 0) {
        if (noResults) noResults.style.display = 'block';
    } else {
        if (noResults) noResults.style.display = 'none';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Reset Search
    if (searchInput) searchInput.value = '';

    // Reset Filters to All
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === 'all') btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Re-render
    renderFilteredApps();
}

function createServiceCard(app) {
    const link = document.createElement('a');
    link.href = `details.html?id=${app.id}`;
    link.className = 'service-card';

    link.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-icon">
            <img src="${app.icon}" alt="${app.name} Icon">
        </div>
        <h3 class="card-title">${app.nameAr}</h3>
    `;

    return link;
}

function createSalaryCard(app) {
    const card = document.createElement('div');
    card.className = 'service-card salary-card';

    card.onclick = () => openSalaryModal(app);

    card.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-icon">
            <img src="${app.icon}" alt="${app.name} Icon" onerror="this.src='imgs/logo.png'">
        </div>
        <h3 class="card-title">${app.nameAr}</h3>
    `;

    return card;
}

// ==========================================
// Salary Modal Logic
// ==========================================

function openSalaryModal(app) {
    const modal = document.getElementById('salaryModal');
    const modalIcon = document.getElementById('salaryModalIcon');
    const modalTitle = document.getElementById('salaryModalTitle');
    const modalDesc = document.getElementById('salaryModalDesc');
    const withdrawInput = document.getElementById('salaryWithdrawInput');
    const videoBtn = document.getElementById('salaryVideoBtn');

    if (!modal) return;

    // Add history state for back button handling
    window.history.pushState({ modal: 'salary' }, '', '#salaryModal');

    modalIcon.src = app.icon;
    modalTitle.textContent = app.nameAr;
    modalDesc.textContent = app.description;

    // Handle Optional Note
    const modalNote = document.getElementById('salaryModalNote');
    if (app.note) {
        modalNote.textContent = app.note;
        modalNote.style.display = 'block';
    } else {
        modalNote.style.display = 'none';
        modalNote.textContent = '';
    }

    // Set withdraw link/code
    withdrawInput.value = app.withdrawLink || '';

    // Set video link or request explanation
    if (app.explanationLink && app.explanationLink.trim() !== '') {
        // Has explanation video
        videoBtn.href = app.explanationLink;
        videoBtn.target = '_blank';
        videoBtn.onclick = null;
        videoBtn.innerHTML = `
            <span>▶️</span>
            شاهد فيديو الشرح
        `;
        videoBtn.style.display = ''; // Restore default display
    } else {
        // No explanation video - offer WhatsApp explanation request
        videoBtn.href = '#';
        videoBtn.target = '';
        videoBtn.onclick = (e) => {
            e.preventDefault();
            const message = `مرحباً 👋\n\nأريد طلب شرح آلية سحب الراتب من منصة XP\n\n📱 البرنامج: ${app.nameAr}\n\nشكراً لكم 🙏`;
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        };
        videoBtn.innerHTML = `
            <span>💬</span>
            اطلب فيديو الشرح عبر واتساب0
        `;
        videoBtn.style.display = ''; // Show the button
    }

    modal.style.display = 'flex'; // Fix: Use flex to keep centering
    // Force reflow
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hideSalaryModalUI() {
    const modal = document.getElementById('salaryModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }, 300); // Wait for transition
    }
}

function closeSalaryModal() {
    // Manual Close: Go back in history
    // This will trigger 'popstate', which will call hideSalaryModalUI()
    window.history.back();
}

// ==========================================
// Reminder Modal Logic
// ==========================================

function openReminderModal() {
    const reminderModal = document.getElementById('reminderModal');
    if (reminderModal) {
        // Add history state
        window.history.pushState({ modal: 'reminder' }, '', '#reminderModal');

        reminderModal.style.display = 'flex';
        // Force reflow
        reminderModal.offsetHeight;
        reminderModal.classList.add('active');
    }
}

function hideReminderModalUI() {
    const reminderModal = document.getElementById('reminderModal');
    if (reminderModal) {
        reminderModal.classList.remove('active');
        setTimeout(() => {
            reminderModal.style.display = 'none';
        }, 300);
    }
}

function closeReminderModal() {
    window.history.back();
}

function confirmRedirect() {
    // We want to close the modal. Since opening it pushed a state,
    // we should go back to close it and remove the state.
    closeReminderModal();

    let whatsappUrl;

    // Check if there is a specific message pending (from Game/App Order)
    if (window.pendingWhatsappMessage) {
        whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(window.pendingWhatsappMessage)}`;
        // Clear it after use so it doesn't persist inappropriately
        window.pendingWhatsappMessage = null;
    } else {
        // Fallback for Salary page (no specific message generated there typically, or just generic)
        whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
    }

    window.open(whatsappUrl, '_blank');
}

// ==========================================
// Details Page Logic
// ==========================================

async function initDetailsPage() {
    const pageLoader = document.getElementById('pageLoader');
    const contentWrapper = document.getElementById('contentWrapper');
    const errorState = document.getElementById('errorState');

    // Show loading
    if (pageLoader) pageLoader.style.display = 'block';

    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('id');

    if (!appId) {
        showError();
        return;
    }

    // Fetch Data
    await fetchAppsData();
    currentApp = allAppsData.find(app => app.id === appId);

    if (!currentApp) {
        showError();
        return;
    }

    // Render Content
    renderAppDetails(currentApp);

    // Hide loading, show content
    if (pageLoader) pageLoader.style.display = 'none';
    if (contentWrapper) contentWrapper.style.display = 'block';

    // Update Page Title
    document.title = `${currentApp.nameAr} - XP`;
}

function showError() {
    const pageLoader = document.getElementById('pageLoader');
    const errorState = document.getElementById('errorState');
    if (pageLoader) pageLoader.style.display = 'none';
    if (errorState) errorState.style.display = 'block';
}

function renderAppDetails(app) {
    // Update Header
    document.getElementById('appIcon').src = app.icon;
    document.getElementById('appTitle').textContent = app.nameAr;
    document.getElementById('appDescription').textContent = app.description;

    // Render Categories
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = '';

    app.packages.forEach((pkg, index) => {
        const card = createCategoryCard(pkg, app.icon, index);
        categoriesGrid.appendChild(card);
    });
}

function createCategoryCard(category, appIcon, index) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.onclick = () => selectCategory(category, index);

    // Manual price check
    const priceYER = category.priceYER ? category.priceYER.toLocaleString('ar-YE') : '---';
    const calculatedUSD = category.priceYER ? (category.priceYER / 530).toFixed(2) : '---';

    card.innerHTML = `
        <div class="category-icon">
            <img src="${appIcon}" alt="Icon">
        </div>
        <div class="category-amount">${category.amount}</div>
        <div class="category-price-yer">${priceYER} ريال</div>
        <div class="category-price">$${calculatedUSD}</div>
    `;

    return card;
}

// ==========================================
// Modal & Order Logic
// ==========================================

function selectCategory(category, index) {
    selectedCategory = category;

    // Update UI: highlight selected category
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    // Show order modal
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        // Add history state
        window.history.pushState({ modal: 'order' }, '', '#orderModal');

        orderModal.classList.add('active');
        updateSelectedInfo(category);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function hideOrderModalUI() {
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        orderModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        // Remove selection highlight
        selectedCategory = null;
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => card.classList.remove('selected'));
    }
}

function closeOrderModal() {
    window.history.back();
}

function updateSelectedInfo(category) {
    const selectedInfo = document.getElementById('selectedInfo');
    if (!selectedInfo || !currentApp) return;

    const priceYER = category.priceYER ? category.priceYER.toLocaleString('ar-YE') : '---';

    const calculatedUSD = category.priceYER ? (category.priceYER / 530).toFixed(2) : '---';

    selectedInfo.innerHTML = `
        <div class="selected-info-title">الفئة المختارة:</div>
        <div class="selected-info-details">
            ${category.amount} من ${currentApp.nameAr}
            <br>
            السعر: <span class="selected-info-price">${priceYER}</span> ر.ي / 
            <span class="selected-info-price">$${calculatedUSD}</span>
            
        </div>
    `;
}

function confirmOrder() {
    const playerIdInput = document.getElementById('playerId');
    if (!playerIdInput) return;

    const playerId = playerIdInput.value.trim();

    // Validation
    if (!playerId) {
        playerIdInput.focus();
        playerIdInput.style.borderColor = '#f5576c';

        // Simple shake effect
        playerIdInput.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });

        return;
    }

    if (!currentApp || !selectedCategory) {
        console.error('App or category not selected');
        return;
    }

    // Reset input border
    playerIdInput.style.borderColor = '';

    // Generate WhatsApp message
    const message = generateWhatsAppMessage(currentApp, selectedCategory, playerId);

    // Store message globally or in a data attribute to be used by confirmRedirect
    window.pendingWhatsappMessage = message;

    // Open Reminder Modal instead of direct link
    openReminderModal();
}


function generateWhatsAppMessage(app, category, playerId) {
    const priceYER = category.priceYER ? category.priceYER.toLocaleString('ar-YE') : '---';

    const calculatedUSD = category.priceYER ? (category.priceYER / 530).toFixed(2) : '---';

    return `مرحباً 👋

أريد طلب شحن من منصة XP

📱 التطبيق: ${app.nameAr}
💎 الفئة: ${category.amount}
💵 السعر: $${calculatedUSD} / ${priceYER} ر.ي
🆔 Player ID: ${playerId}

شكراً لكم 🙏`;
}

// ==========================================
// Theme & Shared Utilities
// ==========================================

function loadTheme() {
    let savedTheme = localStorage.getItem('xp-theme');
    if (!savedTheme) {
        savedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('xp-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
}

// calculateYER removed as irrelevant

// ==========================================
// Global Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (!header) return;
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.padding = '1rem 0';
            header.style.boxShadow = 'none';
        }
    });

    // Close salary modal logic
    const salaryModal = document.getElementById('salaryModal');
    if (salaryModal) {
        window.addEventListener('click', (event) => {
            if (event.target === salaryModal) {
                closeSalaryModal();
            }
        });
    }

    // Handle Back Button for ALL Modals
    window.addEventListener('popstate', (event) => {
        // Priority: Payment Sheet > Reminder > Order > Salary

        const paymentSheet = document.getElementById('paymentSheet');
        const reminderModal = document.getElementById('reminderModal');
        const orderModal = document.getElementById('orderModal');
        const salaryModal = document.getElementById('salaryModal');

        // Check Payment Sheet
        if (paymentSheet && paymentSheet.classList.contains('active')) {
            hidePaymentSheetUI();
            return;
        }

        // Check Reminder Modal
        if (reminderModal && reminderModal.classList.contains('active')) {
            hideReminderModalUI();
            return; // Stop here if we closed the top one
        }

        // Check Order Modal
        if (orderModal && orderModal.classList.contains('active')) {
            hideOrderModalUI();
            return;
        }

        // Check Salary Modal
        if (salaryModal && salaryModal.classList.contains('active')) {
            hideSalaryModalUI();
            return;
        }
    });

    // Page load animation
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 500);
    }
});

// ==========================================
// Payment Bottom Sheet Logic
// ==========================================

function openPaymentSheet() {
    const sheet = document.getElementById('paymentSheet');
    if (!sheet) return;

    // Add history state
    window.history.pushState({ modal: 'payment' }, '', '#payment');

    sheet.style.display = 'flex';
    // Force reflow
    sheet.offsetHeight;
    sheet.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hidePaymentSheetUI() {
    const sheet = document.getElementById('paymentSheet');
    if (!sheet) return;

    sheet.classList.remove('active');
    setTimeout(() => {
        sheet.style.display = 'none';
        document.body.style.overflow = '';
    }, 400); // Match CSS transition duration
}

function closePaymentSheet() {
    window.history.back();
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'تم ✓';
        button.style.background = '#25D366';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = 'خطأ';
        setTimeout(() => {
            button.textContent = 'نسخ';
        }, 2000);
    });
}

// ==========================================
// Tutorial Banner Logic
// ==========================================

function closeTutorialBanner() {
    const banner = document.getElementById('tutorialBanner');
    if (!banner) return;

    // Add closing animation
    banner.classList.add('closing');

    // Remove from DOM after animation
    setTimeout(() => {
        banner.remove();
    }, 400); // Match CSS animation duration

    // Save user preference in localStorage
    localStorage.setItem('xp-tutorial-banner-closed', 'true');
}

function checkTutorialBanner() {
    const bannerClosed = localStorage.getItem('xp-tutorial-banner-closed');
    const banner = document.getElementById('tutorialBanner');

    if (bannerClosed === 'true' && banner) {
        // Hide banner immediately if user closed it before
        banner.remove();
    }
}

// Check banner status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkTutorialBanner();
});
