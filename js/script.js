// script.js

// --- PRELOADER CONSTANTS AND STATE ---
const MINIMUM_PRELOAD_TIME = 1700; // 1.5 seconds
let windowLoaded = false;
let minimumTimeElapsed = false;

// Function to load HTML content from a file into an element
async function loadHTML(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to load ${url}: ${response.status} ${response.statusText}.`);
            const element = document.getElementById(elementId);
            if (element) element.innerHTML = `<p style="color:red; text-align:center;">Error: Could not load content from ${url}.</p>`;
            return false;
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
            return true;
        } else {
            console.error(`Element with ID #${elementId} not found for ${url}.`);
            return false;
        }
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = `<p style="color:red; text-align:center;">Error: Could not load content from ${url}.</p>`;
        return false;
    }
}

// --- PRELOADER LOGIC ---
function createPreloader() {
    if (document.getElementById('preloader')) return;
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
                    // preloader.remove(); // Optional: remove from DOM
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

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (anchor.dataset.lenisInitialized === 'true') return;
            anchor.dataset.lenisInitialized = 'true';
            
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1 && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const navbar = document.querySelector('.navbar-custom');
                        const navbarHeight = navbar ? navbar.offsetHeight : 70; 
                        lenis.scrollTo(targetElement, {
                            offset: -navbarHeight - 20, 
                            duration: 1.5
                        });
                        if (document.getElementById('mobile-nav-menu')?.classList.contains('menu-open')) {
                            closeMobileMenu();
                        }
                    }
                }
            });
        });

    } else {
        console.warn('Lenis library not found. Falling back to basic smooth scrolling.');
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (anchor.dataset.smoothScrollInitialized === 'true') return;
            anchor.dataset.smoothScrollInitialized = 'true';

            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1 && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const navbar = document.querySelector('.navbar-custom');
                        const navHeight = navbar ? navbar.offsetHeight : 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

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
createPreloader();
showPreloader();

setTimeout(() => {
    minimumTimeElapsed = true;
    console.log("Minimum preloader time elapsed.");
    attemptToHidePreloader();
}, MINIMUM_PRELOAD_TIME);

window.addEventListener('load', () => {
    windowLoaded = true;
    console.log("Window finished loading all resources.");
    attemptToHidePreloader();
});

document.addEventListener('DOMContentLoaded', async function () {
    console.log("DOMContentLoaded event fired.");

    const headerLoaded = await loadHTML('_header.html', 'header-placeholder');
    if (headerLoaded) {
        console.log("Header loaded successfully.");
        initializeHeaderSpecificScripts();
    } else {
        console.error("Header loading failed.");
    }

    const footerLoaded = await loadHTML('_footer.html', 'footer-placeholder');
    if (footerLoaded) {
        console.log("Footer loaded successfully.");
        initializeFooterSpecificScripts();
    } else {
        console.error("Footer loading failed.");
    }
    
    initializePageScripts(); 
    initializeSmoothScroll();

    setTimeout(() => {
        if (!windowLoaded && minimumTimeElapsed) {
            console.warn("Window.load fallback: Forcing preloader hide attempt.");
            windowLoaded = true; 
            attemptToHidePreloader();
        }
    }, MINIMUM_PRELOAD_TIME + 3000); 
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
        document.body.classList.remove('mobile-menu-open-style'); 
        lenis?.start();
        console.log("Mobile menu closed.");
    }
}

function initializeHeaderSpecificScripts() {
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
                
                if (isOpen) {
                    document.body.classList.add('mobile-menu-open-style');
                    lenis?.stop();
                    console.log("Mobile menu opened.");
                } else {
                    document.body.classList.remove('mobile-menu-open-style');
                    lenis?.start();
                    console.log("Mobile menu closed by button.");
                }
            });
            menuButton.dataset.initialized = 'true';
        }
    }

    document.querySelectorAll('.main-nav .dropdown > button.nav-link').forEach(button => {
        if (button.dataset.desktopDropdownInit) return;
        button.dataset.desktopDropdownInit = 'true';

        button.addEventListener('click', (e) => {
            const targetHref = button.dataset.targetHref;
            if (targetHref) {
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                const targetPath = targetHref.split('#')[0];
                if (currentPath === targetPath && !window.location.hash) { 
                     if (lenis) lenis.scrollTo(0); else window.scrollTo(0,0);
                    return; 
                }
                if (currentPath !== targetPath || targetHref.includes('#')) {
                    window.location.href = targetHref;
                }
            }
        });
    });

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
                    const otherToggle = openContent.previousElementSibling;
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        const otherArrow = otherToggle.querySelector('svg:last-child');
                        if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            if (content && content.classList.contains('mobile-dropdown-content')) {
                const isOpening = content.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpening.toString());
                if (arrowIcon) {
                    arrowIcon.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });

    const mobileNavInternalLinks = document.querySelectorAll('#mobile-nav-menu a');
    mobileNavInternalLinks.forEach(link => {
        if (link.dataset.mobileLinkInit) return;
        link.dataset.mobileLinkInit = 'true';

        link.addEventListener('click', function() {
            const href = this.getAttribute('href');
            if (href && (href.startsWith('#') || (href.includes('.html#') && window.location.pathname.endsWith(href.split('#')[0])))) {
                 setTimeout(() => { 
                    closeMobileMenu();
                }, 100);
            }
        });
    });

    const allNavLinks = document.querySelectorAll('.main-nav .nav-link, .main-nav .dropdown-menu a, #mobile-nav-menu .nav-link, #mobile-nav-menu .mobile-dropdown-content a');
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || !currentPage.includes('.html')) {
        currentPage = 'index.html';
    }
    const currentHash = window.location.hash;

    allNavLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        let linkPage = linkHref.split('/').pop().split('#')[0];
        const linkHash = linkHref.split('#')[1] || '';

        if (linkPage === '' && (linkHref.endsWith('/') || linkHref === 'index.html')) {
             linkPage = 'index.html';
        } else if (linkPage === '' && !linkHref.includes('.html') && !linkHref.startsWith('http')) {
             linkPage = linkHref + ".html"; 
        }
        
        let isActive = (linkPage === currentPage);
        if (isActive) {
            if (currentHash && linkHash) { 
                isActive = (linkHash === currentHash.substring(1));
            } else if (currentHash && !linkHash) { 
            } else if (!currentHash && linkHash) {
            }
        }

        if (isActive) {
            link.classList.add('active');
            const desktopDropdownMenu = link.closest('.dropdown-menu');
            if (desktopDropdownMenu) {
                const parentDropdownButton = desktopDropdownMenu.closest('.dropdown').querySelector('button.nav-link');
                if(parentDropdownButton) parentDropdownButton.classList.add('active');
            }
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

function initializeFooterSpecificScripts() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

function initializePageScripts() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 50,
            disable: 'mobile',
        });
        console.log("AOS initialized.");
    } else {
        console.warn('AOS library not found.');
    }

    const navbar = document.querySelector('.navbar-custom');
    if (navbar) {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        window.addEventListener('scroll', function() {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

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
        scrollHandler(); 
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        backToTopBtn.addEventListener('click', () => {
            if (lenis) {
                lenis.scrollTo(0, {duration: 1.5});
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (document.getElementById('events-list')) {
        initializeEventPageLogic();
    }

    if (document.getElementById('central-team-container') || 
        document.getElementById('advisory-team-container') ||
        document.getElementById('fic-team-container')) {
        loadTeamData(); // This function is now updated
    }
}

// --- Functions for loading team data on about.html (Updated for separate files) ---
async function loadTeamData() {
    // Load Central Team Data
    try {
        const response = await fetch('assets/data/centraliqac.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for centraliqac.json`);
        }
        const centralTeamMembers = await response.json();
        populateCentralTeam(centralTeamMembers);
    } catch (error) {
        console.error("Could not load Central Team data:", error);
        const centralTeamContainer = document.getElementById('central-team-container');
        if (centralTeamContainer) centralTeamContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Failed to load Central Team data. Please check console.</p>';
    }

    // Load Advisory Team Data
    try {
        const response = await fetch('assets/data/advisory.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for advisory.json`);
        }
        const advisoryTeamMembers = await response.json();
        populateAdvisoryTeam(advisoryTeamMembers);
    } catch (error) {
        console.error("Could not load Advisory Team data:", error);
        const advisoryTeamContainer = document.getElementById('advisory-team-container');
        if (advisoryTeamContainer) advisoryTeamContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load Advisory Team data. Please check console.</p>';
    }

    // Load FIC Team Data
    try {
        const response = await fetch('assets/data/ficiqac.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ficiqac.json`);
        }
        const ficTeamMembers = await response.json();
        populateFicTeam(ficTeamMembers);
    } catch (error) {
        console.error("Could not load FIC Team data:", error);
        const ficTeamContainer = document.getElementById('fic-team-container');
        if (ficTeamContainer) ficTeamContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load FIC Team data. Please check console.</p>';
    }
}


function populateCentralTeam(members) {
    const container = document.getElementById('central-team-container');
    if (!container || !members) {
        if(container) container.innerHTML = '<p class="text-orange-500 text-center col-span-full">Central team data is missing or container not found.</p>';
        return;
    }
    container.innerHTML = ''; 

    if (members.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No Central Team members to display.</p>';
        return;
    }

    members.forEach(member => {
        const card = `
            <article class="team-card" data-aos="fade-up" data-aos-delay="100">
                <figure>
                    <img src="${member.image}" alt="${member.alt || member.name}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x300/cccccc/333333?text=Photo';">
                    <figcaption class="sr-only">Photo of ${member.name}</figcaption>
                </figure>
                <div class="team-card-content">
                    <h4 class="team-card-name">${member.name}</h4>
                    <p class="team-card-designation">${member.designation}</p>
                </div>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function populateAdvisoryTeam(members) {
    const container = document.getElementById('advisory-team-container');
    if (!container || !members) {
        if(container) container.innerHTML = '<p class="text-orange-500 text-center">Advisory team data is missing or container not found.</p>';
        return;
    }
    
    if (members.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No Advisory Team members to display.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'responsive-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Title/Department</th>
                <th>Role in IQAC</th>
                <th>Email</th>
                <th>Phone Number</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');
    members.forEach(member => {
        const row = `
            <tr>
                <td data-label="Name">${member.name}</td>
                <td data-label="Title/Dept">${member.title}</td>
                <td data-label="Role">${member.role}</td>
                <td data-label="Email"><a href="mailto:${member.email}" class="break-all">${member.email}</a></td>
                <td data-label="Phone"><a href="tel:${member.phone}">${member.phone}</a></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
    container.innerHTML = ''; 
    container.appendChild(table);
}

function populateFicTeam(members) {
    const container = document.getElementById('fic-team-container');
     if (!container || !members) {
        if(container) container.innerHTML = '<p class="text-orange-500 text-center">FIC team data is missing or container not found.</p>';
        return;
    }

    if (members.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No FIC Team members to display.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'responsive-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>School / Department</th>
                <th>Faculty-in-Charge (FIC)</th>
                <th>Contact Number</th>
                <th>Email Address</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');
    members.forEach(member => {
        const row = `
            <tr>
                <td data-label="School/Dept">${member.school}</td>
                <td data-label="FIC Name">${member.ficName}</td>
                <td data-label="Contact"><a href="tel:${member.phone}">${member.phone}</a></td>
                <td data-label="Email"><a href="mailto:${member.email}" class="break-all">${member.email}</a></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
    container.innerHTML = ''; 
    container.appendChild(table);
}


// --- Event Page Specific Logic ---
function initializeEventPageLogic() {
    const eventSearchInput = document.getElementById('eventSearch');
    const yearFilterSelect = document.getElementById('eventYearFilter');
    const typeFilterSelect = document.getElementById('eventTypeFilter');
    const eventCards = document.querySelectorAll('#events-list .event-card, #functions-activities .event-card, #quality-initiatives .info-card');
    const noEventsMessage = document.getElementById('no-events-message');

    function filterEvents() {
        const searchTerm = eventSearchInput ? eventSearchInput.value.toLowerCase() : '';
        const selectedYear = yearFilterSelect ? yearFilterSelect.value : 'all';
        const selectedType = typeFilterSelect ? typeFilterSelect.value : 'all';
        let visibleCount = 0;

        eventCards.forEach(card => {
            const title = card.querySelector('.event-card-title, .card-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.event-card-description, .info-card p:not(.event-card-date)')?.textContent.toLowerCase() || '';
            const dateText = card.querySelector('.event-card-date')?.textContent.toLowerCase() || '';
            
            const cardYear = card.dataset.eventYear;
            const cardType = card.dataset.eventType;

            const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm) || dateText.includes(searchTerm);
            const matchesYear = selectedYear === 'all' || !cardYear || cardYear === selectedYear;
            const matchesType = selectedType === 'all' || !cardType || cardType === selectedType;

            if (matchesSearch && matchesYear && matchesType) {
                card.style.display = ''; 
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

    filterEvents();

    const eventModal = document.getElementById('event-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalBtnBottom = document.getElementById('close-modal-btn-bottom');
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    const prevLightboxBtn = document.getElementById('prev-lightbox-btn');
    const nextLightboxBtn = document.getElementById('next-lightbox-btn');
    let currentGalleryImages = [];
    let currentLightboxIndex = 0;

    const eventDetails = {
        event1: {
            title: "Faculty Enrichment: Digital Transformation in Pedagogy",
            date: "WORKSHOP • 22nd March 2025",
            image: "assets/images/event1_large.jpg",
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
        event3: {
            title: "Viksit Bharat@2047 Initiatives Series",
            date: "SERIES OF EVENTS • 31st Mar – 8th Apr 2024",
            image: "assets/images/event3_large.jpg",
            description: "<p>KIIT IQAC proudly organized a series of nine impactful events under the Viksit Bharat@2047 banner. These initiatives, including workshops, seminars, and interactive sessions, were designed to foster awareness and dialogue on India's developmental goals leading up to 2047. Faculty, students, and experts participated in discussions covering technology, sustainability, education, and economic growth, contributing to a collective vision for a developed India.</p>",
            gallery: ["https://placehold.co/400x300/223d51/e4edf2?text=VB+Event+1", "https://placehold.co/400x300/1fc166/ffffff?text=VB+Event+2", "https://placehold.co/400x300/00aded/ffffff?text=VB+Event+3"]
        },
        event4: {
            title: "K-I3 Fest: Frontier Technologies Project Expo",
            date: "PROJECT EXPO • 6th December 2023",
            image: "assets/images/ki3_large.jpg",
            description: "<p>The K-I3 Fest, a collaborative effort by Dean's Gold Klub & IQAC, showcased a vibrant array of innovative student projects focusing on frontier technologies. This project expo provided a platform for students to demonstrate their technical skills, creativity, and problem-solving abilities in areas like AI, IoT, robotics, and sustainable tech. The event was a testament to KIIT's commitment to fostering an innovation-driven academic environment.</p>",
            gallery: ["https://placehold.co/400x300/E4EDF2/333333?text=KI3+Project+1", "https://placehold.co/400x300/223d51/ffffff?text=KI3+Project+2"]
        },
        activity1: {
            title: "Seminar on NEP 2020 Implementation Strategies",
            date: "SEMINAR • 15th July 2024",
            image: "https://placehold.co/800x400/223d51/e4edf2?text=NEP+Seminar+Large",
            description: "<p>This seminar focused on the practical aspects of implementing the National Education Policy (NEP) 2020 at KIIT. Discussions revolved around curriculum restructuring, multidisciplinary approaches, integration of vocational education, and assessment reforms. Experts shared insights on challenges and best practices for a smooth transition, aiming to align KIIT's educational framework with the transformative goals of NEP 2020.</p>",
            gallery: []
        },
        activity2: {
            title: "IQAC Review Meeting with Stakeholders",
            date: "MEETING • 10th October 2023",
            image: "https://placehold.co/800x400/1fc166/ffffff?text=IQAC+Meeting+Large",
            description: "<p>The annual IQAC Review Meeting brought together internal and external stakeholders, including faculty, students, alumni, and industry representatives. The meeting served as a platform to discuss the progress of quality assurance initiatives, review feedback, and strategize for future enhancements. Key outcomes included actionable recommendations for academic and administrative improvements, reinforcing KIIT's commitment to transparency and continuous development.</p><p>Minutes of the meeting are available for internal review via the university portal.</p>",
            gallery: ["https://placehold.co/400x300/cccccc/333333?text=Meeting+Pic+1", "https://placehold.co/400x300/aaaaaa/444444?text=Meeting+Pic+2"]
        },
        activity3: {
            title: "Faculty Training on Outcome-Based Education (OBE) Portal",
            date: "TRAINING • 5th February 2024",
            image: "https://placehold.co/800x400/00aded/ffffff?text=OBE+Training+Large",
            description: "<p>A hands-on training session was conducted for faculty members on effectively utilizing the new Outcome-Based Education (OBE) portal. The training covered defining course outcomes, mapping them to program outcomes, designing assessments aligned with OBE principles, and generating attainment reports. This initiative aims to streamline the OBE process and enhance the quality of academic delivery and assessment across all programs.</p><p>Training materials and portal access details have been shared with all faculty members.</p>",
            gallery: ["https://placehold.co/400x300/E4EDF2/333333?text=OBE+Session+1", "https://placehold.co/400x300/223d51/ffffff?text=OBE+Session+2", "https://placehold.co/400x300/17d059/ffffff?text=OBE+Session+3"]
        }
    };

    function openModal(eventId) {
        const details = eventDetails[eventId];
        if (!details || !eventModal) {
            console.warn("Event details not found for ID:", eventId, "or modal element missing.");
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) modalTitle.textContent = "Event Details Not Available";
            document.getElementById('modal-description').innerHTML = "<p>Sorry, the details for this event could not be loaded at this time.</p>";
            document.getElementById('modal-image').src = 'https://placehold.co/800x400/cccccc/333333?text=Error';
            document.getElementById('modal-date').textContent = "";
            document.getElementById('modal-gallery').innerHTML = "";
            eventModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
            eventModal.classList.add('opacity-100');
            eventModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('mobile-menu-open-style');
            lenis?.stop();
            return;
        }

        document.getElementById('modal-title').textContent = details.title;
        document.getElementById('modal-date').textContent = details.date;
        const modalImageEl = document.getElementById('modal-image');
        modalImageEl.src = details.image || 'https://placehold.co/800x400/cccccc/333333?text=Event+Image';
        modalImageEl.alt = details.title + " main image";
        modalImageEl.onerror = function() { this.src='https://placehold.co/800x400/cccccc/333333?text=Image+Error'; };
        document.getElementById('modal-description').innerHTML = details.description;
        
        const galleryContainer = document.getElementById('modal-gallery');
        galleryContainer.innerHTML = ''; 
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
                img.onerror = function() { this.src='https://placehold.co/400x300/cccccc/333333?text=Broken+Img'; };
                imgButton.appendChild(img);
                galleryContainer.appendChild(imgButton);
            });
            galleryContainer.closest('div').classList.remove('hidden');
        } else {
             galleryContainer.closest('div').classList.add('hidden'); 
        }

        eventModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        eventModal.classList.add('opacity-100');
        eventModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('mobile-menu-open-style');
        lenis?.stop();
    }

    function closeModal() {
        if (!eventModal) return;
        eventModal.classList.add('opacity-0', 'pointer-events-none');
        eventModal.classList.remove('opacity-100');
        eventModal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            if (eventModal.classList.contains('opacity-0')) {
                 eventModal.classList.add('hidden');
            }
        }, 300);
        document.body.classList.remove('mobile-menu-open-style');
        lenis?.start();
    }
    
    function openLightbox(index) {
        if (!lightbox || currentGalleryImages.length === 0) return;
        currentLightboxIndex = index;
        updateLightboxImage();
        lightbox.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        lightbox.classList.add('opacity-100');
        lightbox.setAttribute('aria-hidden', 'false');
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
        lightboxImage.onerror = function() { this.src='https://placehold.co/800x600/cccccc/333333?text=Image+Load+Error'; this.alt='Error loading image';};
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
            if (e.target === eventModal) { 
                closeModal();
            }
        });
    }
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (prevLightboxBtn) prevLightboxBtn.addEventListener('click', showPrevImage);
    if (nextLightboxBtn) nextLightboxBtn.addEventListener('click', showNextImage);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) { 
                closeLightbox();
            }
        });
    }
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
