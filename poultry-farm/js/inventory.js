/**
 * N Farms — Live Inventory & Maturation Engine
 * File: js/inventory.js
 * Precision batch calculation and dynamic stock allocation
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Batch Data Store
     -------------------------------------------------------------------------- */
  const batches = [
    {
      batchId: 'B-24-09',
      type: 'Broiler',
      breed: 'Cobb 500 Heavy Broilers',
      hatchDate: '2026-08-01T00:00:00Z',
      targetHarvestAgeDays: 42,
      targetWeight: '2.3kg – 2.6kg',
      totalCapacity: 500,
      reservedCount: 360,
      pricePerBird: 6500
    },
    {
      batchId: 'B-24-10',
      type: 'Broiler',
      breed: 'Ross 308 Fast-Growth',
      hatchDate: '2026-08-22T00:00:00Z',
      targetHarvestAgeDays: 42,
      targetWeight: '2.2kg – 2.5kg',
      totalCapacity: 600,
      reservedCount: 150,
      pricePerBird: 6300
    },
    {
      batchId: 'L-18',
      type: 'Layer',
      breed: 'Isa Brown Spent Layers',
      hatchDate: '2025-02-15T00:00:00Z',
      targetHarvestAgeDays: 570,
      targetWeight: '1.9kg – 2.2kg',
      totalCapacity: 600,
      reservedCount: 565,
      pricePerBird: 4800
    }
  ];

  /* --------------------------------------------------------------------------
     2. Maturation & Temporal Calculations
     -------------------------------------------------------------------------- */
  const calculateBatchMetrics = (batch, currentDate = new Date()) => {
    const hatch = new Date(batch.hatchDate);
    const msPerDay = 1000 * 60 * 60 * 24;

    const diffDays = Math.floor((currentDate.getTime() - hatch.getTime()) / msPerDay);
    const currentAge = Math.max(0, diffDays);

    const rawPercentage = (currentAge / batch.targetHarvestAgeDays) * 100;
    const progressPercent = Math.min(100, Math.max(0, Math.round(rawPercentage)));

    const daysRemaining = Math.max(0, batch.targetHarvestAgeDays - currentAge);
    const availableStock = Math.max(0, batch.totalCapacity - batch.reservedCount);

    return {
      currentAge,
      progressPercent,
      daysRemaining,
      availableStock
    };
  };

  /* --------------------------------------------------------------------------
     3. Stock Badge Presentation Logic
     -------------------------------------------------------------------------- */
  const getStockBadgeConfig = (availableStock) => {
    if (availableStock === 0) {
      return {
        label: 'Batch Sold Out',
        dotColor: 'var(--text-muted)',
        textColor: 'var(--text-muted)',
        borderColor: 'var(--border)',
        bgColor: 'rgba(255, 255, 255, 0.04)'
      };
    }

    if (availableStock <= 50) {
      return {
        label: 'Limited Stock',
        dotColor: 'var(--accent-warm)',
        textColor: 'var(--accent-warm)',
        borderColor: 'rgba(245, 158, 11, 0.25)',
        bgColor: 'rgba(245, 158, 11, 0.08)'
      };
    }

    return {
      label: 'Stock Available',
      dotColor: 'var(--accent-green)',
      textColor: 'var(--accent-green)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      bgColor: 'rgba(16, 185, 129, 0.08)'
    };
  };

  /* --------------------------------------------------------------------------
     4. Dynamic DOM Sync for Primary Broiler Card
     -------------------------------------------------------------------------- */
  const syncPrimaryBroilerCard = () => {
    const primaryCard = document.getElementById('card-batch-b2409');
    if (!primaryCard) return;

    const primaryBatch = batches.find((b) => b.batchId === 'B-24-09');
    if (!primaryBatch) return;

    const { currentAge, progressPercent, daysRemaining, availableStock } = calculateBatchMetrics(primaryBatch);
    const badge = getStockBadgeConfig(availableStock);

    // Update or inject live status pill
    const statusPill = primaryCard.querySelector('.status-pill');
    if (statusPill) {
      statusPill.style.backgroundColor = badge.bgColor;
      statusPill.style.borderColor = badge.borderColor;
      statusPill.style.color = badge.textColor;

      const dot = statusPill.querySelector('.status-dot');
      if (dot) dot.style.color = badge.dotColor;

      const pillText = statusPill.querySelector('span:not(.status-dot)');
      if (pillText) pillText.textContent = badge.label;
    }

    // Update progress meter and metric tags
    const progressLabel = primaryCard.querySelector('div[style*="justify-content: space-between"] span[style*="var(--accent-green)"]');
    if (progressLabel) {
      progressLabel.textContent = `Day ${currentAge} of ${primaryBatch.targetHarvestAgeDays} (${progressPercent}%)`;
    }

    const progressBar = primaryCard.querySelector('div[style*="background-color: var(--accent-green)"]');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    // Target harvest interval
    const harvestWindowText = primaryCard.querySelector('div:nth-child(2) span[style*="var(--accent-warm)"]');
    if (harvestWindowText) {
      harvestWindowText.textContent = daysRemaining === 0 ? 'Harvest Active Today' : `In ${daysRemaining} Days`;
    }

    // Update remaining count metric
    const stockQuantitySpan = primaryCard.querySelector('div[style*="grid-column: span 2"] span:last-child');
    if (stockQuantitySpan) {
      stockQuantitySpan.textContent = `${availableStock} Birds Remaining`;
    }

    // Adjust reservation CTA button state if sold out
    const reserveButton = primaryCard.querySelector('a.btn');
    if (reserveButton && availableStock === 0) {
      reserveButton.textContent = 'Join Waitlist for Next Batch';
      reserveButton.classList.remove('btn-primary');
      reserveButton.classList.add('btn-secondary');
      reserveButton.setAttribute('href', `order.html?item=broiler&batch=${primaryBatch.batchId}&waitlist=true`);
    }
  };

  /* --------------------------------------------------------------------------
     5. Reservation Routing & Intent Binding
     -------------------------------------------------------------------------- */
  const initReservationRouting = () => {
    // Broiler Batch Reservation links
    const reservationButtons = document.querySelectorAll('a[href*="order.html?batch="], a[data-batch]');
    reservationButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const batchParam = btn.getAttribute('data-batch') || new URL(btn.href, window.location.origin).searchParams.get('batch');
        if (batchParam) {
          e.preventDefault();
          const targetUrl = new URL('order.html', window.location.origin);
          targetUrl.searchParams.set('item', 'broiler');
          targetUrl.searchParams.set('batch', batchParam);
          window.location.href = targetUrl.toString();
        }
      });
    });

    // Egg Order CTA links
    const eggButtons = document.querySelectorAll('a[href*="order.html?item=eggs"], a[data-type="eggs"]');
    eggButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = new URL('order.html', window.location.origin);
        targetUrl.searchParams.set('item', 'eggs');
        window.location.href = targetUrl.toString();
      });
    });
  };

  /* --------------------------------------------------------------------------
     Bootstrap Module Safely
     -------------------------------------------------------------------------- */
  try {
    syncPrimaryBroilerCard();
    initReservationRouting();
  } catch (err) {
    console.error('[N Farms Inventory Engine]: Failed to execute calculations', err);
  }
});