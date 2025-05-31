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
                <img src="assets/logos/kiit_logo.png" alt="KIIT Logo" class="loader-logo kiit-logo-loader" onerror="this.style.display='none'; console.error('Failed to load KIIT preloader logo.')">
                <img src="assets/logos/iqac_logo2.png" alt="IQAC Logo" class="loader-logo iqac-logo-loader" onerror="this.style.display='none'; console.error('Failed to load IQAC preloader logo.')">
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
            smoothTouch: false, // Keep false for better control on touch devices
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
            if (anchor.dataset.lenisInitialized === 'true') return;
            anchor.dataset.lenisInitialized = 'true';
            
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1 && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const navbarHeight = document.querySelector('.navbar-custom')?.offsetHeight || 70;
                        lenis.scrollTo(targetElement, {
                            offset: -navbarHeight -20, // Added 20px more offset
                            duration: 1.5
                        });
                        // Close mobile menu if open
                        const mobileNavMenu = document.getElementById('mobile-nav-menu');
                        if (mobileNavMenu && mobileNavMenu.classList.contains('menu-open')) {
                            closeMobileMenu(); // Use a dedicated function
                        }
                    }
                }
            });
        });

    } else {
        console.warn('Lenis library not found. Falling back to basic smooth scrolling.');
        // Fallback for anchor links if Lenis is not available
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
                        const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20; // Added 20px more offset

                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                        if (document.getElementById('mobile-nav-menu')?.classList.contains('menu-open')) {
                            closeMobileMenu();
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
    initializeSmoothScroll(); // Initialize smooth scroll after header/footer might affect offset calculations

    // Fallback: If window.load somehow doesn't fire or is extremely delayed,
    // and minimum time has passed, try to hide preloader again.
    // Added a more robust check
    setTimeout(() => {
        if (!windowLoaded && minimumTimeElapsed) {
            console.warn("Window.load hasn't fired after an additional delay, but minimum time elapsed. Forcing preloader hide attempt.");
            windowLoaded = true; // Assume loaded for the purpose of hiding preloader
            attemptToHidePreloader();
        }
    }, MINIMUM_PRELOAD_TIME + 3000); // e.g., 3 seconds after minimum time
});

function closeMobileMenu() {
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuButton = document.getElementById('mobile-menu-button');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');

    if (mobileNavMenu && mobileNavMenu.classList.contains('menu-open')) {
        mobileNavMenu.classList.remove('menu-open');
        if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
        if (menuIconOpen) menuIconOpen.classList.remove('hidden');
        if (menuIconClose) menuIconClose.classList.add('hidden');
        document.body.style.overflow = '';
        lenis?.start();
        console.log("Mobile menu closed.");
    }
}

