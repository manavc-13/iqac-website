// script.js

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 700,
    once: true, // Animation happens only once
    offset: 50, // Trigger animations a bit sooner
});

document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar-custom');
    const navbarHeight = navbar ? navbar.offsetHeight : 70; // Default height if navbar not found early

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');

    if (menuButton && mobileNavMenu && menuIconOpen && menuIconClose) {
        menuButton.addEventListener('click', () => {
            const isOpen = mobileNavMenu.classList.toggle('menu-open');
            menuIconOpen.classList.toggle('hidden', isOpen);
            menuIconClose.classList.toggle('hidden', !isOpen);
            // Toggle body scroll based on menu state
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // Mobile dropdown toggle
    const mobileDropdownToggles = document.querySelectorAll('#mobile-nav-menu .mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent navigation for the toggle itself
            const content = this.nextElementSibling;
            const arrowIcon = this.querySelector('svg:last-child');

            // Close other open dropdowns in mobile menu
            document.querySelectorAll('#mobile-nav-menu .mobile-dropdown-content.open').forEach(openContent => {
                if (openContent !== content) {
                    openContent.classList.remove('open');
                    const otherArrow = openContent.previousElementSibling.querySelector('svg:last-child');
                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current dropdown
            if (content) {
                content.classList.toggle('open');
                if (arrowIcon) {
                    arrowIcon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });
    
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Smooth scroll for anchor links & close mobile menu
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's a valid on-page anchor
            if (href.length > 1 && href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const navHeight = navbar && navbar.classList.contains('scrolled') ? (navbar.offsetHeight * 0.9) : (navbar ? navbar.offsetHeight : 70);
                    const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // If mobile menu is open, close it
                if (mobileNavMenu && mobileNavMenu.classList.contains('menu-open')) {
                    mobileNavMenu.classList.remove('menu-open');
                    if(menuIconOpen) menuIconOpen.classList.remove('hidden');
                    if(menuIconClose) menuIconClose.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // Active Navbar Link Highlighting
    const navLinks = document.querySelectorAll('.main-nav .nav-link'); // For desktop
    const mobileNavLinks = document.querySelectorAll('#mobile-nav-menu .nav-link'); // For mobile
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Get current page filename

    function setActiveLink(links) {
        links.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop().split('#')[0]; // Get filename from link href
            if (linkPage === currentPage) {
                link.classList.add('active');
                // For dropdown parents, also activate the main dropdown link
                if (link.closest('.dropdown-menu')) {
                    link.closest('.dropdown').querySelector('.nav-link').classList.add('active');
                }
                 if (link.closest('.mobile-dropdown-content')) {
                    link.closest('div').previousElementSibling.classList.add('active'); // a.mobile-dropdown-toggle
                }
            } else {
                link.classList.remove('active');
            }
        });
    }
    setActiveLink(navLinks);
    setActiveLink(mobileNavLinks);


    // Running Strip Animation Logic (if pure CSS is not enough or needs control)
    // The CSS animation should handle this, but JS can be used for dynamic content loading or complex controls.
    // For now, relying on CSS for the marquee.

    // Placeholder for Events & Gallery year wise dropdown filter if needed on other pages
    const yearFilter = document.getElementById('eventYearFilter');
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            const selectedYear = this.value;
            console.log("Filtering events for year:", selectedYear);
            // Add logic here to filter and display events/gallery items for the selectedYear
            // This will involve selecting event cards, checking their date/year, and toggling visibility.
            // Example:
            // const eventCards = document.querySelectorAll('.event-card');
            // eventCards.forEach(card => {
            //     const eventDate = card.dataset.eventDate; // Assuming you add data-event-date="YYYY-MM-DD" to your cards
            //     if (selectedYear === "all" || (eventDate && eventDate.startsWith(selectedYear))) {
            //         card.style.display = 'flex'; // Or your default display type
            //     } else {
            //         card.style.display = 'none';
            //     }
            // });
        });
    }

});
