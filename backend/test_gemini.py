from google import genai
from app.config.settings import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

models_to_test = [
    "models/gemini-3.6-flash",
    "models/gemini-3.5-flash",
    "models/gemini-3.1-flash-lite",
    "models/gemini-3-flash-preview",
    "models/gemini-2.5-flash-lite",
    "models/gemini-2.0-flash",
]

for model in models_to_test:
    try:
        print(f"Testing {model}...")
        response = client.models.generate_content(
            model=model,
            contents="Say hello."
        )
        print("✅ Works!")
        print(response.text)
        break
    except Exception as e:
        print(f"❌ {e}\n")