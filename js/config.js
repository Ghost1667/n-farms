/**
 * N Farms — Config Loader
 * File: js/config.js
 * Loads site settings from config.json (hosted on GitHub) and applies them to all pages.
 * Single source of truth — no browser cache, settings are shared by all users.
 */

'use strict';

const CONFIG_URL = 'config.json';
let siteConfig = {};

const loadConfig = async () => {
  try {
    const response = await fetch(CONFIG_URL, { cache: 'no-cache' });
    if (!response.ok) {
      console.warn('[N Farms Config] Could not load config.json, using defaults');
      siteConfig = getDefaults();
      return;
    }
    siteConfig = await response.json();
  } catch (err) {
    console.error('[N Farms Config] Failed to fetch config', err);
    siteConfig = getDefaults();
  }
  applyConfig();
};

const getDefaults = () => ({
  prices: { dressed: 6500, live: 6000, eggs: 4200, delivery: 2500 },
  contact: { whatsapp: '2348000000000', phone: '2348000000000', hours: 'Monday – Saturday, 7:00 AM – 5:00 PM' },
  siteText: {
    heroTitle: 'Chicken and eggs from our farm to your table.',
    heroLead: 'See our chickens, order fresh meat and eggs, and know exactly where your food comes from.',
    aboutText: 'Simple, honest farming. Healthy chickens, fresh eggs, and fair prices.',
    footerDesc: 'Fresh chicken and eggs, direct from our farm.'
  },
  inventory: {
    'B-24-09': { available: '140 Chickens Left', harvestIn: '4 Days', weight: '2.3kg – 2.6kg', day: 38, totalDays: 42, progress: 90 },
    'table-eggs': { stock: '48 Crates Left', collected: '6:30 AM Today', bestBefore: '21 Days' },
    'L-18': { readyIn: '18 Days', amount: 'About 600 Chickens' }
  }
});

const getPrice = (key) => siteConfig.prices && siteConfig.prices[key] !== undefined ? siteConfig.prices[key] : getDefaults().prices[key];
const getContact = (key) => siteConfig.contact && siteConfig.contact[key] !== undefined ? siteConfig.contact[key] : getDefaults().contact[key];
const getInventory = (key) => siteConfig.inventory && siteConfig.inventory[key] !== undefined ? siteConfig.inventory[key] : getDefaults().inventory[key];
const applyPrices = () => {
  document.querySelectorAll('[data-admin-price="dressed"]').forEach((el) => {
    el.textContent = '₦' + getPrice('dressed').toLocaleString('en-NG');
  });
  document.querySelectorAll('[data-admin-price="live"]').forEach((el) => {
    el.textContent = '₦' + getPrice('live').toLocaleString('en-NG');
  });
  document.querySelectorAll('[data-admin-price="eggs"]').forEach((el) => {
    el.textContent = '₦' + getPrice('eggs').toLocaleString('en-NG');
  });
  document.querySelectorAll('[data-admin-price="delivery"]').forEach((el) => {
    el.textContent = '₦' + getPrice('delivery').toLocaleString('en-NG');
  });
};

const applyContact = () => {
  document.querySelectorAll('[data-admin-whatsapp]').forEach((el) => {
    el.href = `https://wa.me/${getContact('whatsapp')}?text=${encodeURIComponent(
      el.dataset.adminWhatsappDefault || 'Hello N Farms, I have a question.'
    )}`;
  });
  document.querySelectorAll('[data-admin-phone]').forEach((el) => {
    el.href = `tel:${getContact('phone')}`;
    el.textContent = 'Call ' + formatPhone(getContact('phone'));
  });
  document.querySelectorAll('[data-admin-hours]').forEach((el) => {
    el.textContent = getContact('hours');
  });
};

const applySiteText = () => {
  document.querySelectorAll('[data-admin-text="heroTitle"]').forEach((el) => {
    el.textContent = getSiteText('heroTitle');
  });
  document.querySelectorAll('[data-admin-text="heroLead"]').forEach((el) => {
    el.textContent = getSiteText('heroLead');
  });
  document.querySelectorAll('[data-admin-text="aboutText"]').forEach((el) => {
    el.textContent = getSiteText('aboutText');
  });
  document.querySelectorAll('[data-admin-text="footerDesc"]').forEach((el) => {
    el.textContent = getSiteText('footerDesc');
  });
};

const applyInventory = () => {
  const b2409 = getInventory('B-24-09');
  if (b2409) {
    document.querySelectorAll('[data-admin-inv="B-24-09.available"]').forEach((el) => { el.textContent = b2409.available; });
    document.querySelectorAll('[data-admin-inv="B-24-09.harvestIn"]').forEach((el) => { el.textContent = b2409.harvestIn; });
    document.querySelectorAll('[data-admin-inv="B-24-09.weight"]').forEach((el) => { el.textContent = b2409.weight; });
    document.querySelectorAll('[data-admin-inv="B-24-09.progress"]').forEach((el) => { el.textContent = `Day ${b2409.day} of ${b2409.totalDays} (${b2409.progress}%)`; });
    document.querySelectorAll('[data-admin-inv="B-24-09.progressBar"]').forEach((el) => { el.style.width = b2409.progress + '%'; });
  }
  const eggs = getInventory('table-eggs');
  if (eggs) {
    document.querySelectorAll('[data-admin-inv="table-eggs.stock"]').forEach((el) => { el.textContent = eggs.stock; });
    document.querySelectorAll('[data-admin-inv="table-eggs.collected"]').forEach((el) => { el.textContent = eggs.collected; });
    document.querySelectorAll('[data-admin-inv="table-eggs.bestBefore"]').forEach((el) => { el.textContent = eggs.bestBefore; });
  }
  const l18 = getInventory('L-18');
  if (l18) {
    document.querySelectorAll('[data-admin-inv="L-18.readyIn"]').forEach((el) => { el.textContent = l18.readyIn; });
    document.querySelectorAll('[data-admin-inv="L-18.amount"]').forEach((el) => { el.textContent = l18.amount; });
  }
};

const applyConfig = () => {
  applyPrices();
  applyContact();
  applySiteText();
  applyInventory();
};

const formatPhone = (num) => {
  if (num && num.length === 13 && num.startsWith('234')) {
    return num.replace(/^(\d{3})(\d{4})(\d{4})(\d{4})$/, '$1-$2-$3-$4');
  }
  return num || '';
};

window.NFFarmsConfig = {
  loadConfig,
  getPrice,
  getContact,
  getInventory,
  getSiteText,
  getConfig: () => siteConfig
};

document.addEventListener('DOMContentLoaded', loadConfig);

const getSiteText = (key) => siteConfig.siteText && siteConfig.siteText[key] !== undefined ? siteConfig.siteText[key] : getDefaults().siteText[key];
