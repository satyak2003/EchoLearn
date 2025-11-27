// --- STATE ---
let contrastActive = false;
let dyslexiaActive = false;
let overlay = null;

// --- LISTENERS ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TOGGLE_CONTRAST") toggleContrast();
    if (request.type === "TOGGLE_DYSLEXIA") toggleDyslexia();
    if (request.type === "READ_SELECTION") readSelection();
    if (request.type === "SIMPLIFY_SELECTION") simplifyText();
    // if (request.type === "FIX_IMAGES") fixImages();
});

// --- HELPER: SPEECH ---
function speakText(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// --- FEATURES ---

function readSelection() {
    const text = window.getSelection().toString();
    if (text) {
        speakText(text);
    } else {
        alert("Please highlight text first.");
    }
}

function toggleContrast() {
    contrastActive = !contrastActive;
    if (contrastActive) {
        document.body.classList.add('access-high-contrast');
        const style = document.createElement('style');
        style.id = 'access-contrast';
        style.innerHTML = `
            html, body, div, p, span, h1, h2, h3, h4, h5, h6 { 
                background-color: #000000 !important; 
                color: #FFFF00 !important; 
                border-color: #FFFF00 !important;
            }
            a { color: #00FFFF !important; text-decoration: underline !important; }
            img, video { filter: grayscale(100%) contrast(120%) !important; }
        `;
        document.head.appendChild(style);
        speakText("High contrast mode enabled.");
    } else {
        document.body.classList.remove('access-high-contrast');
        document.getElementById('access-contrast')?.remove();
        speakText("High contrast mode disabled.");
    }
}

function toggleDyslexia() {
    dyslexiaActive = !dyslexiaActive;
    if (dyslexiaActive) {
        const style = document.createElement('style');
        style.id = 'access-dyslexia';
        style.innerHTML = `
            * { 
                font-family: 'Comic Sans MS', sans-serif !important; 
                line-height: 2.0 !important; 
                letter-spacing: 0.1em !important; 
                word-spacing: 0.2em !important;
            }
        `;
        document.head.appendChild(style);
        speakText("Dyslexia font enabled.");
    } else {
        document.getElementById('access-dyslexia')?.remove();
        speakText("Dyslexia font disabled.");
    }
}

async function simplifyText() {
    const text = window.getSelection().toString();
    if (!text) { 
        speakText("Please select some text to simplify.");
        return; 
    }

    showOverlay("Thinking...", true);
    speakText("Simplifying text. Please wait.");

    try {
        const response = await fetch('http://127.0.0.1:5000/simplify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        const data = await response.json();
        
        // 1. Show Visuals
        const formattedHTML = formatAIResponse(data.simplified);
        showOverlay(formattedHTML, false);
        
        // 2. Read Aloud (Clean text first)
        // We remove markdown symbols like ** or # for smoother speech
        const speechSafeText = data.simplified.replace(/\*\*/g, "").replace(/#/g, "");
        speakText("Here is the summary: " + speechSafeText);
        
    } catch (err) {
        showOverlay("Error: Is Python backend running?", false);
        speakText("I could not connect to the A I server.");
    }
}


// --- FORMATTING HELPERS ---
function formatAIResponse(text) {
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safeText = safeText.replace(/^#\s+(.*)$/gm, "<h2>$1</h2>");
    safeText = safeText.replace(/^##\s+(.*)$/gm, "<h3>$1</h3>");
    safeText = safeText.replace(/^\*\s+(.*)$/gm, "<li>$1</li>");
    safeText = safeText.replace(/^-\s+(.*)$/gm, "<li>$1</li>");
    safeText = safeText.replace(/\n/g, "<br>");
    return safeText;
}

// --- UI OVERLAY ---
function showOverlay(content, isLoading = false) {
    if (overlay) overlay.remove();
    
    overlay = document.createElement('div');
    overlay.className = "openaccess-overlay"; 
    
    let innerHTML = "";
    
    if (isLoading) {
        innerHTML = `
            <div class="oa-content-box" style="text-align:center;">
                <h2>🧠 AI Analysis</h2>
                <div class="oa-spinner"></div>
                <p>Simplifying complex text for you...</p>
            </div>
        `;
    } else {
        innerHTML = `
            <button id="oaCloseBtn" class="oa-close-btn">Close X</button>
            <div class="oa-content-box">
                <h2>🧠 Simplified Summary</h2>
                <div>${content}</div>
            </div>
        `;
    }

    overlay.innerHTML = innerHTML;
    document.body.appendChild(overlay);
    
    const closeBtn = document.getElementById('oaCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.remove();
            window.speechSynthesis.cancel(); // Stop speaking when closed
        };
    }
}