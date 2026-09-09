/**
 * N Farms — Interactive Order & WhatsApp Checkout Engine
 * File: js/order.js
 * Reactive cart calculation, batch parameter parsing, and WhatsApp payload generation
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Configuration & Pricing Constants
     -------------------------------------------------------------------------- */
  const FARM_WHATSAPP = '2348000000000'; // Replace with active business WhatsApp line

  const UNIT_PRICES = {
    dressed: 6500,
    live: 6000,
    eggs: 4200
  };

  const DELIVERY_COST = 2500;

  // Active state cache
  let selectedBatchId = 'Standard Harvest';

  /* --------------------------------------------------------------------------
     2. DOM Element Selectors
     -------------------------------------------------------------------------- */
  // Quantity Inputs
  const inputDressed = document.getElementById('dressed-qty');
  const inputLive = document.getElementById('live-qty');
  const inputEggs = document.getElementById('eggs-qty');

  // Batch Indicator Elements
  const batchIndicator = document.getElementById('dressed-batch-indicator');
  const batchLabel = document.getElementById('dressed-batch-label');

  // Summary Breakdown Lines
  const lineDressed = document.getElementById('line-dressed');
  const lineLive = document.getElementById('line-live');
  const lineEggs = document.getElementById('line-eggs');
  const emptyNotice = document.getElementById('empty-state-notice');

  const countDressed = document.getElementById('dressed-count');
  const countLive = document.getElementById('live-count');
  const countEggs = document.getElementById('eggs-count');

  const subtotalDressed = document.getElementById('dressed-subtotal');
  const subtotalLive = document.getElementById('live-subtotal');
  const subtotalEggs = document.getElementById('eggs-subtotal');

  // Financial Totals
  const displaySubtotal = document.getElementById('summary-subtotal');
  const displayDelivery = document.getElementById('summary-delivery');
  const displayGrandTotal = document.getElementById('grand-total');

  // Fulfillment & Customer Fields
  const fulfillmentRadios = document.querySelectorAll('input[name="fulfillment"]');
  const addressContainer = document.getElementById('address-container');
  const inputAddress = document.getElementById('customer-address');
  const inputName = document.getElementById('customer-name');
  const inputPhone = document.getElementById('customer-phone');
  const inputDate = document.getElementById('order-date');
  const inputNotes = document.getElementById('order-notes');

  // CTA
  const btnCheckout = document.getElementById('btn-checkout');

  /* --------------------------------------------------------------------------
     3. Helper & Formatting Utilities
     -------------------------------------------------------------------------- */
  const formatNaira = (amount) => {
    return '₦' + Number(amount).toLocaleString('en-NG');
  };

  const getCleanQty = (input) => {
    if (!input) return 0;
    const val = parseInt(input.value, 10);
    return isNaN(val) || val < 0 ? 0 : val;
  };

  /* --------------------------------------------------------------------------
     4. Reactive Calculations & UI Synchronization
     -------------------------------------------------------------------------- */
  const recalculateTotals = () => {
    const qtyDressed = getCleanQty(inputDressed);
    const qtyLive = getCleanQty(inputLive);
    const qtyEggs = getCleanQty(inputEggs);

    const costDressed = qtyDressed * UNIT_PRICES.dressed;
    const costLive = qtyLive * UNIT_PRICES.live;
    const costEggs = qtyEggs * UNIT_PRICES.eggs;

    const subtotal = costDressed + costLive + costEggs;
    const totalItems = qtyDressed + qtyLive + qtyEggs;

    // Determine Fulfillment Method
    const activeFulfillment = document.querySelector('input[name="fulfillment"]:checked');
    const isDelivery = activeFulfillment ? activeFulfillment.value === 'delivery' : false;
    const deliveryFee = isDelivery && totalItems > 0 ? DELIVERY_COST : 0;
    const grandTotal = subtotal + deliveryFee;

    // Synchronize Breakdown Row States
    if (lineDressed && countDressed && subtotalDressed) {
      lineDressed.style.display = qtyDressed > 0 ? 'flex' : 'none';
      countDressed.textContent = qtyDressed;
      subtotalDressed.textContent = formatNaira(costDressed);
    }

    if (lineLive && countLive && subtotalLive) {
      lineLive.style.display = qtyLive > 0 ? 'flex' : 'none';
      countLive.textContent = qtyLive;
      subtotalLive.textContent = formatNaira(costLive);
    }

    if (lineEggs && countEggs && subtotalEggs) {
      lineEggs.style.display = qtyEggs > 0 ? 'flex' : 'none';
      countEggs.textContent = qtyEggs;
      subtotalEggs.textContent = formatNaira(costEggs);
    }

    if (emptyNotice) {
      emptyNotice.style.display = totalItems === 0 ? 'block' : 'none';
    }

    // Update Totals Display
    if (displaySubtotal) displaySubtotal.textContent = formatNaira(subtotal);
    if (displayDelivery) displayDelivery.textContent = isDelivery ? formatNaira(deliveryFee) : 'Free';
    if (displayGrandTotal) displayGrandTotal.textContent = formatNaira(grandTotal);

    // Synchronize CTA button interactivity
    if (btnCheckout) {
      if (totalItems === 0) {
        btnCheckout.disabled = true;
        btnCheckout.style.opacity = '0.5';
        btnCheckout.style.cursor = 'not-allowed';
      } else {
        btnCheckout.disabled = false;
        btnCheckout.style.opacity = '1';
        btnCheckout.style.cursor = 'pointer';
      }
    }

    return {
      qtyDressed,
      qtyLive,
      qtyEggs,
      costDressed,
      costLive,
      costEggs,
      subtotal,
      deliveryFee,
      grandTotal,
      isDelivery
    };
  };

  /* --------------------------------------------------------------------------
     5. Counter Buttons & Form Controls Binding
     -------------------------------------------------------------------------- */
  const initCounterButtons = () => {
    const buttons = document.querySelectorAll('.qty-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const action = btn.getAttribute('data-action');
        const input = document.getElementById(targetId);

        if (!input) return;

        let currentVal = getCleanQty(input);
        const maxVal = parseInt(input.getAttribute('max') || '999', 10);

        if (action === 'increment') {
          if (currentVal < maxVal) input.value = currentVal + 1;
        } else if (action === 'decrement') {
          if (currentVal > 0) input.value = currentVal - 1;
        }

        recalculateTotals();
      });
    });

    [inputDressed, inputLive, inputEggs].forEach((input) => {
      if (!input) return;

      input.addEventListener('input', () => {
        if (input.value === '' || parseInt(input.value, 10) < 0) {
          input.value = 0;
        }
        recalculateTotals();
      });

      input.addEventListener('blur', () => {
        if (input.value === '') {
          input.value = 0;
          recalculateTotals();
        }
      });
    });
  };

  /* --------------------------------------------------------------------------
     6. Fulfillment Toggle & Address Conditioning
     -------------------------------------------------------------------------- */
  const initFulfillmentToggle = () => {
    fulfillmentRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        const isDelivery = radio.value === 'delivery';

        if (addressContainer) {
          addressContainer.style.display = isDelivery ? 'block' : 'none';
        }

        if (inputAddress) {
          if (isDelivery) {
            inputAddress.setAttribute('required', 'required');
          } else {
            inputAddress.removeAttribute('required');
            inputAddress.style.borderColor = 'var(--border)';
          }
        }

        recalculateTotals();
      });
    });
  };

  /* --------------------------------------------------------------------------
     7. URL Query Parameters Routing
     -------------------------------------------------------------------------- */
  const initQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemParam = urlParams.get('item');
    const batchParam = urlParams.get('batch');

    if (batchParam) {
      selectedBatchId = batchParam;
      if (batchIndicator && batchLabel) {
        batchLabel.textContent = `Batch #${batchParam}`;
        batchIndicator.style.display = 'inline-flex';
      }
      if (inputDressed && getCleanQty(inputDressed) === 0) {
        inputDressed.value = 1;
      }
    } else if (itemParam === 'broiler') {
      if (inputDressed && getCleanQty(inputDressed) === 0) {
        inputDressed.value = 1;
      }
    }

    if (itemParam === 'eggs') {
      if (inputEggs && getCleanQty(inputEggs) === 0) {
        inputEggs.value = 1;
      }
    }

    recalculateTotals();
  };

  /* --------------------------------------------------------------------------
     8. Form Validation & WhatsApp Dispatch Engine
     -------------------------------------------------------------------------- */
  const validateField = (field) => {
    if (!field) return true;
    const isValid = field.value.trim().length > 0;
    field.style.borderColor = isValid ? 'var(--border)' : 'var(--accent-warm)';
    return isValid;
  };

  const handleCheckout = () => {
    const state = recalculateTotals();

    // Guard: Order cannot be empty
    if (state.qtyDressed + state.qtyLive + state.qtyEggs === 0) {
      alert('Please add at least one item to your cart before proceeding.');
      return;
    }

    // Validate Contact Details
    let isValid = true;
    if (!validateField(inputName)) isValid = false;
    if (!validateField(inputPhone)) isValid = false;

    if (state.isDelivery && !validateField(inputAddress)) {
      isValid = false;
    }

    if (!isValid) {
      const firstInvalid = [inputName, inputPhone, state.isDelivery ? inputAddress : null]
        .find((f) => f && f.value.trim().length === 0);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Build Itemized Text
    const itemsList = [];
    if (state.qtyDressed > 0) {
      itemsList.push(`• Dressed Broilers: ${state.qtyDressed} (${formatNaira(state.costDressed)})`);
    }
    if (state.qtyLive > 0) {
      itemsList.push(`• Live Pen Broilers: ${state.qtyLive} (${formatNaira(state.costLive)})`);
    }
    if (state.qtyEggs > 0) {
      itemsList.push(`• Egg Crates: ${state.qtyEggs} (${formatNaira(state.costEggs)})`);
    }

    const customerName = inputName ? inputName.value.trim() : 'Guest';
    const customerPhone = inputPhone ? inputPhone.value.trim() : 'Unspecified';
    const fulfillmentLabel = state.isDelivery ? 'Direct Delivery' : 'Farm Gate Pickup';
    const destination = state.isDelivery && inputAddress && inputAddress.value.trim() 
      ? inputAddress.value.trim() 
      : 'Farm Gate Collection';
    const preferredDate = inputDate && inputDate.value ? inputDate.value : 'Immediate / Next Available Slot';
    const instructions = inputNotes && inputNotes.value.trim() ? inputNotes.value.trim() : 'Standard packaging';

    // Construct Payload
    const message = [
      '*NEW ORDER - N FARMS*',
      '-------------------------',
      `• Customer: ${customerName}`,
      `• Phone: ${customerPhone}`,
      `• Batch Ref: ${selectedBatchId}`,
      '',
      '*Order Items:*',
      itemsList.join('\n'),
      '',
      `*Fulfillment:* ${fulfillmentLabel}`,
      `*Address:* ${destination}`,
      `*Preferred Date:* ${preferredDate}`,
      `*Special Instructions:* ${instructions}`,
      '-------------------------',
      `*Subtotal:* ${formatNaira(state.subtotal)}`,
      `*Logistics:* ${state.isDelivery ? formatNaira(state.deliveryFee) : 'Free'}`,
      `*Total:* ${formatNaira(state.grandTotal)}`
    ].join('\n');

    const whatsappUrl = `https://wa.me/${FARM_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  /* --------------------------------------------------------------------------
     9. Event Listeners Initialization
     -------------------------------------------------------------------------- */
  const initListeners = () => {
    initCounterButtons();
    initFulfillmentToggle();
    initQueryParams();

    [inputName, inputPhone, inputAddress].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        field.style.borderColor = 'var(--border)';
      });
    });

    if (btnCheckout) {
      btnCheckout.addEventListener('click', handleCheckout);
    }
  };

  /* --------------------------------------------------------------------------
     Bootstrap Application Safely
     -------------------------------------------------------------------------- */
  try {
    initListeners();
  } catch (error) {
    console.error('[N Farms Order Engine]: Initialization failed', error);
  }
});