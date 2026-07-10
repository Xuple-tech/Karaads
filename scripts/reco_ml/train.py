#!/usr/bin/env python3
import argparse
import csv
import json
import math
import random
from pathlib import Path


def mse(weights, bias, rows, features):
    if not rows:
        return 0.0
    err = 0.0
    for row in rows:
        y = float(row["label"])
        pred = bias
        for i, f in enumerate(features):
            pred += weights[i] * float(row.get(f, 0.0))
        diff = pred - y
        err += diff * diff
    return err / max(1, len(rows))


def rmse(weights, bias, rows, features):
    return math.sqrt(mse(weights, bias, rows, features))


def train_linear(rows, features, lr=0.02, epochs=600, l2=0.0005):
    if not rows:
        raise ValueError("No training rows provided")

    weights = [0.0 for _ in features]
    bias = sum(float(r["label"]) for r in rows) / len(rows)

    for _ in range(epochs):
        random.shuffle(rows)
        for row in rows:
            y = float(row["label"])
            x = [float(row.get(f, 0.0)) for f in features]

            pred = bias
            for i in range(len(features)):
                pred += weights[i] * x[i]

            err = pred - y
            bias -= lr * 2.0 * err
            for i in range(len(features)):
                grad = 2.0 * err * x[i] + (2.0 * l2 * weights[i])
                weights[i] -= lr * grad

    return weights, bias


def normalized_abs_weights(weights, features):
    abs_vals = [abs(w) for w in weights]
    total = sum(abs_vals)
    if total <= 1e-12:
        return {f: round(1.0 / len(features), 6) for f in features}
    return {features[i]: round(abs_vals[i] / total, 6) for i in range(len(features))}


def main():
    parser = argparse.ArgumentParser(description="Train lightweight linear model for recommendation scoring.")
    parser.add_argument("--input", required=True, help="Input CSV path")
    parser.add_argument("--output", required=True, help="Output model JSON path")
    parser.add_argument("--features", required=True, help="Comma-separated feature names")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    features = [f.strip() for f in args.features.split(",") if f.strip()]
    if not features:
        raise ValueError("At least one feature must be provided")

    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {args.input}")

    with input_path.open("r", newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    rows = [r for r in rows if "label" in r]
    if len(rows) < 10:
        raise ValueError(f"Not enough rows to train model: {len(rows)}")

    split_idx = max(1, int(len(rows) * 0.8))
    train_rows = rows[:split_idx]
    val_rows = rows[split_idx:]

    raw_weights, bias = train_linear(train_rows, features)
    deployed_weights = normalized_abs_weights(raw_weights, features)

    model = {
        "version": "1.0",
        "features": features,
        "raw_weights": {features[i]: round(raw_weights[i], 8) for i in range(len(features))},
        "deployed_weights": deployed_weights,
        "intercept": round(bias, 8),
        "metrics": {
            "train_rmse": round(rmse(raw_weights, bias, train_rows, features), 8),
            "val_rmse": round(rmse(raw_weights, bias, val_rows, features), 8) if val_rows else None,
            "samples_train": len(train_rows),
            "samples_val": len(val_rows),
            "samples_total": len(rows),
        },
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(model, indent=2), encoding="utf-8")
    print(json.dumps(model["metrics"]))


if __name__ == "__main__":
    main()

