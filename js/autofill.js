// Auto-fill engine for form filling

class AutoFillEngine {
  constructor(profileData, options = {}) {
    this.profile = profileData;
    this.delay = options.delay || 100;
    this.debug = options.debug || false;
  }

  // Main fill function
  async fillForm() {
    this.log('Starting auto-fill process...');
    
    const fieldMap = this.detectFields();
    
    if (Object.keys(fieldMap).length === 0) {
      this.log('No form fields detected');
      return false;
    }

    await this.fillFields(fieldMap);
    
    this.log('Auto-fill completed');
    return true;
  }

  // Detect form fields on page
  detectFields() {
    const fields = {};
    
    // Name field patterns
    const nameField = this.findField([
      'input[name*="name"]',
      'input[placeholder*="nama"]',
      'input[id*="name"]',
      'input[autocomplete="name"]'
    ]);
    if (nameField) fields.name = nameField;

    // Phone field patterns
    const phoneField = this.findField([
      'input[name*="phone"]',
      'input[name*="telp"]',
      'input[placeholder*="nomor"]',
      'input[placeholder*="telepon"]',
      'input[type="tel"]',
      'input[autocomplete="tel"]'
    ]);
    if (phoneField) fields.phone = phoneField;

    // Address field patterns
    const addressField = this.findField([
      'textarea[name*="address"]',
      'textarea[placeholder*="alamat"]',
      'input[name*="address"]',
      'input[placeholder*="alamat"]',
      'textarea[autocomplete="street-address"]'
    ]);
    if (addressField) fields.address = addressField;

    // Postal code patterns
    const postalField = this.findField([
      'input[name*="postal"]',
      'input[name*="zip"]',
      'input[placeholder*="kode pos"]',
      'input[autocomplete="postal-code"]'
    ]);
    if (postalField) fields.postalCode = postalField;

    this.log('Detected fields:', Object.keys(fields));
    return fields;
  }

  // Find field by selectors
  findField(selectors) {
    for (let selector of selectors) {
      const field = document.querySelector(selector);
      if (field && this.isVisible(field)) {
        return field;
      }
    }
    return null;
  }

  // Check if element is visible
  isVisible(element) {
    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }

  // Fill all detected fields
  async fillFields(fieldMap) {
    let fillDelay = 0;

    for (let [key, field] of Object.entries(fieldMap)) {
      const value = this.profile[key];
      if (value) {
        await this.delay(fillDelay);
        this.fillField(field, value);
        fillDelay += this.delay;
      }
    }
  }

  // Fill single field
  fillField(element, value) {
    this.log(`Filling ${element.name || element.id} with: ${value}`);

    // Focus element
    element.focus();

    // Set value
    element.value = value;

    // Trigger events to ensure form validation
    this.triggerEvents(element);

    // Blur element
    setTimeout(() => element.blur(), 50);
  }

  // Trigger necessary events
  triggerEvents(element) {
    const events = ['input', 'change', 'blur'];
    
    events.forEach(eventType => {
      const event = new Event(eventType, { 
        bubbles: true,
        cancelable: true 
      });
      element.dispatchEvent(event);
    });

    // Also trigger InputEvent for modern frameworks
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: element.value
    });
    element.dispatchEvent(inputEvent);
  }

  // Delay helper
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Debug logging
  log(...args) {
    if (this.debug) {
      console.log('[AutoFill]', ...args);
    }
  }
}

// Initialize for content script usage
if (typeof window !== 'undefined') {
  window.AutoFillEngine = AutoFillEngine;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoFillEngine;
}
