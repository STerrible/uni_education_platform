import os
import sys

# Set default dummy environment variables for configuration to avoid validation errors if .env is missing
os.environ.setdefault("SECRET_KEY", "dummy_secret_key_for_openapi_generation")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import yaml
from app.main import app

def generate_openapi():
    print("Generating openapi.yaml...")
    try:
        # Retrieve the OpenAPI schema dictionary from FastAPI
        openapi_schema = app.openapi()
        
        # Write to openapi.yaml in the root directory
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(root_dir, "openapi.yaml")
        
        with open(output_path, "w", encoding="utf-8") as f:
            yaml.dump(openapi_schema, f, allow_unicode=True, sort_keys=False)
            
        print(f"✅ openapi.yaml successfully generated at: {output_path}")
    except Exception as e:
        print(f"❌ Failed to generate openapi.yaml: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    generate_openapi()
