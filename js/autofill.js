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

  // Fill all detected fields with delay
  async fillFields(fieldMap) {
    let fillDelay = 0;

    for (let [key, field] of Object.entries(fieldMap)) {
      const value = this.profile[key];
      if (value) {
        // Wait before filling each field
        await this.sleep(fillDelay);
        this.fillField(field, value);
        // Increment delay for next field
        fillDelay = this.delay;
      }
    }
  }

  // Fill single field with animation
  fillField(element, value) {
    this.log(`Filling ${element.name || element.id || 'field'} with: ${value}`);

    // Focus element
    element.focus();
    
    // Clear existing value
    element.value = '';
    
    // Simulate typing effect
    this.simulateTyping(element, value);
  }

  // Simulate typing for more natural filling
  async simulateTyping(element, value) {
    // For faster performance, just set the value directly
    // If you want typing effect, uncomment the code below
    
    element.value = value;
    this.triggerEvents(element);
    
    /* 
    // Typing effect (optional - slower but more realistic)
    for (let i = 0; i < value.length; i++) {
      element.value = value.substring(0, i + 1);
      this.triggerEvents(element);
      await this.sleep(10); // Small delay between characters
    }
    */
    
    // Blur after filling
    setTimeout(() => element.blur(), 50);
  }

  // Trigger necessary events for form validation
  triggerEvents(element) {
    // Trigger input event
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: element.value
    });
    element.dispatchEvent(inputEvent);

    // Trigger change event
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(changeEvent);

    // Some forms listen to keyup
    const keyupEvent = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'a',
      keyCode: 65
    });
    element.dispatchEvent(keyupEvent);
  }

  // Sleep/delay helper function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Debug logging
  log(...args) {
    if (this.debug) {
      console.log('[AutoFill]', ...args);
    }
  }

  // Get fill statistics
  getStats() {
    const filled = {};
    for (let key in this.profile) {
      if (this.profile[key]) {
        filled[key] = true;
      }
    }
    return {
      totalFields: Object.keys(this.profile).length,
      filledFields: Object.keys(filled).length,
      delay: this.delay
    };
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
