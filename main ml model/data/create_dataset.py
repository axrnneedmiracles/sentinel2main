import pandas as pd

data = {
    'text': [
        # SCAM examples
        "URGENT! Your account has been suspended. Verify your card number and CVV immediately to restore access. Click here now!",
        "Security Alert: Unauthorized activity detected. Enter your card number, expiry date, and CVV to verify your identity.",
        "Your KYC verification is pending. Submit your card details NOW or your account will be blocked permanently!",
        "Congratulations! You've won $1000. Provide your card number and CVV to claim your prize. Limited time offer!",
        "IMMEDIATE ACTION REQUIRED: Your account will be deactivated. Confirm your PIN and card number within 24 hours.",
        "Bank Notice: Re-verify your account by entering card number, CVV, and OTP. Failure will result in suspension.",
        "Your payment failed. Update your CVV and card expiry date immediately to avoid service interruption!!!",
        "VERIFY NOW: Suspicious login detected. Enter your password and card details to secure your account.",
        
        # SAFE examples
        "Welcome to our store. Browse our collection of products and enjoy free shipping on orders over $50.",
        "Your order has been confirmed. Track your shipment using the link in your email. Thank you for shopping with us.",
        "Accepted payment methods: Visa, Mastercard, PayPal. All transactions are encrypted and secure.",
        "Contact our customer support team Monday through Friday, 9 AM to 5 PM. We're here to help!",
        "Sign up for our newsletter to receive exclusive deals and updates. Unsubscribe anytime.",
        "Product specifications: Made from high-quality materials. Available in multiple colors and sizes.",
        "About Us: We've been serving customers since 2010. Read our reviews and learn about our mission.",
        "Privacy Policy: We protect your data. Learn how we collect, use, and safeguard your information.",
        
        # More SCAM examples
        "Click here to verify your account NOW! Enter card number and CVV or lose access forever!!!",
        "FROZEN ACCOUNT: Provide your debit card details and PIN to unfreeze immediately.",
        "Last chance! Your account expires today. Confirm your card information right now.",
        "Security breach detected! Update your password and enter card details to prevent unauthorized access.",
        
        # More SAFE examples
        "Returns accepted within 30 days. Items must be unused with original packaging.",
        "Delivery estimated in 3-5 business days. Tracking information will be provided.",
        "Our team is committed to quality service. Read customer testimonials on our homepage.",
        "FAQ: Find answers to common questions about shipping, returns, and product care."
    ],
    'label': [
        # Labels: 1 = SCAM, 0 = SAFE
        1, 1, 1, 1, 1, 1, 1, 1,  # First 8 are scams
        0, 0, 0, 0, 0, 0, 0, 0,  # Next 8 are safe
        1, 1, 1, 1,              # 4 more scams
        0, 0, 0, 0               # 4 more safe
    ]
}

df = pd.DataFrame(data)
df.to_csv('scam_data.csv', index=False)
print(f"Created training dataset with {len(df)} examples")
print(f"Scam examples: {sum(df['label'])}")
print(f"Safe examples: {len(df) - sum(df['label'])}")