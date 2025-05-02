let voltage, current, resistance, power;
let lastEditedFields = [];  // Array to store last two edited fields
let voltageUnit = 'V';  // Track current voltage unit
let currentUnit = 'A';  // Track current current unit
let resistanceUnit = 'Ω';  // Track current resistance unit
let powerUnit = 'W';  // Track current power unit

function pretty(n, d = 4) {
    if (n === 0) return "0";
    if (isNaN(n)) return "NaN";
    if (!isFinite(n)) return n.toString();

    // Check if the number is a whole number
    if (Number.isInteger(n)) {
        return n.toString();
    }

    // Convert to string with fixed decimal places
    let str = Number(n).toFixed(d);
    // Remove trailing zeros after decimal point
    str = str.replace(/\.?0+$/, '');
    return str;
}

function addChangeAnimation(element, value) {
    element.classList.remove('value-changed', 'error-changed');
    
    if (value === "NaN" || value === "" || Number.isNaN(Number(value))) {
        element.classList.add('error-changed');
    } else {
        element.classList.add('value-changed');
    }

    element.addEventListener('animationend', () => {
        element.classList.remove('value-changed', 'error-changed');
    }, {once: true});
}

function parseAll(f) {
    voltage = parseFloat(f.voltage.value);
    current = parseFloat(f.current.value);
    resistance = parseFloat(f.resistance.value);
    power = parseFloat(f.power.value);
}

function updateLastEdited(fieldName) {
    // Remove the field if it's already in the array
    lastEditedFields = lastEditedFields.filter(f => f !== fieldName);
    // Add the field to the beginning of the array
    lastEditedFields.unshift(fieldName);
    // Keep only the last two edited fields
    if (lastEditedFields.length > 2) {
        lastEditedFields.pop();
    }
}

function getBestUnit(value, field) {
    // If value is 0, use base unit
    if (value === 0) {
        switch (field) {
            case 'voltage': return 'V';
            case 'current': return 'A';
            case 'resistance': return 'Ω';
            case 'power': return 'W';
        }
    }
    
    // For values >= 1000 in milli units, use base unit
    if (Math.abs(value) >= 1000) {
        switch (field) {
            case 'voltage': return 'V';
            case 'current': return 'A';
            case 'resistance': return 'Ω';
            case 'power': return 'W';
        }
    }
    
    // For values < 1 in base units, use milli unit
    if (Math.abs(value) < 1) {
        switch (field) {
            case 'voltage': return 'mV';
            case 'current': return 'mA';
            case 'resistance': return 'mΩ';
            case 'power': return 'mW';
        }
    }
    
    // For values between 1 and 1000, use base unit
    switch (field) {
        case 'voltage': return 'V';
        case 'current': return 'A';
        case 'resistance': return 'Ω';
        case 'power': return 'W';
    }
}

function updateFieldWithBestUnit(f, field, value) {
    const newUnit = getBestUnit(value, field);
    if (newUnit) {
        const button = f[field].nextElementSibling;
        const displayValue = newUnit.startsWith('m') ? value * 1000 : value / 1000;
        f[field].value = pretty(displayValue);
        button.textContent = newUnit;
        
        // Update the unit state
        switch (field) {
            case 'voltage': voltageUnit = newUnit; break;
            case 'current': currentUnit = newUnit; break;
            case 'resistance': resistanceUnit = newUnit; break;
            case 'power': powerUnit = newUnit; break;
        }
    } else {
        f[field].value = pretty(value);
    }
}

