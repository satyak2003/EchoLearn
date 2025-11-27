# EchoVision: AI Accessibility Assistant
Breaking digital barriers with Voice Navigation & Generative AI.
EchoVision is a light weight browser extension that is designed to aid people who are visually challenged, hearing impaired, limited motor function.

<img width="459" height="537" alt="image" src="https://github.com/user-attachments/assets/56961996-e5c5-4ce2-9fbc-593fca03022c" />

## 🚀 The Problem
Digital Exclusion is a bottleneck. Millions of users with visual impairments, dyslexia, or motor disabilities struggle to navigate the modern web.

- Cost: Assistive tools (like JAWS) cost thousands of dollars.
- Complexity: Content is often too dense or complex to understand.
- Inaccessibility: Most websites lack basic accessibility features.

## 💡 The Solution
EchoLearn is a free, open-source Chrome Extension that acts as a "Digital Ramp" for the web. It combines Google Gemini AI with local browser APIs to transform any website into an accessible experience instantly.

## ✨ Key Features
🎙️ Voice Commander ("Jarvis for Web")
Hands-free navigation for users with motor impairments.
Wake Word: "Helper"
Commands: - "Helper open Facebook"
"Helper scroll down"
"Helper turn on contrast"

🧠 AI Simplification (Powered by Gemini 1.5)
Complex academic or news articles are instantly summarized into simple, easy-to-read bullet points for users with cognitive disabilities.

👁️ Visual Aids
Dyslexia Mode: Changes all fonts to OpenDyslexic (or Comic Sans fallback) and adjusts line spacing.
Smart Contrast: High-contrast neon-on-black mode for low-vision users.

🔊 Text-to-Speech
Integrated screen reader that reads selected text aloud naturally.

🛠️ Tech Stack:
- Frontend: HTML5, CSS3, JavaScript (Manifest V3 Chrome Extension)
- Backend: Python (Flask)

- AI Engine: Google Gemini 2.5 Flash

- Voice: Web Speech API & SpeechSynthesis API

## Installation Guide

Prerequisites
- Google Chrome, Brave, or Edge Browser.
- Python 3.8+ installed.
- A Google Gemini API Key (Get it from Google AI Studio).

Step 1 Setup Backend
- Clone the repository.
Step 2 Navigate to the backend folder:
```
cd backend
```
Step 3 Install dependencies:
```
pip install flask flask-cors google-generativeai python-dotenv
```
Step 4  Create a .env file in the backend folder and add your API Key:
```
GEMINI_API_KEY=your_actual_api_key_here
```
Step 5 Run the server:
```
python app.py
```
- You should see: "Running on https://www.google.com/search?q=http://127.0.0.1:5000"

## Load Extension

- Open Chrome and go to chrome://extensions.

- Enable Developer Mode (top right toggle).

- Click Load Unpacked.

- Select the extension folder from this repository.

- **Important: Pin the EchoLearn icon to your browser toolbar!**

## 🎮 Usage Guide

- Method A: Keyboard Shortcut (Fastest)

Press Alt + E (or Option + U on Mac).
The Voice Assistant will open instantly.
Say "Helper" followed by a command (e.g., "Helper read this").

- Method B: The Menu
Click the EchoLearn icon.
Use the Dyslexia or Contrast buttons to toggle visual modes immediately.
Highlight any text on a webpage and click Simplify to get an AI summary.

## 🔮 Future Roadmap

[ - ] Mobile App: Bring EchoLearn to Android/iOS.

[ - ] Offline Mode: Local LLM integration for use without internet.

[ - ] Sign Language Support: AI avatar that translates text to Sign Language GIFs.

## 👥 The Team

- **_Built by DEVNULL_**

- Sandeep Kumar Jena  - Frontend & Voice Logic
- Satya Karthik R - Backend & AI Integration
- Shamanth S Joshi - UI/UX & Accessibility Research
- Sudhanva H Rao - Documentation & Testing

