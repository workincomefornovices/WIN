document.addEventListener('DOMContentLoaded', () => {
    // Custom Toast Notification System
    function showToast(message, type = 'info') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        } else if (type === 'error') {
            iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        } else {
            iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }

        toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500); // Wait for CSS transition to finish
        }, 4000);
    }

    const registrationForm = document.getElementById('registrationForm');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const bookSeatBtn = document.getElementById('bookSeatBtn');
    const fullAccessBtn = document.getElementById('fullAccessBtn');

    let currentFullPrice = 1499;

    // Elements to update
    const displayFullPrice = document.getElementById('displayFullPrice');
    const summaryCouponValue = document.getElementById('summaryCouponValue');
    const summaryTotalRow = document.getElementById('summaryTotalRow');
    const summaryTotalValue = document.getElementById('summaryTotalValue');
    const btnFullPriceSubtext = document.getElementById('btnFullPriceSubtext');
    const agreeTerms = document.getElementById('agreeTerms');
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEGutBXhNxewgNQism8ijhKn3hYPMF1kCaVZTKTyaBYdktyx5xKfMZGu1RlpSf8jq5-w/exec';

    async function processPayment(amount, buttonElement) {
        // Show loading state
        const originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.style.opacity = '0.7';
        buttonElement.style.cursor = 'wait';
        buttonElement.innerHTML = '<span class="btn-main-text">Processing...</span><span class="btn-subtext">Securely connecting to PhonePe</span>';

        showToast('Initiating secure payment...', 'info');

        const requestData = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            coupon: document.getElementById('coupon').value,
            amount: amount
        };

        try {
            // Send data to Google Apps Script (Serverless Backend)
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.status === 'success' && result.paymentUrl) {
                showToast('Redirecting to PhonePe Gateway...', 'success');
                // Redirect user to the PhonePe payment page
                window.location.href = result.paymentUrl;
            } else {
                throw new Error(result.message || 'Payment initialization failed.');
            }

        } catch (error) {
            console.error('Payment Error:', error);
            // Display the exact error message in the toast to help us debug
            showToast('Error: ' + error.message, 'error');

            // Revert button state on error
            buttonElement.disabled = false;
            buttonElement.style.opacity = '1';
            buttonElement.style.cursor = 'pointer';
            buttonElement.innerHTML = originalText;
        }
    }

    // Custom form validation logic
    function validateForm() {
        if (!agreeTerms.checked) {
            showToast('Please check the box to agree to the Privacy Policy and Terms & Conditions.', 'error');
            return false;
        }

        if (!registrationForm.checkValidity()) {
            const elements = registrationForm.elements;
            for (let i = 0; i < elements.length; i++) {
                if (!elements[i].validity.valid) {
                    if (elements[i].type === 'email' && elements[i].value) {
                        showToast('Please enter a valid email address.', 'error');
                    } else if (elements[i].id === 'phone' && elements[i].value) {
                        showToast('Please enter a valid 10-digit mobile number.', 'error');
                    } else {
                        showToast('Please fill out all required fields marked with an asterisk (*).', 'error');
                    }
                    elements[i].focus();
                    return false;
                }
            }
            return false;
        }
        return true;
    }

    // Handle form submission (Advance Booking)
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm()) {
            processPayment(449, bookSeatBtn);
        }
    });

    // Handle full access button click
    fullAccessBtn.addEventListener('click', () => {
        if (validateForm()) {
            processPayment(currentFullPrice, fullAccessBtn);
        }
    });

    // Handle coupon application
    applyCouponBtn.addEventListener('click', () => {
        const couponInput = document.getElementById('coupon').value.trim().toLowerCase();

        if (couponInput === 'wsa500') {
            // Apply discount
            currentFullPrice = 999;

            // Update UI
            displayFullPrice.innerHTML = '<span style="text-decoration: line-through; font-size: 1rem; color: var(--text-light); margin-right: 0.5rem;">₹1,499</span>₹999';
            summaryCouponValue.textContent = 'WSA500 Applied (-₹500)';
            summaryCouponValue.style.color = 'var(--green)';

            summaryTotalRow.style.display = 'flex';
            summaryTotalValue.textContent = '₹999';

            btnFullPriceSubtext.textContent = '₹999 Full Payment';

            showToast('Coupon "WSA500" applied successfully! Full price reduced to ₹999.', 'success');
        } else {
            // Revert to original price if coupon is invalid or empty
            currentFullPrice = 1499;

            // Revert UI
            displayFullPrice.textContent = '₹1,499';
            summaryCouponValue.textContent = 'None';
            summaryCouponValue.style.color = 'var(--text-dark)';

            summaryTotalRow.style.display = 'none';
            summaryTotalValue.textContent = '₹1,499';

            btnFullPriceSubtext.textContent = '₹1,499 Full Payment';

            if (couponInput !== '') {
                showToast('Invalid coupon code. Price reverted to ₹1,499.', 'error');
            } else {
                showToast('Please enter a valid coupon code.', 'error');
            }
        }
    });
});
