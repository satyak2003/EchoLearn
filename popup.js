// --- CONFIGURATION ---
const synth = window.speechSynthesis;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// WAKE WORD: The assistant only obeys if you say this first
const WAKE_WORD = "helper"; 

// --- HELPER MENU ITEMS ---
const HELPER_MENU_ITEMS = [
    "High contrast",
    "Dyslexic mode",
    "Read",
    "Simplify"
];

// --- DOM ELEMENTS ---
const statusText = document.getElementById("statusText");
const voiceIcon = document.getElementById("voiceIcon");
const transcriptDiv = document.getElementById("transcript");

// --- ECHO: SEND MESSAGE TO CONTENT SCRIPT ---
function sendMessage(type) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
            // Prevent running on restricted chrome:// URLs
            if (activeTab.url.startsWith("chrome://") || activeTab.url.startsWith("edge://") || activeTab.url.startsWith("about:")) {
                speak("I cannot modify browser system pages.");
                return;
            }

            // Send message with error handling
            chrome.tabs.sendMessage(activeTab.id, { type })
                .catch(err => {
                    console.warn("Communication error:", err);
                    // This error usually means the content script isn't loaded yet
                    speak("Please refresh the web page to use this feature.");
                    statusText.innerText = "Error: Refresh Page";
                });
        }
    });
}

// --- ECHO: SPEAK TEXT ---
function speak(text) {
    // Cancel any current speech to avoid overlapping
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    synth.speak(utterance);
}

// --- VOICE RECOGNITION SETUP ---
if (Recognition) {
    recognition = new Recognition();
    // CRITICAL: Continuous allows it to stay open waiting for the wake word
    recognition.continuous = true; 
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        // Get the latest result
        const lastResultIndex = event.results.length - 1;
        let command = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
        
        // Remove trailing punctuation
        if (command.endsWith('.')) command = command.slice(0, -1);
        
        // Visual Feedback
        transcriptDiv.innerText = `Heard: "${command}"`;
        
        // CHECK FOR WAKE WORD
        if (command.startsWith(WAKE_WORD)) {
            // Visual success cue
            transcriptDiv.style.color = "green";
            transcriptDiv.style.fontWeight = "bold";
            
            // Strip the wake word to get the actual action
            const action = command.replace(WAKE_WORD, "").trim();
            
            if (action.length > 0) {
                console.log("Executing Action:", action);
                processCommand(action);
            } else {
                speak("I am listening.");
            }
        } else {
            //wake word
            transcriptDiv.style.color = "#999"; // Grey out ignored text
            console.log("Ignored (No wake word):", command);
        }
    };

    recognition.onend = () => {
        // Note: Chrome kills this if popup closes
        try {
            recognition.start(); 
            voiceIcon.classList.add("listening");
        } catch(e) { }
    };

    recognition.onerror = (event) => {
        if (event.error === 'no-speech') return; 
        statusText.innerText = "Error: " + event.error;
        voiceIcon.classList.remove("listening");
    };
}

function startListening() {
    if (!recognition) return;
    try {
        recognition.start();
        statusText.innerText = `Say "${WAKE_WORD}..."`;
        voiceIcon.classList.add("listening");
    } catch (e) {
        console.log("Mic busy");
    }
}

// --- COMMAND PARSER (DYNAMIC WEBSITE LOGIC) ---
function processCommand(command) {
    command = command.trim();

    // MENU: explicit, forgiving matching for "menu"
    if (
        command === "menu" ||
        command === "show menu" ||
        command === "menu please" ||
        command === "show me the menu" ||
        command.includes("menu")
    ) {
        // Build a spoken list with numbers
        const spoken = ["Here are the available helper commands."].concat(
            HELPER_MENU_ITEMS.map((item, i) => `${i + 1}. ${item}.`)
        ).join(" ");
        // Visual feedback
        transcriptDiv.innerText = `Menu: ${HELPER_MENU_ITEMS.join(" • ")}`;
        transcriptDiv.style.color = "blue";
        transcriptDiv.style.fontWeight = "600";
        // Speak the menu
        speak(spoken);
        return;
    }

    if (command.startsWith("open")) {
        // Remove "open" from the string
        let siteName = command.replace("open", "").trim();
        
        // Remove common spaces
        siteName = siteName.replace(/\s+/g, '');

        if (siteName) {
            const url = `https://${siteName}.com`;
            speak(`Opening ${siteName}`);
            chrome.tabs.create({ url: url });
        } else {
            speak("Which website should I open?");
        }
    }

    // 2. ACCESSIBILITY FEATURES
    else if (command.includes("contrast") || command.includes("dark")||command.includes("one")||command.includes("1")) {
        speak("Contrast toggled");
        sendMessage("TOGGLE_CONTRAST");
    }
    else if (command.includes("dyslexia") || command.includes("font") || command.includes("dyslexic")||command.includes("two")||command.includes("2")) {
        speak("Dyslexia mode on");
        sendMessage("TOGGLE_DYSLEXIA");
    }
    else if (command.includes("read") || command.includes("speak")||command.includes("stop reading")||command.includes("three")||command.includes("3")) {
        speak("Reading");
        sendMessage("READ_SELECTION");
    }
    else if (command.includes("simplify") || command.includes("explain")||command.includes("four")||command.includes("4")) {
        speak("Simplifying");
        sendMessage("SIMPLIFY_SELECTION");
    }
    // else if (command.includes("image") || command.includes("fix")||command.includes("five")||command.includes("5")) {
    //     speak("Scanning images");
    //     sendMessage("FIX_IMAGES");
    // }

    // 3. SMOOTH SCROLLING
    else if (command.includes("scroll down") || command.includes("down")) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.startsWith("chrome://")) return; // Safety check
            
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    window.scrollBy({
                        top: 750,
                        left: 0,
                        behavior: "smooth"
                    });
                }
            }).catch(() => speak("Cannot scroll this page."));
        });
        speak("Scrolled Down");
    }


    else if (command.includes("scroll up") || command.includes("up")) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.startsWith("chrome://")) return;

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    window.scrollBy({
                        top: -750,
                        left: 0,
                        behavior: "smooth"
                    });
                }
            }).catch(() => speak("Cannot scroll this page."));
        });
        speak("Scrolled Up");
    }

        
    // 4. FALLBACK, no valid command
    else {
        speak("I am not sure how to do that.");
    }
}

// --- INITIALIZATION ---
window.onload = () => {
    setTimeout(() => {
        startListening();
        // Removed auto-greeting so it doesn't interrupt the user immediately
    }, 250);
    
    if (voiceIcon) voiceIcon.onclick = startListening;
};

// --- MANUAL BUTTONS ---
document.getElementById("btnContrast").onclick = () => sendMessage("TOGGLE_CONTRAST");
document.getElementById("btnDyslexia").onclick = () => sendMessage("TOGGLE_DYSLEXIA");
document.getElementById("btnRead").onclick = () => sendMessage("READ_SELECTION");
document.getElementById("btnSimplify").onclick = () => sendMessage("SIMPLIFY_SELECTION");
// document.getElementById("btnImages").onclick = () => sendMessage("FIX_IMAGES");
