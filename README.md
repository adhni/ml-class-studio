# ML Class Studio

`app/v1/` contains a fully static teaching app for core machine learning class topics. It uses built-in datasets and seeded toy data to show how problem framing, visualisation, validation, classification, and clustering connect inside one reproducible browser-based workflow.

## What the app does

- Explains classification, regression, and clustering in plain English.
- Shows raw pairwise views alongside PCA and classical MDS.
- Demonstrates train/test splitting, stratification, and k-fold cross-validation.
- Compares KNN, logistic regression, LDA, and decision trees with accuracy, macro F1, confusion matrices, and a toy decision-boundary view.
- Compares k-means and hierarchical clustering with PCA-space displays, silhouette, within-cluster sum of squares, and adjusted Rand index when labels exist.

## Run locally

From the repository root:

```bash
cd app/v1
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## V1 scope

- Static HTML, CSS, and JavaScript only.
- No framework and no build step.
- One-page layout with a left sidebar for global controls.
- Built-in datasets: Iris, Penguins, Wine, plus seeded toy datasets.
- Course-grounded sections based on the slide material in `reference/slides/`.

## Future V2 scope

- SVM
- Neural networks
- Explainability / XAI
- Model-based clustering
