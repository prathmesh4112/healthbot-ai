from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image as PILImage
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.media import Image as AgnoImage
import os
import tempfile
import time
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Set your Groq API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

if not GROQ_API_KEY:
    raise ValueError("⚠️ Please set your Groq API Key from https://console.groq.com")

# Initialize the Medical Agent with Groq
medical_agent = Agent(
    model=Groq(id="meta-llama/llama-4-scout-17b-16e-instruct"),
    tools=[DuckDuckGoTools()],
    markdown=True
)

# Improved Medical Analysis Query
query = """Analyze this medical image as a radiology expert. Provide a comprehensive analysis in the following structure:

## Image Type & Region
Identify the imaging modality (X-ray, MRI, CT, Ultrasound), anatomical region, patient positioning, and assess image quality.

## Key Findings
List all significant observations systematically. Describe any abnormalities, their location, size, and characteristics. Note normal findings as well.

## Diagnostic Assessment
**Primary Diagnosis:** State the most likely diagnosis with confidence level (e.g., "Mild cardiomegaly - 80% confidence")

**Differential Diagnoses:**
1. [Diagnosis 1] - [likelihood %] - [supporting evidence]
2. [Diagnosis 2] - [likelihood %] - [supporting evidence]
3. [Diagnosis 3] - [likelihood %] - [supporting evidence]

**Urgency:** Indicate if findings are routine, urgent, or critical.

## Patient-Friendly Summary
Explain the findings in simple, non-technical language. Use analogies where helpful (e.g., "Think of your heart as a pump that...").

## Clinical Context
Briefly mention standard treatment approaches and relevant medical considerations for the identified condition.

Be thorough, accurate, and structure your response clearly using markdown formatting."""

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    try:
        # Validate image in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Process image
        try:
            image = PILImage.open(file.stream)
        except Exception as e:
            return jsonify({'error': f'Invalid image file: {str(e)}'}), 400
        
        # Resize image for faster processing
        width, height = image.size
        aspect_ratio = width / height
        new_width = 800  # Increased for better analysis
        new_height = int(new_width / aspect_ratio)
        resized_image = image.resize((new_width, new_height), PILImage.LANCZOS)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            temp_path = temp_file.name
            resized_image.save(temp_path, format='PNG', optimize=True)
        
        try:
            # Create AgnoImage object
            agno_image = AgnoImage(filepath=temp_path)
            
            # Retry logic for rate limiting
            max_retries = 3
            base_delay = 2
            
            for attempt in range(max_retries):
                try:
                    # Run AI analysis with timeout
                    response = medical_agent.run(query, images=[agno_image])
                    
                    # Extract content
                    if hasattr(response, 'content'):
                        report = response.content
                    elif isinstance(response, dict):
                        report = response.get('content', str(response))
                    else:
                        report = str(response)
                    
                    return jsonify({
                        'success': True,
                        'report': report
                    })
                
                except Exception as e:
                    error_msg = str(e).lower()
                    
                    # Handle rate limiting
                    if '429' in str(e) or 'rate limit' in error_msg or 'too many requests' in error_msg:
                        if attempt < max_retries - 1:
                            delay = base_delay * (2 ** attempt)  # Exponential backoff
                            print(f"Rate limited. Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                            time.sleep(delay)
                            continue
                        else:
                            return jsonify({
                                'success': False,
                                'error': 'Rate limit exceeded. Please try again in a few moments.'
                            }), 429
                    
                    # Handle model errors
                    elif 'model' in error_msg or 'invalid' in error_msg:
                        return jsonify({
                            'success': False,
                            'error': 'Model configuration error. Please check your API settings.'
                        }), 500
                    
                    # Handle other errors
                    else:
                        print(f"Error during analysis: {str(e)}")
                        raise e
        
        finally:
            # Clean up temporary file
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception as e:
                print(f"Warning: Could not delete temp file: {str(e)}")
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'An unexpected error occurred: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model': 'meta-llama/llama-4-scout-17b-16e-instruct',
        'tools': ['DuckDuckGo Search']
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        'message': 'Medical Analysis API is running',
        'endpoints': {
            'analyze': '/api/analyze-image (POST)',
            'health': '/health (GET)'
        }
    })

if __name__ == '__main__':
    print("🏥 Medical Image Analysis API starting...")
    print(f"📡 Server running on http://localhost:5000")
    print(f"🔑 API Key configured: {'Yes' if GROQ_API_KEY else 'No'}")
    app.run(host='0.0.0.0', port=5000, debug=True)