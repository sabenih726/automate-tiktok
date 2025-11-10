// Main application logic

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  loadSavedSettings();
  setupEventListeners();
});

// App initialization
function initApp() {
  console.log('App initialized');
  
  // Check if profile exists
  const profile = loadProfile();
  if (profile && profile.name) {
    console.log('Profile loaded:', profile.name);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Toggle switches
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', handleToggle);
  });

  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavigation);
  });

  // Close modal when clicking outside
  document.getElementById('profileModal').addEventListener('click', (e) => {
    if (e.target.id === 'profileModal') {
      closeModal();
    }
  });
}

// Toggle switch handler
function handleToggle(e) {
  const toggle = e.currentTarget;
  toggle.classList.toggle('active');
  
  // Visual feedback
  toggle.style.transform = 'scale(1.1)';
  setTimeout(() => {
    toggle.style.transform = 'scale(1)';
  }, 200);
  
  saveSettings();
  
  // Show feedback
  const isActive = toggle.classList.contains('active');
  const label = toggle.previousElementSibling.textContent;
  showToast(`${label} ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
}

// Navigation handler
function handleNavigation(e) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  e.currentTarget.classList.add('active');
  
  // Visual feedback
  e.currentTarget.style.transform = 'scale(0.9)';
  setTimeout(() => {
    e.currentTarget.style.transform = 'scale(1)';
  }, 150);
}

// Profile Management
function openProfileModal() {
  document.getElementById('profileModal').classList.add('active');
  loadProfile();
}

function closeModal() {
  document.getElementById('profileModal').classList.remove('active');
}

function saveProfile() {
  const profile = {
    name: getValue('#receiverName'),
    phone: getValue('#phoneNumber'),
    address: getValue('#address'),
    postalCode: getValue('#postalCode'),
    updatedAt: new Date().toISOString()
  };
  
  // Validation
  if (!profile.name || !profile.phone) {
    showToast('Nama dan nomor HP wajib diisi');
    return;
  }
  
  localStorage.setItem('userProfile', JSON.stringify(profile));
  closeModal();
  showToast('Profile berhasil disimpan');
  
  console.log('Profile saved:', profile);
}

function loadProfile() {
  const saved = localStorage.getItem('userProfile');
  if (saved) {
    const profile = JSON.parse(saved);
    setValue('#receiverName', profile.name);
    setValue('#phoneNumber', profile.phone);
    setValue('#address', profile.address);
    setValue('#postalCode', profile.postalCode);
    return profile;
  }
  return null;
}

// Settings Management
function saveSettings() {
  const settings = {
    autoFill: isActive('#autoFillToggle'),
    smartNav: isActive('#smartNavToggle'),
    fillDelay: parseInt(getValue('input[type="number"]')) || 100,
    paymentMethod: getValue('select'),
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem('appSettings', JSON.stringify(settings));
  console.log('Settings saved:', settings);
  
  // Notify content script if in extension context
  notifyContentScript('updateSettings', settings);
}

function loadSavedSettings() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    
    if (settings.autoFill) {
      get('#autoFillToggle').classList.add('active');
    }
    if (settings.smartNav) {
      get('#smartNavToggle').classList.add('active');
    }
    if (settings.fillDelay) {
      setValue('input[type="number"]', settings.fillDelay);
    }
    if (settings.paymentMethod) {
      setValue('select', settings.paymentMethod);
    }
    
    console.log('Settings loaded:', settings);
  }
}

// Test auto-fill function
function testAutoFill() {
  const profile = loadProfile();
  
  if (!profile || !profile.name) {
    showToast('Isi profile terlebih dahulu');
    openProfileModal();
    return;
  }
  
  const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
  
  showToast('Testing auto-fill...');
  console.log('Test data:', profile);
  console.log('Fill delay:', settings.fillDelay || 100, 'ms');
  
  // Simulate fill process
  setTimeout(() => {
    showToast('Test berhasil! ✓');
  }, 1000);
}

// Quick action from FAB
function quickAction() {
  const isAutoFillActive = isActive('#autoFillToggle');
  
  if (!isAutoFillActive) {
    showToast('Aktifkan Auto-Fill terlebih dahulu');
    return;
  }
  
  const profile = loadProfile();
  if (!profile || !profile.name) {
    showToast('Lengkapi profile terlebih dahulu');
    openProfileModal();
    return;
  }
  
  showToast('Auto-fill siap digunakan!');
  notifyContentScript('triggerAutoFill', profile);
}

// Show tutorial
function showTutorial() {
  const tutorial = `
📖 Cara Penggunaan:

1️⃣ Isi Profile
   • Klik "Edit Data"
   • Masukkan nama, nomor HP, dan alamat
   • Klik "Simpan"

2️⃣ Aktifkan Auto-Fill
   • Toggle "Auto-Fill Mode"
   • Atur kecepatan fill sesuai kebutuhan

3️⃣ Gunakan di TikTok Shop
   • Buka TikTok Shop
   • Saat checkout, data akan terisi otomatis
   • Klik tombol "Bayar" untuk menyelesaikan

⚠️ Catatan:
• Aplikasi hanya mengisi form
• Anda tetap perlu konfirmasi manual
• Data disimpan lokal di perangkat

Selamat berbelanja! 🛍️
  `;
  
  alert(tutorial);
}

// Manage addresses (future feature)
function manageAddresses() {
  showToast('Fitur alamat tersimpan akan segera hadir');
  
  // Future implementation: multiple saved addresses
  console.log('Manage addresses clicked');
}

// Notify content script (for extension mode)
function notifyContentScript(action, data) {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: action,
          data: data
        });
      }
    });
  }
  
  // For PWA mode, use BroadcastChannel
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('shop-assistant');
    channel.postMessage({ action, data });
    channel.close();
  }
}

// Toast notification
function showToast(message) {
  const toast = get('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Helper functions
function get(selector) {
  return document.querySelector(selector);
}

function getValue(selector) {
  const el = get(selector);
  return el ? el.value : '';
}

function setValue(selector, value) {
  const el = get(selector);
  if (el) el.value = value || '';
}

function isActive(selector) {
  const el = get(selector);
  return el ? el.classList.contains('active') : false;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveProfile,
    loadProfile,
    saveSettings,
    loadSavedSettings
  };
}
