// --- CONFIGURATION ---
const synth = window.speechSynthesis;
// Browser compatibility check
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// --- DOM ELEMENTS ---
const statusText = document.getElementById("statusText");
const voiceIcon = document.getElementById("voiceIcon");
const transcriptDiv = document.getElementById("transcript");
const btnMic = document.getElementById("btnMic"); // Ensure you have this ID in HTML if using button

// --- HELPER: SEND MESSAGE TO CONTENT SCRIPT ---
function sendMessage(type) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type });
        }
    });
}

// --- HELPER: SPEAK TEXT ---
function speak(text, callback) {
    if (synth.speaking) synth.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    utterance.onend = () => {
        if (callback) callback();
    };
    
    synth.speak(utterance);
}

// --- VOICE RECOGNITION SETUP ---
if (Recognition) {
    recognition = new Recognition();
    recognition.continuous = false; // Stop after one command
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // 1. SUCCESS: We got a result
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        transcriptDiv.innerText = `Heard: "${command}"`;
        transcriptDiv.style.color = "green";
        processCommand(command);
    };

    // 2. END: Listening stopped
    recognition.onend = () => {
        voiceIcon.classList.remove("listening");
        statusText.innerText = "Idle";
    };

    // 3. ERROR: Detailed Logging
    recognition.onerror = (event) => {
        voiceIcon.classList.remove("listening");
        if (event.error === 'not-allowed') {
            statusText.innerText = "⚠️ Mic Access Denied";
            transcriptDiv.innerText = "Click the extension icon -> Manage Extensions -> Details -> Site Settings -> Allow Microphone.";
            transcriptDiv.style.color = "red";
        } else if (event.error === 'no-speech') {
            statusText.innerText = "⚠️ No speech detected";
        } else {
            statusText.innerText = "Error: " + event.error;
        }
    };
} else {
    statusText.innerText = "Browser doesn't support Voice.";
}

// --- LISTENING TRIGGER ---
function startListening() {
    if (!recognition) return;
    
    // Stop speaking before listening (prevents listening to itself)
    if (synth.speaking) synth.cancel();

    try {
        recognition.start();
        statusText.innerText = "Listening...";
        voiceIcon.classList.add("listening");
        transcriptDiv.innerText = "Speak now...";
        transcriptDiv.style.color = "#555";
    } catch (e) {
        // Recognition is already active
        console.log("Mic busy");
    }
}

// --- COMMAND PARSER ---
function processCommand(command) {
    // Navigation
    if (command.includes("google")) {
        speak("Opening Google", () => chrome.tabs.create({ url: "https://google.com" }));
    } 
    else if (command.includes("news")) {
        speak("Opening News", () => chrome.tabs.create({ url: "https://bbc.com/news" }));
    }
    else if(command.includes("youtube")){
        speak("Opening Youtube", ()=> chrome.tabs.create({url: "https://youtube.com"}));
    }
    
    // Features
    else if (command.includes("contrast") || command.includes("dark")) {
        speak("Toggling contrast");
        sendMessage("TOGGLE_CONTRAST");
    }
    else if (command.includes("dyslexia") || command.includes("font")) {
        speak("Changing font");
        sendMessage("TOGGLE_DYSLEXIA");
    }
    else if (command.includes("read") || command.includes("speak")) {
        speak("Reading selection");
        sendMessage("READ_SELECTION");
    }
    else if (command.includes("simplify") || command.includes("explain")) {
        speak("Simplifying text");
        sendMessage("SIMPLIFY_SELECTION");
    }
    else if (command.includes("image") || command.includes("fix")) {
        speak("Fixing images");
        sendMessage("FIX_IMAGES");
    }
    else {
        speak("I didn't understand. Please try again.");
    }
}

// --- INITIALIZATION ---
window.onload = () => {
    // 1. Initial Greeting
    setTimeout(() => {
        speak("I am ready. Click the mic to speak.", null);
    }, 500);

    // 2. Bind Mic Icon Click
    if (voiceIcon) {
        voiceIcon.onclick = startListening;
    }
};

// --- BIND MANUAL BUTTONS ---
document.getElementById("btnContrast").onclick = () => sendMessage("TOGGLE_CONTRAST");
document.getElementById("btnDyslexia").onclick = () => sendMessage("TOGGLE_DYSLEXIA");
document.getElementById("btnRead").onclick = () => sendMessage("READ_SELECTION");
document.getElementById("btnSimplify").onclick = () => {
    statusText.innerText = "Thinking...";
    sendMessage("SIMPLIFY_SELECTION");
};
document.getElementById("btnImages").onclick = () => {
    statusText.innerText = "Scanning...";
    sendMessage("FIX_IMAGES");
};