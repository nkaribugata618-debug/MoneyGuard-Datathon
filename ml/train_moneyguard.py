"""Train an unsupervised Isolation Forest on transaction CSV exported from Colab.
Usage: python ml/train_moneyguard.py transactions.csv
Outputs: outputs/scored_transactions.csv, outputs/model_metrics.json, outputs/isolation_forest.joblib
"""
from pathlib import Path
import json, sys
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib

if len(sys.argv) < 2:
    raise SystemExit("Usage: python ml/train_moneyguard.py <transactions.csv>")
source = Path(sys.argv[1])
if not source.exists():
    raise SystemExit(f"File not found: {source}")
df = pd.read_csv(source)
if df.empty:
    raise SystemExit("CSV has no rows.")

# Derive defensible business features when source columns exist.
cols = {c.lower().strip(): c for c in df.columns}
def find(*names):
    return next((cols[n] for n in names if n in cols), None)
qty, price = find('quantity'), find('unit_price', 'unit price')
disc = find('discount_pct', 'discount', 'discount_percent')
if qty and price:
    q = pd.to_numeric(df[qty], errors='coerce')
    p = pd.to_numeric(df[price], errors='coerce')
    df['mg_gross_value'] = q * p
    if disc:
        d = pd.to_numeric(df[disc], errors='coerce')
        # If discount values look like fractions (e.g. 0.2), use fraction; if percent (20), divide by 100.
        factor = d.where(d.abs() <= 1, d / 100).fillna(0).clip(0, 1)
        df['mg_estimated_discount_value'] = df['mg_gross_value'] * factor
        df['mg_estimated_net_value'] = df['mg_gross_value'] - df['mg_estimated_discount_value']

# Only numeric business fields; exclude identifiers and binary target-like flags to avoid meaningless scoring.
num = df.select_dtypes(include=[np.number]).copy()
exclude = [c for c in num.columns if c.lower().endswith(('_id', 'id')) or c.lower() in {'transaction_id','customer_id','product_id','status','stockout_flag'}]
features = num.drop(columns=exclude, errors='ignore')
if features.shape[1] == 0:
    raise SystemExit('No usable numeric business features found. Check CSV columns.')
# Remove all-empty and constant columns.
features = features.loc[:, features.notna().any()]
features = features.loc[:, features.nunique(dropna=True) > 1]
if features.shape[1] == 0:
    raise SystemExit('No varying numeric features available for anomaly detection.')

model = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scale', StandardScaler()),
    ('detector', IsolationForest(n_estimators=250, contamination='auto', random_state=42, n_jobs=-1))
])
model.fit(features)
# sklearn decision_function: lower = more anomalous. Convert to ascending risk score 0-100.
decision = model.decision_function(features)
rank = pd.Series(decision).rank(pct=True)
risk = ((1 - rank) * 100).round(1)
pred = model.predict(features)
out = df.copy()
out['ml_anomaly'] = (pred == -1)
out['ml_risk_score'] = risk.values
out['ml_review_priority'] = pd.cut(out['ml_risk_score'], bins=[-0.1, 70, 90, 100], labels=['Routine', 'Review', 'High'], include_lowest=True).astype(str)
# Highest risk first for review, not a claim of confirmed fraud/loss.
out = out.sort_values('ml_risk_score', ascending=False)

outdir = Path('outputs'); outdir.mkdir(exist_ok=True)
out.to_csv(outdir / 'scored_transactions.csv', index=False)
joblib.dump({'pipeline': model, 'feature_columns': features.columns.tolist()}, outdir / 'isolation_forest.joblib')
metrics = {
    'model': 'IsolationForest (unsupervised anomaly detection)',
    'input_file': str(source), 'rows_scored': int(len(df)),
    'features_used': features.columns.tolist(),
    'anomaly_count': int((pred == -1).sum()),
    'anomaly_rate_percent': round(float((pred == -1).mean() * 100), 2),
    'high_review_priority_count': int((out['ml_review_priority'] == 'High').sum()),
    'limitations': 'Anomaly scores indicate unusual patterns, not confirmed fraud, loss, or causation. Validate flagged rows against business evidence.'
}
(outdir / 'model_metrics.json').write_text(json.dumps(metrics, indent=2))
print(json.dumps(metrics, indent=2))
print(f"\nSaved: {outdir / 'scored_transactions.csv'}")
