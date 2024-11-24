import base64
import json

# Data you want to share
data = {
    "selectedDemographic": "race",
    "selectedValues": ["Asian", "Mixed", "Black", "Hispanic"],
    "selectedSecondDemographic": "age",
    "selectedSecondValues": ["18-26", "27-35", "36-44", "45-53"],
    "graphedData": [
        {"accuracy": 1, "combination_label": "18-26 Asian", "feature1": "18-26", "feature2": "Asian"},
        {"accuracy": 0.88, "combination_label": "18-26 Black", "feature1": "18-26", "feature2": "Black"},
        {"accuracy": 1, "combination_label": "27-35 Asian", "feature1": "27-35", "feature2": "Asian"},
    ]
}

# Convert data to JSON and encode it into Base64
encoded_data = base64.b64encode(json.dumps(data).encode('utf-8')).decode('utf-8')
print(encoded_data)

decoded_data = base64.b64decode(encoded_data).decode('utf-8')

# Convert the decoded data (JSON string) back into a dictionary
data = json.loads(decoded_data)

# Now you can access the data
print(data)


