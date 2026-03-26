from main import predict, PredictionRequest

req = PredictionRequest()
print("Testing predict function...")
res = predict(req)

print(f"Predicted Income: {res['predicted_income']}")
print("SHAP values top features:")
for item in res['shap_values']['positive']:
    print(f"  + {item['feature']}: {item['value']:.2f}")
for item in res['shap_values']['negative']:
    print(f"  - {item['feature']}: {item['value']:.2f}")

print("Test Passed!")
