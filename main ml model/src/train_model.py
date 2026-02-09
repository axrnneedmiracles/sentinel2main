import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pickle
import os
import sys

# Import from same directory
from extract_features import ScamFeatureExtractor

def prepare_features(df, extractor):
    """Prepare feature matrix from text data"""
    feature_list = []
    
    for text in df['text']:
        features = extractor.extract_features(text)
        feature_list.append(features)
    
    features_df = pd.DataFrame(feature_list)
    return features_df

def train_model():
    """Train the Random Forest scam detector"""
    
    # Get project root (parent of 'file' directory)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Paths
    data_path = os.path.join(project_root, 'data', 'scam_data.csv')
    model_dir = os.path.join(project_root, 'model')
    
    print("Loading training data...")
    df = pd.read_csv(data_path)
    print(f"✓ Loaded {len(df)} examples")
    print(f"  Scam: {sum(df['label'])}, Safe: {len(df) - sum(df['label'])}")
    
    # Initialize feature extractor
    extractor = ScamFeatureExtractor()
    
    # Extract features
    print("\nExtracting features...")
    X = prepare_features(df, extractor)
    y = df['label']
    
    print(f"✓ Feature matrix shape: {X.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} examples")
    print(f"Test set: {len(X_test)} examples")
    
    # Train Random Forest
    print("\nTraining Random Forest model...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    rf_model.fit(X_train, y_train)
    
    # Evaluate
    print("\n" + "="*60)
    print("MODEL EVALUATION")
    print("="*60)
    y_pred = rf_model.predict(X_test)
    
    print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Safe', 'Scam']))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature importance
    print("\n" + "="*60)
    print("TOP 10 IMPORTANT FEATURES")
    print("="*60)
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"{row['feature']:30s} : {row['importance']:.4f}")
    
    # Save model
    os.makedirs(model_dir, exist_ok=True)
    
    model_data = {
        'model': rf_model,
        'feature_extractor': extractor,
        'feature_columns': list(X.columns)
    }
    
    model_path = os.path.join(model_dir, 'scam_detector.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"\n✓ Model saved to {model_path}")
    
    return rf_model, extractor

if __name__ == "__main__":
    train_model()