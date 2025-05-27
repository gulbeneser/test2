// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNavigation = document.getElementById('mainNavigation');
    
    if (mobileMenuToggle && mainNavigation) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNavigation.classList.toggle('is-active');
            
            // Update button icon and aria-label
            const isOpen = mainNavigation.classList.contains('is-active');
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Menüyü Kapat' : 'Menü');
            
            // Change hamburger icon to X when open
            const svg = mobileMenuToggle.querySelector('svg');
            if (isOpen) {
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
            } else {
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
            }
        });
        
        // Close mobile menu when clicking on navigation links
        const navLinks = mainNavigation.querySelectorAll('.new-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNavigation.classList.remove('is-active');
                mobileMenuToggle.setAttribute('aria-label', 'Menü');
                
                // Reset hamburger icon
                const svg = mobileMenuToggle.querySelector('svg');
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = mainNavigation.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && mainNavigation.classList.contains('is-active')) {
                mainNavigation.classList.remove('is-active');
                mobileMenuToggle.setAttribute('aria-label', 'Menü');
                
                // Reset hamburger icon
                const svg = mobileMenuToggle.querySelector('svg');
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
            }
        });
    }
    
    // Enhanced touch interactions for mobile
    if (window.innerWidth <= 768) {
        // Add touch feedback for buttons
        const buttons = document.querySelectorAll('button, .product-action-button, .tab-link');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.opacity = '0.8';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
        });
        
        // Improve carousel touch interactions
        const carousel = document.getElementById('relatedProductsContainer');
        if (carousel) {
            let isScrolling = false;
            
            carousel.addEventListener('touchstart', function() {
                isScrolling = true;
            });
            
            carousel.addEventListener('touchend', function() {
                setTimeout(() => {
                    isScrolling = false;
                }, 100);
            });
            
            // Prevent card clicks during scrolling
            const cards = carousel.querySelectorAll('.related-product-card');
            cards.forEach(card => {
                card.addEventListener('click', function(e) {
                    if (isScrolling) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
        }
        
        // Improve tab navigation on mobile
        const tabsNavigation = document.querySelector('.tabs-navigation');
        if (tabsNavigation) {
            // Ensure active tab is visible on mobile
            const activeTab = tabsNavigation.querySelector('.tab-link.active');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            // Close mobile menu on orientation change
            if (mainNavigation && mainNavigation.classList.contains('is-active')) {
                mainNavigation.classList.remove('is-active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.setAttribute('aria-label', 'Menü');
                    const svg = mobileMenuToggle.querySelector('svg');
                    if (svg) {
                        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
                    }
                }
            }
            
            // Recalculate any layout dependent elements
            const tabs = document.querySelector('.tabs-navigation');
            if (tabs) {
                tabs.scrollLeft = 0;
            }
        }, 500);
    });
    
    // Improve image loading on mobile
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.textContent = 'Görsel Yüklenemedi';
            this.parentNode.insertBefore(placeholder, this.nextSibling);
        });
    });
    
    // Add smooth scrolling behavior for mobile
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Prevent zoom on input focus (iOS Safari)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('touchstart', function() {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        });
        
        input.addEventListener('blur', function() {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });
    });
});

// Enhanced scroll functionality for carousel on mobile
function scrollCarousel(direction) {
    const container = document.getElementById('relatedProductsContainer');
    if (!container) return;
    
    const cardWidth = 220; // Base card width
    const gap = 16; // Gap between cards
    const scrollAmount = cardWidth + gap;
    
    // Adjust scroll amount for mobile
    if (window.innerWidth <= 480) {
        const mobileScrollAmount = 180 + gap; // Mobile card width + gap
        if (direction === 'left') {
            container.scrollBy({ left: -mobileScrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: mobileScrollAmount, behavior: 'smooth' });
        }
    } else {
        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
}

// Add swipe gesture support for mobile
function addSwipeSupport() {
    const carousel = document.getElementById('relatedProductsContainer');
    if (!carousel) return;
    
    let startX = null;
    let scrollLeft = null;
    
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        scrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('touchmove', function(e) {
        if (!startX) return;
        
        const x = e.touches[0].clientX;
        const diff = startX - x;
        carousel.scrollLeft = scrollLeft + diff;
    });
    
    carousel.addEventListener('touchend', function() {
        startX = null;
        scrollLeft = null;
    });
}

// Initialize swipe support when DOM is loaded
document.addEventListener('DOMContentLoaded', addSwipeSupport);

// Debounced resize handler for better performance
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Handle any resize-specific logic here
        const tabs = document.querySelector('.tabs-navigation');
        if (tabs && window.innerWidth <= 768) {
            tabs.scrollLeft = 0;
        }
    }, 250);
});