// Initialize scripts specific to the header content
function initializeHeaderSpecificScripts() {
    const navbar = document.querySelector('.navbar-custom');
    if (navbar) {
        // Set initial state
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        // Add scroll listener for 'scrolled' class, also update height var
        window.addEventListener('scroll', function() {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            // No need to call updateHeaderHeightVar() here if ResizeObserver is working,
            // as it will detect height changes from 'scrolled' class.
            // If not using ResizeObserver, you might need it here.
        }, { passive: true });
    }

    const menuButton = document.getElementById('mobile-menu-button');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');

    if (menuButton && mobileNavMenu && menuIconOpen && menuIconClose) {
        if (!menuButton.dataset.initialized) { 
            menuButton.addEventListener('click', () => {
                const isOpen = mobileNavMenu.classList.toggle('menu-open');
                menuButton.setAttribute('aria-expanded', isOpen.toString());
                menuIconOpen.classList.toggle('hidden', isOpen);
                menuIconClose.classList.toggle('hidden', !isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
                
                if (isOpen) {
                    lenis?.stop();
                    console.log("Mobile menu opened.");
                } else {
                    lenis?.start();
                    console.log("Mobile menu closed by button.");
                }
            });
            menuButton.dataset.initialized = 'true';
        }
    }

    // Desktop dropdown navigation via click
    document.querySelectorAll('.main-nav .dropdown > button.nav-link').forEach(button => {
        if (button.dataset.desktopDropdownInit) return;
        button.dataset.desktopDropdownInit = 'true';

        button.addEventListener('click', (e) => {
            const targetHref = button.dataset.targetHref;
            if (targetHref) {
                // Check if already on the target page
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                const targetPath = targetHref.split('#')[0];
                if (currentPath === targetPath && window.location.hash) {
                    // If on same page but with a hash, just let Lenis handle scroll to top or specific hash
                    // Or, if it's a main page link, navigate
                } else if (currentPath === targetPath) {
                    // Already on the page, do nothing or scroll to top if desired
                     if (lenis) lenis.scrollTo(0); else window.scrollTo(0,0);
                    return; // Avoid redundant navigation
                }
                window.location.href = targetHref;
            }
        });
    });


    const mobileDropdownToggles = document.querySelectorAll('#mobile-nav-menu .mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        if (toggle.dataset.initialized === 'true') return;
        toggle.dataset.initialized = 'true';

        toggle.addEventListener('click', function(e) {
            e.preventDefault(); // Keep this to prevent navigation if it's a button
            const content = this.nextElementSibling; // Should be the div with dropdown items
            const arrowIcon = this.querySelector('svg:last-child'); // The arrow icon

            // Close other open dropdowns
            document.querySelectorAll('#mobile-nav-menu .mobile-dropdown-content.open').forEach(openContent => {
                if (openContent !== content) {
                    openContent.classList.remove('open');
                    const otherToggle = openContent.previousElementSibling;
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        const otherArrow = otherToggle.querySelector('svg:last-child');
                        if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // Toggle current dropdown
            if (content && content.classList.contains('mobile-dropdown-content')) {
                const isOpening = content.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpening.toString());
                if (arrowIcon) {
                    arrowIcon.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });

    // Close mobile menu when a link inside it is clicked
    const mobileNavInternalLinks = document.querySelectorAll('#mobile-nav-menu a');
    mobileNavInternalLinks.forEach(link => {
        if (link.dataset.mobileLinkInit) return;
        link.dataset.mobileLinkInit = 'true';

        link.addEventListener('click', function() {
            // For anchor links on the same page, smooth scroll is handled by initializeSmoothScroll
            // For links to other pages, the menu will close naturally on page load.
            // We only need to explicitly close for same-page anchors.
            if (this.getAttribute('href').startsWith('#') || (this.getAttribute('href').includes('.html#'))) {
                 setTimeout(() => { // Timeout to allow scroll to start
                    closeMobileMenu();
                }, 100);
            } else {
                // For external links or links to different pages, allow default behavior
                // but still ensure menu closes if it was somehow kept open by browser (e.g. back button)
                // However, standard navigation will reload the page, resetting the menu.
                // If it's a link that doesn't cause a full page reload (e.g. SPA, though not the case here)
                // then explicit close would be more critical.
                // For this static site, this is mostly for same-page anchors.
            }
        });
    });


    // Active Link Highlighting
    const allNavLinks = document.querySelectorAll('.main-nav .nav-link, .main-nav .dropdown-menu a, #mobile-nav-menu .nav-link, #mobile-nav-menu .mobile-dropdown-content a');
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || !currentPage.includes('.html')) {
        currentPage = 'index.html';
    }
    const currentHash = window.location.hash;

    allNavLinks.forEach(link => {
        link.classList.remove('active'); // Reset all first
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        let linkPage = linkHref.split('/').pop().split('#')[0];
        const linkHash = linkHref.split('#')[1] || '';

        if (linkPage === '' && (linkHref.endsWith('/') || linkHref === 'index.html')) {
             linkPage = 'index.html';
        } else if (linkPage === '' && !linkHref.includes('.html') && !linkHref.startsWith('http')) {
             linkPage = linkHref + ".html"; // For hrefs like "about"
        }
        
        let isActive = (linkPage === currentPage);
        if (isActive && currentHash && linkHash) { // If on same page, also check hash for section links
            isActive = (linkHash === currentHash.substring(1));
        } else if (isActive && currentHash && !linkHash && (link.closest('.dropdown-menu') || link.closest('.mobile-dropdown-content'))) {
            // If current URL has a hash, but this specific sub-menu link doesn't,
            // don't mark it active if it's a sub-menu item, unless it's the main page link.
            // The main parent link (e.g., "About IQAC") should be active.
        } else if (isActive && !currentHash && linkHash) {
            // If current URL has no hash, but link has a hash, don't mark active unless it's the base page.
            // This case is tricky, usually the link without hash is preferred for page-level active state.
        }


        if (isActive) {
            link.classList.add('active');
            // Desktop dropdown parent
            const desktopDropdownMenu = link.closest('.dropdown-menu');
            if (desktopDropdownMenu) {
                const parentDropdownButton = desktopDropdownMenu.closest('.dropdown').querySelector('button.nav-link');
                if(parentDropdownButton) parentDropdownButton.classList.add('active');
            }
            // Mobile dropdown parent
            const mobileDropdownContent = link.closest('.mobile-dropdown-content');
            if (mobileDropdownContent) {
                const parentMobileDropdownToggle = mobileDropdownContent.previousElementSibling;
                if(parentMobileDropdownToggle && parentMobileDropdownToggle.classList.contains('mobile-dropdown-toggle')) {
                    parentMobileDropdownToggle.classList.add('active');
                }
            }
        }
    });
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
            offset: 50, // Trigger animations a bit sooner
            disable: 'mobile', // Optionally disable AOS on mobile if it causes issues
        });
        console.log("AOS initialized.");
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
        }, { passive: true }); // Use passive listener for scroll
    }

    // Back to Top Button
    const backToTopContainer = document.getElementById('back-to-top-container');
    let backToTopBtn;

    if (backToTopContainer && !document.getElementById('back-to-top-btn')) { 
        backToTopContainer.innerHTML = `
            <button id="back-to-top-btn" title="Go to top" aria-label="Scroll to top of the page" class="fixed bottom-6 right-6 bg-[var(--accent-color)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--accent-color-hover)] transition-all duration-300 opacity-0 translate-y-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color-hover)] pointer-events-none" style="z-index: 999;">
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
                backToTopBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                backToTopBtn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            } else {
                backToTopBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                backToTopBtn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            }
        };
        scrollHandler(); // Call on load
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        backToTopBtn.addEventListener('click', () => {
            if (lenis) {
                lenis.scrollTo(0, {duration: 1.5});
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Event Page Specific Logic: Filters and Modal
    if (document.getElementById('events-list')) { // Check if on events page
        initializeEventPageLogic();
    }
}

function initializeEventPageLogic() {
    const eventSearchInput = document.getElementById('eventSearch');
    const yearFilterSelect = document.getElementById('eventYearFilter');
    const typeFilterSelect = document.getElementById('eventTypeFilter');
    const eventCards = document.querySelectorAll('#events-list .event-card, #functions-activities .event-card, #quality-initiatives .info-card'); // Include all relevant cards
    const noEventsMessage = document.getElementById('no-events-message');

    function filterEvents() {
        const searchTerm = eventSearchInput ? eventSearchInput.value.toLowerCase() : '';
        const selectedYear = yearFilterSelect ? yearFilterSelect.value : 'all';
        const selectedType = typeFilterSelect ? typeFilterSelect.value : 'all';
        let visibleCount = 0;

        eventCards.forEach(card => {
            const title = card.querySelector('.event-card-title, .card-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.event-card-description, .info-card p')?.textContent.toLowerCase() || '';
            const dateText = card.querySelector('.event-card-date')?.textContent.toLowerCase() || '';
            
            const cardYear = card.dataset.eventYear;
            const cardType = card.dataset.eventType;

            const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm) || dateText.includes(searchTerm);
            const matchesYear = selectedYear === 'all' || cardYear === selectedYear;
            const matchesType = selectedType === 'all' || cardType === selectedType;

            if (matchesSearch && matchesYear && matchesType) {
                card.style.display = ''; // Or 'flex' if that's your card's display type
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noEventsMessage) {
            noEventsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    if (eventSearchInput) eventSearchInput.addEventListener('input', filterEvents);
    if (yearFilterSelect) yearFilterSelect.addEventListener('change', filterEvents);
    if (typeFilterSelect) typeFilterSelect.addEventListener('change', filterEvents);

    // Initial filter call in case of pre-filled values or to show all
    filterEvents();

    // Event Modal Logic
    const eventModal = document.getElementById('event-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalBtnBottom = document.getElementById('close-modal-btn-bottom');
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');

    // Lightbox elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    const prevLightboxBtn = document.getElementById('prev-lightbox-btn');
    const nextLightboxBtn = document.getElementById('next-lightbox-btn');
    let currentGalleryImages = [];
    let currentLightboxIndex = 0;


    // Dummy event data (replace with actual data source or fetch)
    const eventDetails = {
        event1: {
            title: "Faculty Enrichment: Digital Transformation in Pedagogy",
            date: "WORKSHOP • 22nd March 2025",
            image: "assets/images/event1_large.jpg", // Placeholder for a larger image
            description: "<p>This workshop aimed to equip faculty members with the latest digital tools and methodologies to enhance teaching effectiveness and student engagement. Sessions covered innovative e-learning platforms, AI in education, and strategies for blended learning environments. Participants engaged in hands-on activities and collaborative discussions.</p><p>Key takeaways included practical skills in utilizing digital resources, understanding data analytics for student performance, and designing interactive online courses. The event fostered a community of practice among educators committed to leveraging technology for academic excellence.</p>",
            gallery: ["assets/images/gallery/event1_pic1.jpg", "assets/images/gallery/event1_pic2.jpg", "assets/images/gallery/event1_pic3.jpg", "https://placehold.co/400x300/1fc166/ffffff?text=Gallery+4"]
        },
        event2: {
            title: "Academic Empowerment Initiative 2023-24 Launch",
            date: "INITIATIVE • 9th May 2024",
            image: "assets/images/event2_large.jpg",
            description: "<p>The inaugural ceremony of the Academic Empowerment Initiative brought together esteemed academicians, university leadership, and faculty members. This initiative focuses on a comprehensive evaluation of school-level functioning, curriculum relevance, and pedagogical innovations. </p><p>Speakers emphasized the importance of continuous quality improvement and shared insights on global best practices in higher education. The initiative aims to foster a culture of academic excellence and accountability across all departments.</p>",
            gallery: ["assets/images/gallery/event2_pic1.jpg", "https://placehold.co/400x300/00aded/ffffff?text=Gallery+2", "assets/images/gallery/event2_pic3.jpg"]
        },
         // Add more event details here...
    };

    function openModal(eventId) {
        const details = eventDetails[eventId];
        if (!details || !eventModal) return;

        document.getElementById('modal-title').textContent = details.title;
        document.getElementById('modal-date').textContent = details.date;
        const modalImage = document.getElementById('modal-image');
        modalImage.src = details.image || 'https://placehold.co/800x400/cccccc/333333?text=Event+Image';
        modalImage.alt = details.title + " main image";
        document.getElementById('modal-description').innerHTML = details.description;
        
        const galleryContainer = document.getElementById('modal-gallery');
        galleryContainer.innerHTML = ''; // Clear previous gallery
        currentGalleryImages = details.gallery || [];

        if (currentGalleryImages.length > 0) {
            currentGalleryImages.forEach((imgSrc, index) => {
                const imgButton = document.createElement('button');
                imgButton.className = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] rounded overflow-hidden group';
                imgButton.setAttribute('aria-label', `View image ${index + 1} in lightbox`);
                imgButton.onclick = () => openLightbox(index);
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = `${details.title} - Gallery Image ${index + 1}`;
                img.className = 'w-full h-32 object-cover rounded transition-transform duration-300 group-hover:scale-110';
                img.onerror = function() { this.src='https://placehold.co/400x300/cccccc/333333?text=Broken+Img'; }; // Fallback
                imgButton.appendChild(img);
                galleryContainer.appendChild(imgButton);
            });
            galleryContainer.parentElement.classList.remove('hidden');
        } else {
             galleryContainer.parentElement.classList.add('hidden'); // Hide gallery section if no images
        }


        eventModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        eventModal.classList.add('opacity-100');
        eventModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lenis?.stop();
    }

    function closeModal() {
        if (!eventModal) return;
        eventModal.classList.add('opacity-0', 'pointer-events-none');
        eventModal.classList.remove('opacity-100');
        eventModal.setAttribute('aria-hidden', 'true');
        // Delay removing hidden to allow transition
        setTimeout(() => {
            if (eventModal.classList.contains('opacity-0')) { // Check if still intended to be hidden
                 eventModal.classList.add('hidden');
            }
        }, 300);
        document.body.style.overflow = '';
        lenis?.start();
    }
    
    function openLightbox(index) {
        if (!lightbox || currentGalleryImages.length === 0) return;
        currentLightboxIndex = index;
        updateLightboxImage();
        lightbox.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        lightbox.classList.add('opacity-100');
        lightbox.setAttribute('aria-hidden', 'false');
        // Keep body overflow hidden as modal is still technically underneath
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0', 'pointer-events-none');
        lightbox.classList.remove('opacity-100');
        lightbox.setAttribute('aria-hidden', 'true');
         setTimeout(() => {
            if (lightbox.classList.contains('opacity-0')) {
                 lightbox.classList.add('hidden');
            }
        }, 300);
    }
    
    function updateLightboxImage() {
        if (!lightboxImage) return;
        lightboxImage.src = currentGalleryImages[currentLightboxIndex];
        lightboxImage.alt = `Gallery Image ${currentLightboxIndex + 1}`;
        document.getElementById('lightbox-image-alt').textContent = `Enlarged image: ${currentLightboxIndex + 1} of ${currentGalleryImages.length}`;
        
        if (prevLightboxBtn) prevLightboxBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
        if (nextLightboxBtn) nextLightboxBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
    }

    function showPrevImage() {
        currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
        updateLightboxImage();
    }

    learnMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const eventId = button.dataset.eventId;
            openModal(eventId);
        });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (closeModalBtnBottom) closeModalBtnBottom.addEventListener('click', closeModal);
    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) { // Click on backdrop
                closeModal();
            }
        });
    }
    // Lightbox event listeners
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (prevLightboxBtn) prevLightboxBtn.addEventListener('click', showPrevImage);
    if (nextLightboxBtn) nextLightboxBtn.addEventListener('click', showNextImage);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) { // Click on backdrop
                closeLightbox();
            }
        });
    }
     // Keyboard navigation for modal and lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox && !lightbox.classList.contains('hidden')) {
                closeLightbox();
            } else if (eventModal && !eventModal.classList.contains('hidden')) {
                closeModal();
            }
        }
        if (lightbox && !lightbox.classList.contains('hidden') && currentGalleryImages.length > 1) {
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        }
    });

    console.log("Event page specific logic initialized.");
}
