# Flashback model

This directory contains the reproducible training and evaluation pipeline for the Flashback movie recommender.

## Baseline decision

- Dataset: MovieLens 20M
- Algorithm: implicit-feedback Alternating Least Squares from `implicit`
- Python: 3.14
- Environment and lockfile: `uv`
- Primary metrics: Recall@K and NDCG@K
- Baseline comparison: most-popular recommender

MovieLens ratings are explicit, but the selected ALS implementation models implicit feedback. The first baseline will treat ratings of 4.0 and above as positive interactions. Lower ratings will not be inserted as positive values. The preprocessing choice will be tested and documented before training.

## Planned pipeline

```text
raw_data/
    |
    v
inspect and validate
    |
    v
create implicit interactions
    |
    v
chronological train/validation/test split
    |
    v
train popularity and ALS models
    |
    v
evaluate ranking quality
    |
    v
export reproducible artifacts
```

## Local setup

```bash
cd model
uv sync
```

Run checks with:

```bash
uv run ruff check .
uv run pytest
```

Download, verify, and extract the required MovieLens 20M files with:

```bash
uv run python download_data.py
```

The downloader verifies the official archive against its published MD5 checksum and extracts only `README.txt`, `links.csv`, `movies.csv`, and `ratings.csv` into `raw_data/ml-20m/`.

If the official GroupLens server reports a certificate problem, the download can be explicitly allowed with:

```bash
uv run python download_data.py --allow-insecure-download
```

This flag disables certificate verification only for the archive request. Checksum verification remains mandatory, and a mismatched archive is never extracted. Interrupted downloads resume from the existing `.part` file when the server supports byte ranges.

Commands for preprocessing, training, evaluation, and export will be added in separate commits.

Inspect the dataset and regenerate its committed profile with:

```bash
uv run python inspect_data.py
```

The profile records source counts, rating and genre distributions, positive-interaction coverage, and basic data-quality checks in `reports/data_profile.json`.

Build the positive-interaction dataset and chronological splits with:

```bash
uv run python preprocess.py
```

Preprocessing repeatedly removes users and movies with fewer than five positive interactions until the dataset is stable. For every retained user, the latest interaction is assigned to the test split, the preceding interaction is assigned to validation, and all earlier interactions are assigned to training. Equal timestamps are ordered by MovieLens movie ID so repeated runs are deterministic. The generated Parquet files and mappings are written to `processed_data/`, while summary statistics are committed in `reports/preprocessing_report.json`.

Evaluate the non-personalized popularity baseline on the validation split with:

```bash
uv run python evaluate_popularity.py
```

The evaluator removes movies already present in each user's training history and reports Recall and NDCG at 5, 10, and 20 in `reports/popularity_validation.json`. The test split remains untouched until the ALS configuration has been selected.

Train and compare the ALS validation configurations with:

```bash
uv run python tune_als.py
```

The sweep uses a fixed seed and compares each model against the popularity baseline on the complete validation split. Trained tuning artifacts are written to the ignored `artifacts/tuning/` directory, and the reproducible configuration and metric summary is written to `reports/als_validation.json`.

Retrain the selected configuration and perform the one-time test evaluation with:

```bash
uv run python train_final.py
```

This command combines training and validation interactions, trains the selected ALS configuration, compares ALS with popularity on the untouched test split, and writes `reports/final_test.json`. The native model, user mapping, movie mapping, and integrity manifest are written to the ignored `artifacts/final/` directory. Their serving format can be adapted when backend development begins without changing the documented training result.

## Data policy

MovieLens data must be downloaded into `model/raw_data/`. That directory is ignored by Git because the dataset should not be redistributed in this repository. Deterministic intermediate files in `model/processed_data/` are also ignored. Download scripts, checksums, preprocessing code, configuration, and evaluation reports will be versioned so the work remains reproducible.

Generated binary model artifacts belong in `model/artifacts/` and are also ignored. The final export format for backend inference will be decided when backend development begins.
