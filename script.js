/* ============================================
   CYKE L16TT Landing Page JavaScript
   Facebook Pixel Events & Interactions
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    pixelId: '1181849205765522', // Thay bằng Facebook Pixel ID của bạn
    // Pixel chuyển đổi riêng cho đơn hàng thành công (tùy chọn)
    conversionPixelId: '1181849205765522',
    productName: 'Gay Chup Anh CYKE L16TT',
    productCategory: 'Camera Accessories',
    productPrice: 399000,
    currency: 'VND',
    zaloNumber: '0568977888',
    hotline: '0568977888',
    // Google Sheets Integration
    googleSheetUrl: 'https://script.google.com/macros/s/AKfycbzp887h_Zf2HSs01a0tCzFOp9eki7EHGM9Y3E6uIJDgd9bANhOW7_7ePz8cCnYW-Sg9bQ/exec'
};

// ============================================
// FACEBOOK PIXEL EVENTS
// ============================================

// ViewContent - Gọi khi page load
function trackViewContent() {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_name: CONFIG.productName,
            content_category: CONFIG.productCategory,
            value: CONFIG.productPrice,
            currency: CONFIG.currency
        });
        console.log('📊 Facebook Pixel: ViewContent tracked');
    }
}

// AddToCart - Gọi khi click nút CTA
function trackAddToCart() {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_name: CONFIG.productName,
            content_type: 'product',
            value: CONFIG.productPrice,
            currency: CONFIG.currency
        });
        console.log('🛒 Facebook Pixel: AddToCart tracked');
    }
}

// InitiateCheckout - Gọi khi bắt đầu điền form
function trackInitiateCheckout() {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            content_name: CONFIG.productName,
            value: CONFIG.productPrice,
            currency: CONFIG.currency,
            num_items: 1
        });
        console.log('📝 Facebook Pixel: InitiateCheckout tracked');
    }
}

// Purchase - Gọi khi submit form thành công
function trackPurchase(quantity, totalValue) {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            content_name: CONFIG.productName,
            content_type: 'product',
            value: totalValue,
            currency: CONFIG.currency,
            num_items: quantity
        });
        console.log('💰 Facebook Pixel: Purchase tracked - Value:', totalValue);
    }
}

// ============================================
// COUNTDOWN TIMER
// ============================================

function initCountdown() {
    // Đặt thời gian kết thúc (ví dụ: 3 ngày từ bây giờ)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(23, 59, 59, 0);

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;

        if (distance < 0) {
            // Reset countdown nếu hết giờ
            endDate.setDate(endDate.getDate() + 3);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const countdownString = `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update cả 2 countdown
        const countdown1 = document.getElementById('countdown');
        const countdown2 = document.getElementById('countdown-order');

        if (countdown1) countdown1.textContent = countdownString;
        if (countdown2) countdown2.textContent = countdownString;
    }

    // Update mỗi giây
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// SCROLL TO ORDER
// ============================================

function scrollToOrder() {
    const orderSection = document.getElementById('order');
    if (orderSection) {
        // Track AddToCart khi click CTA
        trackAddToCart();

        // Smooth scroll
        orderSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ============================================
// GOOGLE SHEETS INTEGRATION
// ============================================

async function sendToGoogleSheets(orderData) {
    // Kiểm tra URL đã được cấu hình chưa
    if (!CONFIG.googleSheetUrl || CONFIG.googleSheetUrl === 'YOUR_GOOGLE_SHEET_WEB_APP_URL') {
        console.warn('⚠️ Google Sheet URL chưa được cấu hình. Vui lòng xem file GOOGLE_SHEETS_SETUP.md');
        return { status: 'skipped', message: 'Google Sheet URL not configured' };
    }

    try {
        // Sử dụng no-cors mode vì Google Apps Script không hỗ trợ CORS preflight
        const response = await fetch(CONFIG.googleSheetUrl, {
            method: 'POST',
            mode: 'no-cors', // Bắt buộc với Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        // Với no-cors mode, không thể đọc response body
        // Nhưng nếu không có lỗi thì coi như thành công
        console.log('📤 Data sent to Google Sheets');
        return { status: 'success', message: 'Data sent successfully' };

    } catch (error) {
        console.error('❌ Failed to send to Google Sheets:', error);
        throw error;
    }
}

// ============================================
// ORDER FORM HANDLING
// ============================================

function initOrderForm() {
    const form = document.getElementById('order-form');
    const submitBtn = document.getElementById('submit-btn');
    let checkoutTracked = false;

    if (!form) return;

    // Track InitiateCheckout khi focus vào form field đầu tiên
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('focus', function () {
            if (!checkoutTracked) {
                trackInitiateCheckout();
                checkoutTracked = true;
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate form
        const fullname = document.getElementById('fullname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value);

        if (!fullname || !phone || !address) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Validate phone number
        const phoneRegex = /^(0|84)[0-9]{9,10}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            alert('Số điện thoại không hợp lệ!');
            return;
        }

        // Calculate total value
        let totalValue = CONFIG.productPrice;
        if (quantity === 2) totalValue = 750000;
        if (quantity === 3) totalValue = 1050000;

        // Get note
        const note = document.getElementById('note').value.trim();

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Đang xử lý...';

        // Prepare order data
        const orderData = {
            fullname,
            phone,
            address,
            quantity,
            totalValue,
            note,
            timestamp: new Date().toISOString()
        };

        // Send to Google Sheets
        sendToGoogleSheets(orderData)
            .then(response => {
                console.log('✅ Google Sheets response:', response);


                // Reset button
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '🎁 ĐẶT HÀNG - THANH TOÁN KHI NHẬN';

                // Show success modal with order data
                showSuccessModal(orderData);

                // Reset form
                form.reset();
                checkoutTracked = false;

                console.log('📦 Order placed successfully:', orderData);
            })
            .catch(error => {
                console.error('❌ Error sending to Google Sheets:', error);


                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '🎁 ĐẶT HÀNG - THANH TOÁN KHI NHẬN';

                showSuccessModal(orderData);
                form.reset();
                checkoutTracked = false;

                console.log('📦 Order data (backup):', orderData);
            });
    });
}

// ============================================
// SUCCESS MODAL
// ============================================

let callCountdownInterval = null;

function showSuccessModal(orderData) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    // Update modal with order data if provided
    if (orderData) {
        // Customer name
        const nameEl = document.getElementById('modal-customer-name');
        if (nameEl) nameEl.textContent = orderData.fullname;

        // Phone
        const phoneEl = document.getElementById('modal-customer-phone');
        if (phoneEl) phoneEl.textContent = '📱 ' + orderData.phone;

        // Quantity
        const qtyEl = document.getElementById('modal-order-quantity');
        if (qtyEl) qtyEl.textContent = `Số lượng: ${orderData.quantity} sản phẩm`;

        // Total
        const totalEl = document.getElementById('modal-order-total');
        if (totalEl) {
            const formattedTotal = new Intl.NumberFormat('vi-VN').format(orderData.totalValue);
            totalEl.textContent = `Tổng: ${formattedTotal}đ`;
        }
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start 5-minute countdown
    startCallCountdown();

    // Track conversion with Conversion Pixel
    trackConversion(orderData);

    console.log('🎉 Thank You Modal displayed');
}

function startCallCountdown() {
    let timeLeft = 5 * 60; // 5 minutes in seconds
    const countdownEl = document.getElementById('call-countdown');

    if (!countdownEl) return;

    // Clear any existing interval
    if (callCountdownInterval) {
        clearInterval(callCountdownInterval);
    }

    function updateCountdown() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(callCountdownInterval);
            countdownEl.textContent = 'Đang gọi...';
        }
        timeLeft--;
    }

    updateCountdown();
    callCountdownInterval = setInterval(updateCountdown, 1000);
}

// Track conversion with dedicated Conversion Pixel
function trackConversion(orderData) {
    // Use conversion pixel if configured, otherwise use main pixel
    const useConversionPixel = CONFIG.conversionPixelId &&
        CONFIG.conversionPixelId !== 'YOUR_CONVERSION_PIXEL_ID';

    if (typeof fbq !== 'undefined') {
        // Standard Purchase event
        fbq('track', 'Purchase', {
            content_name: CONFIG.productName,
            content_type: 'product',
            value: orderData ? orderData.totalValue : CONFIG.productPrice,
            currency: CONFIG.currency,
            num_items: orderData ? orderData.quantity : 1
        });
        console.log('💰 Conversion tracked via main Pixel');

        // If conversion pixel is different, track there too
        if (useConversionPixel) {
            fbq('trackSingle', CONFIG.conversionPixelId, 'Purchase', {
                content_name: CONFIG.productName,
                content_type: 'product',
                value: orderData ? orderData.totalValue : CONFIG.productPrice,
                currency: CONFIG.currency,
                num_items: orderData ? orderData.quantity : 1
            });
            console.log('🎯 Conversion tracked via Conversion Pixel:', CONFIG.conversionPixelId);
        }
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Clear countdown interval
    if (callCountdownInterval) {
        clearInterval(callCountdownInterval);
        callCountdownInterval = null;
    }
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    const modal = document.getElementById('success-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// ============================================
// FAQ ACCORDION
// ============================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function () {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ============================================
// STOCK COUNTER (URGENCY)
// ============================================

function updateStockCount() {
    const stockElement = document.getElementById('stock-count');
    if (!stockElement) return;

    // Giảm số lượng ngẫu nhiên để tạo urgency
    let currentStock = parseInt(stockElement.textContent);

    setInterval(() => {
        if (Math.random() > 0.7 && currentStock > 10) {
            currentStock--;
            stockElement.textContent = currentStock;

            // Thêm hiệu ứng khi số giảm
            stockElement.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                stockElement.style.animation = '';
            }, 500);
        }
    }, 30000); // Check mỗi 30 giây
}

// ============================================
// LAZY LOADING IMAGES
// ============================================

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.pain-card, .feature-item, .step-card, .testimonial-card, .guarantee-card');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        animationObserver.observe(el);
    });
}

// ============================================
// MOBILE STICKY CTA VISIBILITY
// ============================================

function initStickyCtaVisibility() {
    const stickyCta = document.querySelector('.sticky-cta-mobile');
    const orderSection = document.getElementById('order');

    if (!stickyCta || !orderSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                stickyCta.style.display = 'none';
            } else {
                if (window.innerWidth <= 768) {
                    stickyCta.style.display = 'block';
                }
            }
        });
    }, { threshold: 0.1 });

    observer.observe(orderSection);
}

// ============================================
// VIDEO PLAYER PLACEHOLDER
// ============================================

function initVideoPlayer() {
    const videoContainers = document.querySelectorAll('.video-container');

    videoContainers.forEach(container => {
        container.addEventListener('click', function () {
            // Trong thực tế, đây là nơi embed video player
            // Ví dụ: thay thế bằng YouTube embed hoặc custom player
            alert('Video sẽ phát ở đây. Vui lòng thay thế bằng video thật!');
        });
    });
}

// ============================================
// PHONE NUMBER FORMATTING
// ============================================

function initPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');

        // Format: 0912 345 678
        if (value.length > 4 && value.length <= 7) {
            value = value.slice(0, 4) + ' ' + value.slice(4);
        } else if (value.length > 7) {
            value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 10);
        }

        e.target.value = value;
    });
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 CYKE L16TT Landing Page Initialized');

    // Track ViewContent
    trackViewContent();

    // Initialize all components
    initCountdown();
    initOrderForm();
    initFAQ();
    initSmoothScroll();
    initScrollAnimations();
    initStickyCtaVisibility();
    initVideoPlayer();
    initPhoneFormatting();
    initLazyLoading();
    updateStockCount();

    console.log('✅ All components initialized');
});

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.scrollToOrder = scrollToOrder;
window.closeModal = closeModal;
window.trackAddToCart = trackAddToCart;
window.trackInitiateCheckout = trackInitiateCheckout;
window.trackPurchase = trackPurchase;
window.closeSocialProof = closeSocialProof;

// ============================================
// SOCIAL PROOF POPUP - NGƯỜI VỪA MUA HÀNG
// ============================================

// Danh sách tên và địa điểm giả lập
const SOCIAL_PROOF_DATA = {
    names: [
        'Nguyễn Văn Hùng',
        'Trần Thị Mai',
        'Lê Hoàng Nam',
        'Phạm Thị Hương',
        'Võ Minh Tuấn',
        'Đặng Thị Lan',
        'Bùi Văn Đức',
        'Hoàng Thị Yến',
        'Ngô Quang Vinh',
        'Dương Thị Ngọc',
        'Lý Văn Thắng',
        'Trịnh Thị Hà',
        'Đinh Văn Phong',
        'Hồ Thị Kim',
        'Phan Văn Long',
        'Vũ Thị Thảo',
        'Mai Văn Khoa',
        'Đỗ Thị Linh',
        'Cao Văn Bình',
        'Nguyễn Thị Hồng'
    ],
    locations: [
        'Hà Nội',
        'TP. Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Cần Thơ',
        'Biên Hòa',
        'Nha Trang',
        'Huế',
        'Buôn Ma Thuột',
        'Quy Nhơn',
        'Vũng Tàu',
        'Thanh Hóa',
        'Thái Nguyên',
        'Nam Định',
        'Long An',
        'Bình Dương',
        'Đồng Nai',
        'Quảng Ninh',
        'Bắc Ninh',
        'Nghệ An'
    ],
    times: [
        '1 phút trước',
        '2 phút trước',
        '3 phút trước',
        '5 phút trước',
        '7 phút trước',
        '10 phút trước',
        '12 phút trước',
        '15 phút trước',
        '20 phút trước',
        '25 phút trước'
    ],
    quantities: [
        '1 Gậy CYKE L16TT',
        '2 Gậy CYKE L16TT',
        '1 Gậy CYKE L16TT',
        '1 Gậy CYKE L16TT',
        '3 Gậy CYKE L16TT'
    ]
};

let socialProofInterval = null;
let socialProofTimeout = null;
let socialProofPaused = false;

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function showSocialProofPopup() {
    const popup = document.getElementById('social-proof-popup');
    const nameEl = document.getElementById('buyer-name');
    const locationEl = document.getElementById('buyer-location');
    const timeEl = document.getElementById('buyer-time');

    if (!popup || socialProofPaused) return;

    // Cập nhật data ngẫu nhiên
    const name = getRandomItem(SOCIAL_PROOF_DATA.names);
    const location = getRandomItem(SOCIAL_PROOF_DATA.locations);
    const time = getRandomItem(SOCIAL_PROOF_DATA.times);
    const quantity = getRandomItem(SOCIAL_PROOF_DATA.quantities);

    nameEl.textContent = name;
    locationEl.textContent = location;
    timeEl.textContent = time;

    // Update action text với số lượng
    const actionEl = popup.querySelector('.social-proof-action');
    if (actionEl) {
        actionEl.innerHTML = `vừa đặt mua <strong>${quantity}</strong>`;
    }

    // Show popup
    popup.classList.remove('hide');
    popup.classList.add('show');

    // Ẩn popup sau 5 giây
    socialProofTimeout = setTimeout(() => {
        hideSocialProofPopup();
    }, 5000);
}

function hideSocialProofPopup() {
    const popup = document.getElementById('social-proof-popup');
    if (popup) {
        popup.classList.remove('show');
        popup.classList.add('hide');
    }
}

function closeSocialProof() {
    hideSocialProofPopup();
    // Tạm dừng 2 phút sau khi user đóng
    socialProofPaused = true;
    setTimeout(() => {
        socialProofPaused = false;
    }, 120000);
}

function initSocialProof() {
    // Delay 8 giây trước khi hiện popup đầu tiên
    setTimeout(() => {
        showSocialProofPopup();

        // Lặp lại mỗi 15-25 giây
        socialProofInterval = setInterval(() => {
            showSocialProofPopup();
        }, Math.random() * 10000 + 15000); // Random 15-25 giây
    }, 8000);

    console.log('📢 Social Proof Popup initialized');
}

// Thêm vào DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // Khởi tạo Social Proof sau khi các component khác đã sẵn sàng
    setTimeout(initSocialProof, 1000);
});


