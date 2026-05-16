from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image as PILImage
import cv2
import os
import tempfile
import time
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib
import requests
from groq import Groq

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Set your Groq API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("⚠️ Please set your Groq API Key from https://console.groq.com")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# Image analysis features detector
def analyze_image_features(image_path):
    """Analyze image using OpenCV to extract features"""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Could not read image file")
    
    # Image properties
    height, width = img.shape
    
    # Detect edges (potential abnormalities)
    edges = cv2.Canny(img, 100, 200)
    edge_density = np.count_nonzero(edges) / (height * width) * 100
    
    # Contrast analysis
    contrast = img.std()
    
    return {
        'dimensions': f'{width}x{height}',
        'contrast': float(contrast),
        'edge_density': float(edge_density),
        'histogram_info': 'Multi-modal distribution detected' if edge_density > 5 else 'Relatively uniform distribution'
    }

# Initialize ML Model for Symptom Prediction
def create_symptom_model():
    # Sample dataset for demonstration
    data = {
        'symptoms': [
            'fever headache fatigue',
            'cough sore throat runny nose',
            'chest pain shortness of breath',
            'nausea vomiting abdominal pain',
            'joint pain swelling redness',
            'rash itching hives',
            'dizziness vertigo balance problems',
            'back pain muscle spasms',
            'fatigue weakness loss of appetite',
            'high blood pressure headache',
            'diabetes frequent urination thirst',
            'asthma wheezing difficulty breathing',
            'depression sadness loss of interest',
            'anxiety panic attacks nervousness',
            'migraine severe headache nausea',
            'arthritis joint stiffness pain',
            'pneumonia cough fever chest pain',
            'flu fever chills body aches',
            'heart attack chest pain arm pain',
            'stroke weakness numbness confusion'
        ],
        'disease': [
            'Viral Infection', 'Common Cold', 'Heart Disease', 'Gastroenteritis',
            'Arthritis', 'Allergic Reaction', 'Vertigo', 'Back Strain',
            'Anemia', 'Hypertension', 'Diabetes', 'Asthma', 'Depression',
            'Anxiety Disorder', 'Migraine', 'Rheumatoid Arthritis',
            'Pneumonia', 'Influenza', 'Myocardial Infarction', 'Cerebrovascular Accident'
        ]
    }
    
    df = pd.DataFrame(data)
    
    # Create pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
        ('clf', MultinomialNB())
    ])
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(df['symptoms'], df['disease'], test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)
    
    return pipeline

# Load or create model
model_path = 'symptom_model.pkl'
if os.path.exists(model_path):
    symptom_model = joblib.load(model_path)
else:
    symptom_model = create_symptom_model()
    joblib.dump(symptom_model, model_path)

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

@app.route('/api/predict-disease', methods=['POST'])
def predict_disease():
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', '')
        
        if not symptoms:
            return jsonify({'error': 'Symptoms are required'}), 400
        
        # Preprocess symptoms
        symptoms = symptoms.lower().strip()
        
        # Predict disease
        prediction = symptom_model.predict([symptoms])[0]
        probabilities = symptom_model.predict_proba([symptoms])[0]
        
        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        diseases = symptom_model.classes_[top_indices]
        probs = probabilities[top_indices]
        
        predictions = [
            {'disease': disease, 'probability': round(prob * 100, 2)}
            for disease, prob in zip(diseases, probs)
        ]
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'input_symptoms': symptoms
        })
    
    except Exception as e:
        print(f"ML prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

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
        new_width = 800
        new_height = int(new_width / aspect_ratio)
        resized_image = image.resize((new_width, new_height), PILImage.LANCZOS)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            temp_path = temp_file.name
            resized_image.save(temp_path, format='PNG', optimize=True)
        
        try:
            # Analyze image features
            image_features = analyze_image_features(temp_path)
            
            # Retry logic for rate limiting
            max_retries = 3
            base_delay = 2
            
            for attempt in range(max_retries):
                try:
                    # Create detailed prompt with image analysis
                    analysis_context = f"""Image Analysis Summary:
- Dimensions: {image_features['dimensions']}
- Contrast Level: {image_features['contrast']:.2f}
- Edge Density: {image_features['edge_density']:.2f}%
- Distribution: {image_features['histogram_info']}

Based on this image analysis, provide a comprehensive medical report."""
                    
                    # Send to Groq for analysis using the SDK
                    message = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {
                                "role": "system",
                                "content": "You are an expert radiologist and medical image analyst. Based on the image analysis data provided, generate a detailed diagnostic report including: imaging characteristics, key findings, diagnostic assessment with confidence levels, potential diagnoses, clinical significance, and patient-friendly summary. Note: This is an AI-assisted analysis for educational purposes only."
                            },
                            {
                                "role": "user",
                                "content": analysis_context
                            }
                        ],
                        max_tokens=2000,
                        temperature=0.7
                    )
                    
                    report = message.choices[0].message.content
                    
                    return jsonify({
                        'success': True,
                        'report': report,
                        'image_features': image_features
                    })
                
                except Exception as e:
                    error_msg = str(e).lower()
                    
                    # Handle rate limiting
                    if '429' in str(e) or 'rate limit' in error_msg or 'too many requests' in error_msg:
                        if attempt < max_retries - 1:
                            delay = base_delay * (2 ** attempt)
                            print(f"Rate limited. Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                            time.sleep(delay)
                            continue
                        else:
                            return jsonify({
                                'success': False,
                                'error': 'Rate limit exceeded. Please try again in a few moments.'
                            }), 429
                    
                    # Handle other errors
                    else:
                        print(f"Error during analysis: {str(e)}")
                        return jsonify({
                            'success': False,
                            'error': f'Analysis failed: {str(e)}'
                        }), 500
        
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
        'tools': ['DuckDuckGo Search'],
        'ml_model': 'Symptom-Disease Predictor (Naive Bayes)',
        'ml_features': 'TF-IDF Vectorization'
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        'message': 'Medical Analysis API is running',
        'endpoints': {
            'analyze': '/api/analyze-image (POST)',
            'predict': '/api/predict-disease (POST)',
            'health': '/health (GET)'
        }
    })

if __name__ == '__main__':
    print("🏥 Medical Image Analysis API starting...")
    print(f"📡 Server running on http://localhost:5000")
    print(f"🔑 API Key configured: {'Yes' if GROQ_API_KEY else 'No'}")
    app.run(host='0.0.0.0', port=5000, debug=True)