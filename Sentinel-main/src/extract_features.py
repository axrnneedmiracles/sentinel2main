import re
import nltk
from nltk.tokenize import word_tokenize
import numpy as np

# Download required NLTK data (runs once)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

class ScamFeatureExtractor:
    """Extract NLP features from web page text for scam detection"""
    
    def __init__(self):
        """Initialize with suspicious keyword dictionaries"""
        
        # Urgency keywords - create pressure to act fast
        self.urgency_words = [
            'urgent', 'immediately', 'now', 'hurry', 'limited time', 
            'act fast', 'expires', 'deadline', 'today only', 'right now',
            'asap', 'quick', 'instant', 'right away'
        ]
        
        # Threat keywords - create fear
        self.threat_words = [
            'suspended', 'blocked', 'frozen', 'locked', 'deactivated',
            'unauthorized', 'breach', 'compromised', 'security alert',
            'unusual activity', 'verify immediately', 'warning', 'alert',
            'closed', 'terminated', 'cancelled'
        ]
        
        # Sensitive data that should never be requested
        self.sensitive_data_keywords = [
            'card number', 'credit card', 'debit card', 'cvv', 'cvc',
            'pin', 'password', 'otp', 'ssn', 'social security',
            'account number', 'routing number', 'expiry date', 'expiration date',
            'date of birth', 'mother maiden name', 'security question',
            'card details', 'banking details'
        ]
        
        # Action phrases - asking users to do something
        self.action_phrases = [
            'click here', 'verify now', 'confirm identity', 'update kyc',
            're-verify', 'validate account', 'enter details', 'submit information',
            'provide details', 'confirm your', 'update your', 'login here',
            'reset password', 'update payment'
        ]
    
    def extract_features(self, text):
        """
        Extract all NLP features from text
        
        Args:
            text (str): Web page text to analyze
            
        Returns:
            dict: Dictionary of feature values
        """
        text_lower = text.lower()
        
        # Tokenize text into words
        try:
            tokens = word_tokenize(text_lower)
        except:
            # Fallback if NLTK fails
            tokens = text_lower.split()
        
        features = {}
        
        # ===== 1. KEYWORD COUNTS =====
        features['urgency_count'] = self._count_keywords(text_lower, self.urgency_words)
        features['threat_count'] = self._count_keywords(text_lower, self.threat_words)
        features['sensitive_data_count'] = self._count_keywords(text_lower, self.sensitive_data_keywords)
        features['action_phrase_count'] = self._count_keywords(text_lower, self.action_phrases)
        
        # ===== 2. LINGUISTIC FEATURES =====
        features['exclamation_count'] = text.count('!')
        features['question_count'] = text.count('?')
        
        # Capitalization ratio (scams often use ALL CAPS)
        if len(text) > 0:
            features['caps_ratio'] = sum(1 for c in text if c.isupper()) / len(text)
        else:
            features['caps_ratio'] = 0
        
        # Multiple exclamation marks (!!!)
        features['multiple_exclamations'] = 1 if '!!' in text else 0
        
        # ALL CAPS words
        features['all_caps_words'] = sum(1 for word in text.split() if word.isupper() and len(word) > 1)
        
        # ===== 3. TEXT STATISTICS =====
        features['text_length'] = len(text)
        features['word_count'] = len(tokens)
        
        # Average word length
        if tokens:
            features['avg_word_length'] = np.mean([len(word) for word in tokens])
        else:
            features['avg_word_length'] = 0
        
        # ===== 4. SUSPICIOUS PATTERNS (Regex) =====
        
        # Pattern: "enter/provide/submit" + "detail/information/data"
        features['has_form_pattern'] = 1 if re.search(
            r'(enter|provide|submit|input)\s+(your\s+)?(detail|information|data|credential)', 
            text_lower
        ) else 0
        
        # Pattern: "verify/confirm/validate" + "account/identity/kyc"
        features['has_verification_pattern'] = 1 if re.search(
            r'(verify|confirm|validate|update)\s+(your\s+)?(account|identity|kyc|detail)', 
            text_lower
        ) else 0
        
        # Pattern: "urgent/immediate/now" + "action/required/verify"
        features['has_urgency_pattern'] = 1 if re.search(
            r'(urgent|immediate|now|today)\s+(action|required|verify|update|confirm)', 
            text_lower
        ) else 0
        
        # ===== 5. CRITICAL SCAM INDICATORS =====
        
        # Requesting BOTH card number AND CVV (huge red flag!)
        features['requests_card_cvv'] = 1 if (
            'card' in text_lower and 
            ('cvv' in text_lower or 'cvc' in text_lower)
        ) else 0
        
        # Requesting multiple types of sensitive data at once
        features['requests_multiple_sensitive'] = 1 if features['sensitive_data_count'] >= 3 else 0
        
        return features
    
    def _count_keywords(self, text, keyword_list):
        """
        Count occurrences of keywords in text
        
        Args:
            text (str): Text to search (already lowercased)
            keyword_list (list): List of keywords to search for
            
        Returns:
            int: Total count of all keywords found
        """
        count = 0
        for keyword in keyword_list:
            count += text.count(keyword)
        return count
    
    def get_feature_names(self):
        """
        Get list of all feature names in order
        
        Returns:
            list: List of feature names
        """
        return [
            'urgency_count',
            'threat_count',
            'sensitive_data_count',
            'action_phrase_count',
            'exclamation_count',
            'question_count',
            'caps_ratio',
            'multiple_exclamations',
            'all_caps_words',
            'text_length',
            'word_count',
            'avg_word_length',
            'has_form_pattern',
            'has_verification_pattern',
            'has_urgency_pattern',
            'requests_card_cvv',
            'requests_multiple_sensitive'
        ]


# ===== TESTING CODE (Optional) =====
if __name__ == "__main__":
    """
    Test the feature extractor with sample texts
    Run with: python extract_features.py
    """
    
    extractor = ScamFeatureExtractor()
    
    # Test case 1: Obvious scam
    scam_text = """
    URGENT! Your account has been SUSPENDED due to security breach!
    Enter your card number, CVV, and PIN immediately to restore access.
    Click here NOW or your account will be permanently deactivated!!!
    """
    
    # Test case 2: Legitimate text
    safe_text = """
    Welcome to our online store. Browse our collection of products.
    We accept secure payments through encrypted checkout.
    Free shipping on orders over $50. Contact support for assistance.
    """
    
    print("="*60)
    print("FEATURE EXTRACTION TEST")
    print("="*60)
    
    print("\n[TEST 1] SCAM TEXT:")
    print("-" * 60)
    print(scam_text.strip())
    print("\nExtracted Features:")
    scam_features = extractor.extract_features(scam_text)
    for feature, value in scam_features.items():
        print(f"  {feature:30s} : {value}")
    
    print("\n" + "="*60)
    print("\n[TEST 2] SAFE TEXT:")
    print("-" * 60)
    print(safe_text.strip())
    print("\nExtracted Features:")
    safe_features = extractor.extract_features(safe_text)
    for feature, value in safe_features.items():
        print(f"  {feature:30s} : {value}")
    
    print("\n" + "="*60)
    print("Feature extraction complete!")