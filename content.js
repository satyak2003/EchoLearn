// --- 1. STATE VARIABLES ---
let contrastActive = false;
let dyslexiaActive = false;
let overlay = null;

// --- 2. FEATURE: TEXT TO SPEECH ---
function readSelection() {
    const text = window.getSelection().toString();
    if (text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slower for accessibility
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Please highlight some text first!");
    }
}

// --- 3. FEATURE: HIGH CONTRAST ---
function toggleContrast() {
    contrastActive = !contrastActive;
    if (contrastActive) {
        const style = document.createElement('style');
        style.id = 'access-contrast';
        style.innerHTML = `
            html, body, * { background-color: #000 !important; color: #FFFF00 !important; border-color: #FFFF00 !important; }
            img { filter: grayscale(100%) !important; }
            a { text-decoration: underline !important; color: #00FFFF !important; }
        `;
        document.head.appendChild(style);
    } else {
        document.getElementById('access-contrast')?.remove();
    }
}

// --- 4. FEATURE: DYSLEXIA MODE ---
function toggleDyslexia() {
    dyslexiaActive = !dyslexiaActive;
    if (dyslexiaActive) {
        const style = document.createElement('style');
        style.id = 'access-dyslexia';
        style.innerHTML = `
            * { font-family: 'Comic Sans MS', 'Verdana', sans-serif !important; letter-spacing: 0.1em !important; line-height: 2 !important; word-spacing: 0.2em !important; }
            p { margin-bottom: 2em !important; }
        `;
        document.head.appendChild(style);
    } else {
        document.getElementById('access-dyslexia')?.remove();
    }
}

// --- 5. FEATURE: AI SIMPLIFICATION (Backend Call) ---
async function simplifyText() {
    const text = window.getSelection().toString();
    if (!text) {
        alert("Highlight text to simplify!");
        return;
    }

    showOverlay("Thinking...", true);

    try {
        // CALL LOCAL FLASK BACKEND
        const response = await fetch('http://127.0.0.1:5000/simplify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        const data = await response.json();
        showOverlay(data.simplified);
    } catch (err) {
        console.error(err);
        showOverlay("Error: Is your Python backend running?");
    }
}

// --- 6. FEATURE: AI IMAGE ALT TEXT ---
async function fixImages() {
    const images = Array.from(document.querySelectorAll('img')).slice(0, 5); // Limit to 5 for demo speed
    let count = 0;

    for (let img of images) {
        if (!img.alt || img.alt.length < 5) {
            // Mocking the AI call for speed in demo, or call backend like above
            // In a real hackathon, send img.src to backend
            img.style.border = "5px solid lime";
            img.alt = "AI Description: An image containing relevant context.";
            img.title = "AI Description Added";
            count++;
        }
    }
    alert(`Scanned page: Fixed ${count} missing descriptions.`);
}

// --- UI HELPERS ---
function showOverlay(content, isLoading = false) {
    if (overlay) overlay.remove();
    
    overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; width: 300px; 
        background: #fff; color: #000; border: 2px solid #000; 
        padding: 20px; z-index: 999999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        font-family: sans-serif; border-radius: 10px; font-size: 16px;
    `;
    
    overlay.innerHTML = `
        <h3 style="margin-top:0">🧠 Simplification</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            ${isLoading ? '<i>Processing with AI...</i>' : content}
        </div>
        <button id="closeOverlay" style="margin-top:10px; width:100%; padding:5px; cursor:pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    document.getElementById('closeOverlay').onclick = () => overlay.remove();
}

// --- LISTENER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TOGGLE_CONTRAST") toggleContrast();
    if (request.type === "TOGGLE_DYSLEXIA") toggleDyslexia();
    if (request.type === "READ_SELECTION") readSelection();
    if (request.type === "SIMPLIFY_SELECTION") simplifyText();
    if (request.type === "FIX_IMAGES") fixImages();
});