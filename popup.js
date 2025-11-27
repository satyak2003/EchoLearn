// Helper to send message to the active tab
function sendMessageToContent(type, data = {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type, ...data });
        }
    });
}

document.getElementById("btnContrast").addEventListener("click", () => {
    sendMessageToContent("TOGGLE_CONTRAST");
});

document.getElementById("btnDyslexia").addEventListener("click", () => {
    sendMessageToContent("TOGGLE_DYSLEXIA");
});

document.getElementById("btnRead").addEventListener("click", () => {
    sendMessageToContent("READ_SELECTION");
    document.getElementById("statusMsg").innerText = "Reading aloud...";
});

document.getElementById("btnSimplify").addEventListener("click", () => {
    sendMessageToContent("SIMPLIFY_SELECTION");
    document.getElementById("statusMsg").innerText = "Analyzing text with AI...";
});

document.getElementById("btnImages").addEventListener("click", () => {
    sendMessageToContent("FIX_IMAGES");
    document.getElementById("statusMsg").innerText = "Scanning images...";
});