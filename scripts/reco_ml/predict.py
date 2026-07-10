#!/usr/bin/env python3
import argparse
import json
from pathlib import Path


def clamp(value, low=0.0, high=1.0):
    return max(low, min(high, value))


def main():
    parser = argparse.ArgumentParser(description="Score a feature vector with a trained reco model.")
    parser.add_argument("--model", required=True, help="Model JSON path")
    parser.add_argument("--features", required=True, help="Feature JSON object")
    args = parser.parse_args()

    model_path = Path(args.model)
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {args.model}")

    model = json.loads(model_path.read_text(encoding="utf-8"))
    features = json.loads(args.features)

    score = 0.0
    for feature, weight in model.get("deployed_weights", {}).items():
        score += float(weight) * float(features.get(feature, 0.0))

    print(json.dumps({"score": round(clamp(score), 6)}))


if __name__ == "__main__":
    main()

