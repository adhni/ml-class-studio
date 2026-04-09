# ML Class Studio

`app/v1/` contains a fully static teaching app for ETC3250/5250 machine learning topics. It is organized around the lecture-week sequence from `reference/slides/`, with related worksheet links from `reference/tutorial/` where those topic matches exist.

Public site:
`https://adhni.github.io/ml-class-studio/`

The app is intended as a class companion:
- lecture-week aligned
- browser-based and reproducible
- explanatory rather than worksheet-like
- fully static, so it is easy to run and share

## What the app does

- Provides a `Foundations` studio for `x`, `y`, and KNN before the numbered lecture weeks.
- Emphasizes dimension reduction, supervised learning, clustering, model diagnosis, and explainability in the same browser workflow.
- Covers lecture-week studios for visualisation, validation, logistic regression, decision trees, neural networks, XAI, SVM, clustering, model-based clustering, and cluster evaluation.
- Uses built-in datasets and seeded toy data to keep the browser behaviour reproducible.
- Shows plain-English captions under the main charts and tables instead of acting like a worksheet replacement.
- Keeps the app fully static: no framework, no build step, just HTML, CSS, and JavaScript.

## Current structure

- `Home` page with lecture-week cards and worksheet references
- `Foundations` studio for early-course setup concepts
- `Week 2` Visualisation
- `Week 3` Validation
- `Week 4` Logistic Regression
- `Week 5` Decision Trees
- `Week 6` Neural Networks
- `Week 7` Explainability / XAI
- `Week 8` SVM
- `Week 9` Clustering Methods
- `Week 10` Model-based Clustering
- `Week 11` Cluster Evaluation

## Run locally

From the repository root:

```bash
cd app/v1
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Current scope

- Static HTML, CSS, and JavaScript only.
- No framework and no build step.
- Top control bar with a settings drawer for lower-frequency controls.
- Built-in datasets: Iris, Penguins, Wine, plus seeded toy datasets.
- Lecture-week structure grounded in `reference/slides/`.
- Related worksheet references grounded in `reference/tutorial/`.

## What it is not

- Not a replacement for lecture slides
- Not a replacement for tutorial worksheets
- Not a full implementation of every topic covered in every lecture week
- Not a framework app or build-based frontend project

## Remaining gaps

- Week 3 now includes a permutation-based null check, but bootstrap and broader simulation-based resampling are still missing.
- Week 4 now includes a simple regularisation control and shrinkage view, but the lecture treatment of regularisation is still represented only lightly.
- Week 6 could still explain training dynamics more clearly, especially loss interpretation and overfitting.
- Week 8 still only touches the lecture links to nearest neighbours and regularisation.
- Week 10 is intentionally limited to Gaussian-mixture clustering and does not cover self-organising maps.
- Week 11 could still separate internal versus external cluster evaluation more explicitly.
