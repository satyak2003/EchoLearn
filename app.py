from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

API_KEY  = os.getenv("GEMINI_API_KEY")

genai.configure(api_key = API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

@app.route('/simplify', methods=['POST'])
def simplify():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"simplified": "No text provided."})

    try:
        prompt = f"""
        Act as an accessibility assistant. 
        1. Summarize the following text in very simple English (bullet points).
        2. Explain any difficult words.
        
        Text: {text[:2000]}
        """
        
        response = model.generate_content(prompt)
        return jsonify({"simplified": response.text})
        
    except Exception as e:
        print(f"AI Error: {e}")
        return jsonify({"simplified": "AI Service Unavailable (Check API Key)."})

if __name__ == '__main__':
    app.run(port=5000, debug=True)