// script.js

// Function to load HTML content from a file into an element
async function loadHTML(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to load ${url}: ${response.status} ${response.statusText}. Check if the file exists at the correct path and is accessible.`);
            const element = document.getElementById(elementId);
            if (element) element.innerHTML = `<p style="color:red; text-align:center;">Error: Could not load content from ${url}.</p>`;
            return false;
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
            // console.log(`${url} loaded into #${elementId}`);
            return true;
        } else {
            console.error(`Element with ID #${elementId} not found.`);
            return false;
        }
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = `<p style="color:red; text-align:center;">Error: Could not load content from ${url}.</p>`;
        return false;
    }
}

// Initialize scripts specific to the header content
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

// General page initializations (run after header/footer are loaded)
function initializePageScripts() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 50,
        });
    } else {
        console.warn('AOS library not found. Animations will not work.');
    }

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
                       navHeight = currentNavbar.offsetHeight; // Simplified navHeight for dynamic content
                    }
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

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

// Main DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', async function () {
    const headerLoaded = await loadHTML('_header.html', 'header-placeholder');
    const footerLoaded = await loadHTML('_footer.html', 'footer-placeholder');

    if (headerLoaded) {
        initializeHeaderSpecificScripts();
    }
    if (footerLoaded) {
        initializeFooterSpecificScripts();
    }
    
    // Initialize general page scripts after header/footer attempt to load
    initializePageScripts();
});