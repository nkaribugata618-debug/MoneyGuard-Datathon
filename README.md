# MoneyGuard — DATATHON Prototype

MoneyGuard is a responsive business intelligence web-app prototype for exploring potential revenue, margin, marketing, regional, and inventory risks.

## Current status
- Responsive Next.js interface with sidebar navigation.
- Interactive Recharts visualizations.
- Region/category filter controls and section navigation.
- Money leak review queue with search and CSV export.
- CSV upload and local preview in Data Explorer.
- Recommendation framework and responsive mobile layout.
- **All dashboard numbers/charts shown in the overview are illustrative demo visuals. They are not actual DATATHON findings.** The current CSV uploader previews data only; it does not automatically map dataset columns or recompute financial KPIs.

## Tech stack
- Next.js App Router + React + TypeScript
- Tailwind CSS v4
- Recharts
- Lucide React icons

## Run locally
Requires Node.js LTS and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To verify a production build:

```bash
npm run build
npm start
```

## Deploy to Vercel
1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import this repository.
3. Keep the detected Next.js framework and default build settings.
4. Deploy. Vercel will build and provide a `*.vercel.app` URL.

## GitHub push
Create an empty repository on GitHub, then from this folder run:

```bash
git init
git add .
git commit -m "Build MoneyGuard DATATHON prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/MoneyGuard-Datathon.git
git push -u origin main
```

Replace the remote URL with your repository URL.

## Next integration task
Export the verified findings/calculation tables from the existing Google Colab notebook to CSV/JSON. Then replace the illustrative chart data and placeholder review prompts with those real outputs. Clearly document whether each field is observed, calculated, estimated, or hypothetical.

## Data and secrets
Do not commit credentials, API keys, passwords, or private data. `.env` files are excluded by `.gitignore`. Check that the event's data-sharing rules permit committing the dataset before uploading it.

## Machine-learning model (Colab / Python)

MoneyGuard includes an Isolation Forest pipeline for unsupervised transaction anomaly detection. It flags unusual records for review; it does **not** prove fraud or a confirmed money loss.

### Export from Google Colab

Run this after your `tx` DataFrame is loaded:

```python
tx.to_csv('transactions.csv', index=False)
from google.colab import files
files.download('transactions.csv')
```

### Train locally

```bash
pip install -r requirements-ml.txt
python ml/train_moneyguard.py transactions.csv
```

Outputs are written to `outputs/`: `scored_transactions.csv`, `model_metrics.json`, and `isolation_forest.joblib`. Upload `scored_transactions.csv` in MoneyGuard's **Import CSV** control to inspect the scored records. The current web UI's upload feature is a CSV preview, so the frontend does not run Python inference or automatically replace all dashboard charts yet.

### GitHub and Vercel

Create a GitHub repository named `MoneyGuard-Datathon`, then from this project folder run:

```bash
git init
git add .
git commit -m "Build MoneyGuard dashboard and ML anomaly detection"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/MoneyGuard-Datathon.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Then import that repository in Vercel; use the default Next.js build settings. Python ML training is separate from the static Next.js deployment; to run live inference in production, deploy a Python API separately. Do not commit private credentials or sensitive raw datasets.


## ML integration included in this package
- Includes `src/data/ml_summary.json`, exported from the provided Colab Isolation Forest results.
- Money Leak Finder displays the trained model's summary and the top 10 of the 100 highest-risk flagged transactions.
- Results reflect a fixed snapshot from the uploaded dataset; uploading a new CSV in Data Explorer still only previews it and does not retrain the model.
- Model summary: 18,000 rows scored; 897 anomalies (4.98%); features: gross_value, discount_pct, quantity, unit_price.
- Anomaly flags are review leads, not confirmed fraud or proven financial loss.
- Do not commit the full raw dataset unless datathon rules permit it.
