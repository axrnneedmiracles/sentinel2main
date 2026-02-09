import pickle
import pandas as pd
import os
import sys

from extract_features import ScamFeatureExtractor

class ScamDetector:
    """Real-time scam detection system"""
    
    def __init__(self, model_path=None):
        """Load trained model"""
        if model_path is None:
            # Get project root
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            model_path = os.path.join(project_root, 'model', 'scam_detector.pkl')
        
        print("Loading scam detection model...")
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.extractor = model_data['feature_extractor']
        self.feature_columns = model_data['feature_columns']
        
        print("✓ Model loaded successfully\n")
    
    def analyze_page(self, text):
        """Analyze a web page and return scam score"""
        
        # Extract features
        features = self.extractor.extract_features(text)
        
        # Convert to DataFrame
        features_df = pd.DataFrame([features])
        features_df = features_df[self.feature_columns]
        
        # Predict
        prediction = self.model.predict(features_df)[0]
        probability = self.model.predict_proba(features_df)[0]
        
        scam_probability = probability[1]
        scam_score = int(scam_probability * 100)
        
        # Determine risk level
        if scam_score >= 70:
            risk_level = "HIGH RISK"
            color = "🔴"
        elif scam_score >= 40:
            risk_level = "SUSPICIOUS"
            color = "🟡"
        else:
            risk_level = "SAFE"
            color = "🟢"
        
        # Get contributing factors
        contributing_factors = self._get_contributing_factors(features)
        
        result = {
            'is_scam': bool(prediction),
            'scam_score': scam_score,
            'risk_level': risk_level,
            'color': color,
            'probability': {
                'safe': round(probability[0] * 100, 2),
                'scam': round(probability[1] * 100, 2)
            },
            'contributing_factors': contributing_factors
        }
        
        return result
    
    def _get_contributing_factors(self, features):
        """Identify which features contributed to the prediction"""
        factors = []
        
        if features['urgency_count'] > 0:
            factors.append(f"Contains {features['urgency_count']} urgency keywords")
        
        if features['threat_count'] > 0:
            factors.append(f"Contains {features['threat_count']} threat words")
        
        if features['sensitive_data_count'] > 0:
            factors.append(f"Requests {features['sensitive_data_count']} types of sensitive data")
        
        if features['requests_card_cvv']:
            factors.append("Requests both card number AND CVV")
        
        if features['exclamation_count'] > 2:
            factors.append(f"Excessive exclamation marks ({features['exclamation_count']})")
        
        if features['caps_ratio'] > 0.2:
            factors.append(f"High capitalization ratio ({features['caps_ratio']:.1%})")
        
        if features['has_urgency_pattern']:
            factors.append("Uses urgent action language pattern")
        
        if features['has_verification_pattern']:
            factors.append("Requests account/identity verification")
        
        return factors
    
    def print_analysis(self, text, result):
        """Pretty print the analysis results"""
        print("\n" + "="*60)
        print(f"{result['color']} SCAM DETECTION RESULT")
        print("="*60)
        print(f"\nRisk Level: {result['risk_level']}")
        print(f"Scam Score: {result['scam_score']}/100")
        print(f"\nProbability:")
        print(f"  Safe: {result['probability']['safe']}%")
        print(f"  Scam: {result['probability']['scam']}%")
        
        if result['contributing_factors']:
            print(f"\n⚠️  Red Flags Detected:")
            for i, factor in enumerate(result['contributing_factors'], 1):
                print(f"  {i}. {factor}")
        else:
            print("\n✓ No major red flags detected")
        
        print("\n" + "="*60)

def main():
    """Demo the scam detector"""
    
    detector = ScamDetector()
    
    test_cases = [
        {
            'name': 'Obvious Scam',
            'text': "URGENT! Your account has been suspended. Enter card number, CVV NOW!!!"
        },
        {
            'name': 'Legitimate Page',
            'text': "Welcome to our store. Browse products with secure checkout. Free shipping over $50."
        },
        {
            'name': 'Subtle Scam',
            'text': "Your KYC verification is pending. Please provide your card details to complete verification."
        }
    ]
    
    for test in test_cases:
        print(f"\n{'='*60}")
        print(f"TEST: {test['name']}")
        print(f"{'='*60}")
        print(f"Text: {test['text']}\n")
        
        result = detector.analyze_page(test['text'])
        detector.print_analysis(test['text'], result)

if __name__ == "__main__":
    main()