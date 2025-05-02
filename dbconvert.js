let voltage, current, resistance, power;
let lastEditedFields = [];  // Array to store last two edited fields

function pretty(n, d = 4) {
    if (n === 0) return "0";
    if (isNaN(n)) return "NaN";
    if (!isFinite(n)) return n.toString();

    return Number(n).toFixed(d);
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

function calculateFromLastEdited(f) {
    if (lastEditedFields.length < 2) return;

    const [field1, field2] = lastEditedFields;
    const val1 = parseFloat(f[field1].value);
    const val2 = parseFloat(f[field2].value);

    if (isNaN(val1) || isNaN(val2)) return;

    switch (field1 + field2) {
        case 'voltagecurrent':
            f.resistance.value = pretty(val1 / val2);
            f.power.value = pretty(val1 * val2);
            break;
        case 'currentvoltage':
            f.resistance.value = pretty(val2 / val1);
            f.power.value = pretty(val1 * val2);
            break;
        case 'voltageresistance':
            f.current.value = pretty(val1 / val2);
            f.power.value = pretty((val1 * val1) / val2);
            break;
        case 'resistancevoltage':
            f.current.value = pretty(val2 / val1);
            f.power.value = pretty((val2 * val2) / val1);
            break;
        case 'voltagepower':
            f.current.value = pretty(val2 / val1);
            f.resistance.value = pretty((val1 * val1) / val2);
            break;
        case 'powervoltage':
            f.current.value = pretty(val1 / val2);
            f.resistance.value = pretty((val2 * val2) / val1);
            break;
        case 'currentresistance':
            f.voltage.value = pretty(val1 * val2);
            f.power.value = pretty(val1 * val1 * val2);
            break;
        case 'resistancecurrent':
            f.voltage.value = pretty(val2 * val1);
            f.power.value = pretty(val2 * val2 * val1);
            break;
        case 'currentpower':
            f.voltage.value = pretty(val2 / val1);
            f.resistance.value = pretty(val2 / (val1 * val1));
            break;
        case 'powercurrent':
            f.voltage.value = pretty(val1 / val2);
            f.resistance.value = pretty(val1 / (val2 * val2));
            break;
        case 'resistancepower':
            f.voltage.value = pretty(Math.sqrt(val2 * val1));
            f.current.value = pretty(Math.sqrt(val2 / val1));
            break;
        case 'powerresistance':
            f.voltage.value = pretty(Math.sqrt(val1 * val2));
            f.current.value = pretty(Math.sqrt(val1 / val2));
            break;
    }
}

function update_voltage(f) {
    parseAll(f); 
    updateLastEdited('voltage');
    calculateFromLastEdited(f);
    update(f);   
}

function update_current(f) {
    parseAll(f);
    updateLastEdited('current');
    calculateFromLastEdited(f);
    update(f);
}

function update_resistance(f) {
    parseAll(f);
    updateLastEdited('resistance');
    calculateFromLastEdited(f);
    update(f);
}

function update_power(f) {
    parseAll(f);
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
}

if (window.attachEvent)
    window.attachEvent("onload", init);
else 
    window.onload = init;

