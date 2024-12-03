import os
from dotenv import load_dotenv
import google.generativeai as genai

def test_gemini_api():
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv('GOOGLE_API_KEY')
    print(f"API Key present: {'Yes' if api_key else 'No'}")
    
    if not api_key:
        print("No API key found!")
        return
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create model
        model = genai.GenerativeModel('gemini-pro')
        
        # Test prompt
        response = model.generate_content("Hello, can you analyze this simple test?")
        
        print("Response received:", response.text)
        print("API test successful!")
        
    except Exception as e:
        print(f"Error testing Gemini API: {str(e)}")

if __name__ == "__main__":
    test_gemini_api() 