function calculateFromLastEdited(f) {
    if (lastEditedFields.length < 2) return;

    const [field1, field2] = lastEditedFields;
    let val1 = parseFloat(f[field1].value);
    let val2 = parseFloat(f[field2].value);

    if (isNaN(val1) || isNaN(val2)) return;

    // Convert values to base units before calculations
    if (field1 === 'voltage' && voltageUnit === 'mV') val1 = val1 / 1000;
    if (field1 === 'current' && currentUnit === 'mA') val1 = val1 / 1000;
    if (field1 === 'resistance' && resistanceUnit === 'mΩ') val1 = val1 / 1000;
    if (field1 === 'power' && powerUnit === 'mW') val1 = val1 / 1000;

    if (field2 === 'voltage' && voltageUnit === 'mV') val2 = val2 / 1000;
    if (field2 === 'current' && currentUnit === 'mA') val2 = val2 / 1000;
    if (field2 === 'resistance' && resistanceUnit === 'mΩ') val2 = val2 / 1000;
    if (field2 === 'power' && powerUnit === 'mW') val2 = val2 / 1000;

    let result1, result2;
    switch (field1 + field2) {
        case 'voltagecurrent':
            result1 = val1 / val2;  // resistance
            result2 = val1 * val2;  // power
            updateFieldWithBestUnit(f, 'resistance', result1);
            updateFieldWithBestUnit(f, 'power', result2);
            break;
        case 'currentvoltage':
            result1 = val2 / val1;  // resistance
            result2 = val1 * val2;  // power
            updateFieldWithBestUnit(f, 'resistance', result1);
            updateFieldWithBestUnit(f, 'power', result2);
            break;
        case 'voltageresistance':
            result1 = val1 / val2;  // current
            result2 = (val1 * val1) / val2;  // power
            updateFieldWithBestUnit(f, 'current', result1);
            updateFieldWithBestUnit(f, 'power', result2);
            break;
        case 'resistancevoltage':
            result1 = val2 / val1;  // current
            result2 = (val2 * val2) / val1;  // power
            updateFieldWithBestUnit(f, 'current', result1);
            updateFieldWithBestUnit(f, 'power', result2);
            break;
        case 'voltagepower':
            result1 = val2 / val1;  // current
            result2 = (val1 * val1) / val2;  // resistance
            updateFieldWithBestUnit(f, 'current', result1);
            updateFieldWithBestUnit(f, 'resistance', result2);
            break;
        case 'powervoltage':
            result1 = val1 / val2;  // current
            result2 = (val2 * val2) / val1;  // resistance
            updateFieldWithBestUnit(f, 'current', result1);
            updateFieldWithBestUnit(f, 'resistance', result2);
            break;
        case 'currentresistance':
            result1 = val1 * val2;  // voltage
            result2 = val1 * val1 * val2;  // power
            updateFieldWithBestUnit(f, 'voltage', result1);
            updateFieldWithBestUnit(f, 'power', result2);
            break;
        case 'resistancecurrent':
            result1 = val2 * val1;  // voltage
            result2 = val2 * val2 * val1;  // power
            updateFieldWithBestUnit(f, 'voltage', result1);
            updateFieldWithBestUnit(f, 'power', result2);
            break;
        case 'currentpower':
            result1 = val2 / val1;  // voltage
            result2 = val2 / (val1 * val1);  // resistance
            updateFieldWithBestUnit(f, 'voltage', result1);
            updateFieldWithBestUnit(f, 'resistance', result2);
            break;
        case 'powercurrent':
            result1 = val1 / val2;  // voltage
            result2 = val1 / (val2 * val2);  // resistance
            updateFieldWithBestUnit(f, 'voltage', result1);
            updateFieldWithBestUnit(f, 'resistance', result2);
            break;
        case 'resistancepower':
            result1 = Math.sqrt(val2 * val1);  // voltage
            result2 = Math.sqrt(val2 / val1);  // current
            updateFieldWithBestUnit(f, 'voltage', result1);
            updateFieldWithBestUnit(f, 'current', result2);
            break;
        case 'powerresistance':
            result1 = Math.sqrt(val1 * val2);  // voltage
            result2 = Math.sqrt(val1 / val2);  // current
            updateFieldWithBestUnit(f, 'voltage', result1);
            updateFieldWithBestUnit(f, 'current', result2);
            break;
    }
}

function toggleVoltageUnit(button) {
    const form = document.forms.convert;
    const voltageInput = form.voltage;
    
    if (voltageUnit === 'V') {
        button.textContent = 'mV';
        voltageUnit = 'mV';
    } else {
        button.textContent = 'V';
        voltageUnit = 'V';
    }
    
    addChangeAnimation(voltageInput, voltageInput.value);
    update_voltage(form);
}

function toggleCurrentUnit(button) {
    const form = document.forms.convert;
    const currentInput = form.current;
    
    if (currentUnit === 'A') {
        button.textContent = 'mA';
        currentUnit = 'mA';
    } else {
        button.textContent = 'A';
        currentUnit = 'A';
    }
    
    addChangeAnimation(currentInput, currentInput.value);
    update_current(form);
}

function toggleResistanceUnit(button) {
    const form = document.forms.convert;
    const resistanceInput = form.resistance;
    
    if (resistanceUnit === 'Ω') {
        button.textContent = 'mΩ';
        resistanceUnit = 'mΩ';
    } else {
        button.textContent = 'Ω';
        resistanceUnit = 'Ω';
    }
    
    addChangeAnimation(resistanceInput, resistanceInput.value);
    update_resistance(form);
}

function togglePowerUnit(button) {
    const form = document.forms.convert;
    const powerInput = form.power;
    
    if (powerUnit === 'W') {
        button.textContent = 'mW';
        powerUnit = 'mW';
    } else {
        button.textContent = 'W';
        powerUnit = 'W';
    }
    
    addChangeAnimation(powerInput, powerInput.value);
    update_power(form);
}

function update_voltage(f) {
    parseAll(f);
    // Convert voltage to base unit (V) for calculations
    if (voltageUnit === 'mV') {
        voltage = voltage / 1000;
    }
    updateLastEdited('voltage');
    calculateFromLastEdited(f);
    update(f);
}

function update_current(f) {
    parseAll(f);
    // Convert current to base unit (A) for calculations
    if (currentUnit === 'mA') {
        current = current / 1000;
    }
    updateLastEdited('current');
    calculateFromLastEdited(f);
    update(f);
}

function update_resistance(f) {
    parseAll(f);
    // Convert resistance to base unit (Ω) for calculations
    if (resistanceUnit === 'mΩ') {
        resistance = resistance / 1000;
    }
    updateLastEdited('resistance');
    calculateFromLastEdited(f);
    update(f);
}

function update_power(f) {
    parseAll(f);
    // Convert power to base unit (W) for calculations
    if (powerUnit === 'mW') {
        power = power / 1000;
    }
    updateLastEdited('power');
    calculateFromLastEdited(f);
    update(f);
}

function update(f) {
    // Add animation to all fields that weren't manually edited
    ['voltage', 'current', 'resistance', 'power'].forEach(key => {

            addChangeAnimation(f[key], f[key].value);

    });
}

function init() {
    // Initialize with default values
    const form = document.forms.convert;
    form.voltage.value = "5";
    form.current.value = "0.05";
    form.resistance.value = "100";
    form.power.value = "0.25";
    // Initialize last edited fields with voltage and current
    lastEditedFields = ['voltage', 'current'];
    // Reset all units to base units
    voltageUnit = 'V';
    currentUnit = 'A';
    resistanceUnit = 'Ω';
    powerUnit = 'W';
}

if (window.attachEvent)
    window.attachEvent("onload", init);
else 
    window.onload = init;

