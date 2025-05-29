// script.js

// --- PRELOADER CONSTANTS AND STATE ---
const MINIMUM_PRELOAD_TIME = 1500; // 1.5 seconds
const preloaderStartTime = Date.now();
let windowLoaded = false;
let minimumTimeElapsed = false;

// Function to load HTML content from a file into an element
async function loadHTML(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to load ${url}: ${response.status} ${response.statusText}. Check if the file exists at the correct path and is accessible. This might affect page layout or functionality but should not block preloader hiding.`);
            const element = document.getElementById(elementId);
            if (element) element.innerHTML = `<p style="color:red; text-align:center;">Error: Could not load content from ${url}.</p>`;
            return false; // Indicate failure
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
            return true; // Indicate success
        } else {
            console.error(`Element with ID #${elementId} not found for ${url}.`);
            return false; // Indicate failure
        }
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = `<p style="color:red; text-align:center;">Error: Could not load content from ${url}.</p>`;
        return false; // Indicate failure
    }
}

// --- PRELOADER LOGIC ---
function createPreloader() {
    if (document.getElementById('preloader')) return; // Avoid creating if already exists
    const preloaderHTML = `
        <div id="preloader">
          <div class="loader-content">
            <div class="loader-logo-container">
                <img src="assets/logos/kiit_logo.png" alt="KIIT Logo" class="loader-logo kiit-logo-loader" onerror="this.style.display='none'">
                <img src="assets/logos/iqac_logo2.png" alt="IQAC Logo" class="loader-logo iqac-logo-loader" onerror="this.style.display='none'">
            </div>
            <p class="loader-text">Quality Assured, Future Secured.</p>
            <div class="loader-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.remove('preloader-hidden');
        document.body.classList.add('loading-active');
    }
}

function attemptToHidePreloader() {
    if (windowLoaded && minimumTimeElapsed) {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('preloader-hidden')) {
            preloader.classList.add('preloader-hidden');
            document.body.classList.remove('loading-active');
            console.log("Preloader hidden.");
            // Optional: remove preloader from DOM after transition
            preloader.addEventListener('transitionend', () => {
                if (preloader.classList.contains('preloader-hidden')) {
                    // preloader.remove(); // Uncomment if you want to remove it completely
                }
            }, { once: true });
        }
    }
}

// --- LENIS SMOOTH SCROLL ---
let lenis;
function initializeSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        console.log("Lenis smooth scroll initialized.");

        // Handle anchor links with Lenis
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (anchor.dataset.lenisInitialized) return; // Prevent re-initialization
            anchor.dataset.lenisInitialized = 'true';
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1 && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const navbarHeight = document.querySelector('.navbar-custom')?.offsetHeight || 70;
                        lenis.scrollTo(targetElement, {
                            offset: -navbarHeight - 20,
                            duration: 1.5
                        });
                        // Close mobile menu if open
                        const mobileNavMenu = document.getElementById('mobile-nav-menu');
                        const menuIconOpen = document.getElementById('menu-icon-open');
                        const menuIconClose = document.getElementById('menu-icon-close');
                        if (mobileNavMenu && mobileNavMenu.classList.contains('menu-open')) {
                            mobileNavMenu.classList.remove('menu-open');
                            if(menuIconOpen) menuIconOpen.classList.remove('hidden');
                            if(menuIconClose) menuIconClose.classList.add('hidden');
                            document.body.style.overflow = '';
                            lenis?.start(); // Restart lenis if menu was open
                        }
                    }
                }
            });
        });

    } else {
        console.warn('Lenis library not found. Falling back to basic smooth scrolling.');
        // Fallback for anchor links if Lenis is not available (same as old script)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (anchor.dataset.smoothScrollInitialized === 'true') return;
            anchor.dataset.smoothScrollInitialized = 'true';

            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1 && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        let navHeight = 70;
                        const currentNavbar = document.querySelector('.navbar-custom');
                        if (currentNavbar) {
                           navHeight = currentNavbar.offsetHeight;
                        }
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                        // Close mobile menu if open
                        const mobileNavMenu = document.getElementById('mobile-nav-menu');
                        const menuIconOpen = document.getElementById('menu-icon-open');
                        const menuIconClose = document.getElementById('menu-icon-close');
                        if (mobileNavMenu && mobileNavMenu.classList.contains('menu-open')) {
                            mobileNavMenu.classList.remove('menu-open');
                            if(menuIconOpen) menuIconOpen.classList.remove('hidden');
                            if(menuIconClose) menuIconClose.classList.add('hidden');
                            document.body.style.overflow = '';
                        }
                    }
                }
            });
        });
    }
}

// --- SCRIPT INITIALIZATION ---

// 1. Create and show preloader immediately
createPreloader();
showPreloader();

// 2. Set up timer for minimum preloader display time
setTimeout(() => {
    minimumTimeElapsed = true;
    console.log("Minimum preloader time elapsed.");
    attemptToHidePreloader();
}, MINIMUM_PRELOAD_TIME);

// 3. Set up window.load listener to hide preloader
window.addEventListener('load', () => {
    windowLoaded = true;
    console.log("Window finished loading all resources.");
    attemptToHidePreloader();
});

// 4. DOMContentLoaded for other initializations
document.addEventListener('DOMContentLoaded', async function () {
    console.log("DOMContentLoaded event fired.");

    const headerLoaded = await loadHTML('_header.html', 'header-placeholder');
    if (headerLoaded) {
        console.log("Header loaded successfully.");
        initializeHeaderSpecificScripts();
    } else {
        console.error("Header loading failed. Some functionalities might be affected.");
    }

    const footerLoaded = await loadHTML('_footer.html', 'footer-placeholder');
    if (footerLoaded) {
        console.log("Footer loaded successfully.");
        initializeFooterSpecificScripts();
    } else {
        console.error("Footer loading failed. Some functionalities might be affected.");
    }
    
    initializePageScripts(); 
    initializeSmoothScroll();

    // Fallback: If window.load somehow doesn't fire or is extremely delayed,
    // and minimum time has passed, try to hide preloader again.
    if (!windowLoaded && minimumTimeElapsed) {
        console.warn("Window.load hasn't fired, but minimum time elapsed. Attempting to hide preloader as a fallback.");
        windowLoaded = true; // Assume loaded for the purpose of hiding preloader
        attemptToHidePreloader();
    }
});

// Initialize scripts specific to the header content (SIMPLIFIED - OLD VERSION)
function initializeHeaderSpecificScripts() {
    const navbar = document.querySelector('.navbar-custom');
    if (navbar) {
        if (window.scrollY > 30) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }

    const menuButton = document.getElementById('mobile-menu-button');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');

    if (menuButton && mobileNavMenu && menuIconOpen && menuIconClose) {
        if (!menuButton.dataset.initialized) { // Avoid duplicate listeners
            menuButton.addEventListener('click', () => {
                const isOpen = mobileNavMenu.classList.toggle('menu-open');
                menuIconOpen.classList.toggle('hidden', isOpen);
                menuIconClose.classList.toggle('hidden', !isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
                
                // Stop/start Lenis when mobile menu opens/closes
                if (isOpen) {
                    lenis?.stop();
                } else {
                    lenis?.start();
                }
            });
            menuButton.dataset.initialized = 'true';
        }
    }

    const mobileDropdownToggles = document.querySelectorAll('#mobile-nav-menu .mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        if (toggle.dataset.initialized === 'true') return;
        toggle.dataset.initialized = 'true';

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.nextElementSibling;
            const arrowIcon = this.querySelector('svg:last-child');

            document.querySelectorAll('#mobile-nav-menu .mobile-dropdown-content.open').forEach(openContent => {
                if (openContent !== content) {
                    openContent.classList.remove('open');
                    const otherArrow = openContent.previousElementSibling.querySelector('svg:last-child');
                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                }
            });
            
            if (content) {
                content.classList.toggle('open');
                if (arrowIcon) {
                    arrowIcon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });

    // SIMPLIFIED ACTIVE LINK DETECTION (OLD VERSION)
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const mobileNavLinksFromMenu = document.querySelectorAll('#mobile-nav-menu .nav-link');
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || !currentPage.includes('.html')) { // Handle root or clean URLs
        currentPage = 'index.html';
    }

    function setActiveLink(links) {
        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref || linkHref === '#') return;

            let linkPage = linkHref.split('/').pop().split('#')[0];
             if (linkPage === '' && linkHref.endsWith('/')) { // Handle root link like "index.html" from href="/"
                 linkPage = 'index.html';
             } else if (linkPage === '' && !linkHref.includes('.html') && !linkHref.startsWith('http')) { // For cases like href="about"
                 linkPage = linkHref + ".html";
             }

            if (linkPage === currentPage) {
                link.classList.add('active');
                // Desktop dropdown parent
                const desktopDropdown = link.closest('.dropdown-menu');
                if (desktopDropdown) {
                    const parentDropdownLink = desktopDropdown.closest('.dropdown').querySelector('a.nav-link.flex');
                    if(parentDropdownLink) parentDropdownLink.classList.add('active');
                }
                // Mobile dropdown parent
                const mobileDropdown = link.closest('.mobile-dropdown-content');
                if (mobileDropdown) {
                    const parentMobileDropdownToggle = mobileDropdown.previousElementSibling;
                    if(parentMobileDropdownToggle) parentMobileDropdownToggle.classList.add('active');
                }
            } else {
                link.classList.remove('active');
            }
        });
    }
    setActiveLink(navLinks);
    setActiveLink(mobileNavLinksFromMenu);
}

// Initialize scripts specific to the footer content
function initializeFooterSpecificScripts() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

// General page initializations
function initializePageScripts() {
    // AOS Animation Library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 50,
        });
    } else {
        console.warn('AOS library not found. Animations will not work.');
    }

    // Navbar scroll behavior
    const navbar = document.querySelector('.navbar-custom');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Back to Top Button (NEW FEATURE)
    const backToTopContainer = document.getElementById('back-to-top-container');
    let backToTopBtn;
    if (backToTopContainer && !document.getElementById('back-to-top-btn')) { 
        backToTopContainer.innerHTML = `
            <button id="back-to-top-btn" title="Go to top" aria-label="Scroll to top of the page" class="fixed bottom-6 right-6 bg-[var(--accent-color)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--accent-color-hover)] transition-all duration-300 opacity-0 translate-y-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color-hover)]" style="z-index: 999;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
            </button>
        `;
        backToTopBtn = document.getElementById('back-to-top-btn');
    } else {
        backToTopBtn = document.getElementById('back-to-top-btn');
    }
    
    if (backToTopBtn) {
        const scrollHandler = () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('opacity-100', 'translate-y-0', 'visible');
                backToTopBtn.classList.remove('opacity-0', 'translate-y-4');
            } else {
                backToTopBtn.classList.remove('opacity-100', 'translate-y-0', 'visible');
                backToTopBtn.classList.add('opacity-0', 'translate-y-4');
            }
        };
        scrollHandler();
        window.addEventListener('scroll', scrollHandler);
        
        backToTopBtn.addEventListener('click', () => {
            if (lenis) {
                lenis.scrollTo(0, {duration: 1.5});
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Simple Year Filter (OLD VERSION)
    const yearFilter = document.getElementById('eventYearFilter');
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            const selectedYear = this.value;
            const eventCards = document.querySelectorAll('.event-card[data-event-year]');
            eventCards.forEach(card => {
                const cardYear = card.getAttribute('data-event-year');
                if (selectedYear === "all" || cardYear === selectedYear) {
                    card.style.display = ''; // Reset to default CSS display
                } else {
                    card.style.display = 'none';
                }
            });
        });
        // Trigger change on load if a year is pre-selected or to show all
        if(yearFilter.value !== 'all') {
             yearFilter.dispatchEvent(new Event('change'));
        }
    }
}