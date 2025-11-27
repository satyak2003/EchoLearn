function readSelectionAloud() {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;

  const utterance = new SpeechSynthesisUtterance(selectedText);
  utterance.lang = "en-US"; // change if needed
  window.speechSynthesis.cancel(); // stop any current speech
  window.speechSynthesis.speak(utterance);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "READ_SELECTION") {
    readSelectionAloud();
  }
});
