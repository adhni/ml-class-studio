# Bismillah: Exam Prep View Plan

## Summary

Add a simple `Exam Prep` view focused on exam mechanics rather than more visualizer complexity. The page will be one scrollable view with a priority map, high-yield worked-drill cards, and past-paper references. It will reuse the existing static HTML/CSS/JS structure and avoid new dependencies.

## Key Changes

- Use implementation branch `exam-prep-view`.
- Add `Exam Prep` to the existing studio dropdown and home entry points using view id `examPrep`.
- Add one new `exam-prep` section that appears only for `examPrep`.
- Hide normal analysis controls, settings drawer, and recommended setup buttons for `examPrep` so the page does not feel like another model studio.
- Keep navigation flat: no nested routes, no filters, no quiz engine, no progress tracker in v1.

## Exam Prep Content

- Add a priority map based on 2025 mark weights:
  - Logistic regression + neural networks: 20
  - Decision trees + random forests: 20
  - Clustering: 19
  - Visualisation + PCA: 15
  - Model evaluation + tuning: 14
  - XAI + SVM + kNN: 12
- Add a recommended study order strip so the page acts like a revision path rather than an unordered card bank:
  - Decision trees + random forests
  - Logistic regression + neural networks
  - Clustering
  - Visualisation + PCA
  - Model evaluation + tuning
  - XAI + SVM + kNN
- Add 12 compact worked-drill cards that target exam mechanics:
  - PCA variance and loading interpretation: read eigenvalues, proportions, cumulative variance, and dominant variables.
  - PCA/tours/standardisation short answer: explain why tours help high-dimensional views and why PCA needs scaling.
  - ROC-AUC vs accuracy: define ROC construction, explain thresholding, and justify AUC over one-threshold accuracy.
  - Cross-validation and tuning: describe k-fold CV and choose hyperparameters from validation output.
  - Logistic probability calculation: compute a logit score, convert it to probability, and classify from a threshold.
  - Neural network anatomy: identify inputs/hidden units/outputs, count parameters, and critique linear hidden activations.
  - Gini split calculation: compute class proportions, node weights, weighted Gini, and impurity reduction.
  - Tree output reading: interpret `rpart`-style `n`, `loss`, `yval`, `yprob`, terminal nodes, and training error.
  - CART and random forests: describe the split search, stopping rules, bagging, feature subsets, and why forests reduce single-tree instability.
  - KNN distance and vote probability: compute Euclidean distances, sort neighbours, and report class probabilities for a fixed `K`.
  - SVM and SHAP interpretation: explain cost/margin/support-vector behaviour and define SHAP as a local contribution averaged over feature coalitions.
  - Clustering calculations: perform one k-means iteration and build a small single-linkage dendrogram from a distance table.
- Each card has:
  - exam-style question
  - tested skill
  - priority label
  - past-paper tag
  - `Understand -> Drill -> Past paper` study-flow line
  - concise worked answer
  - revealable marking checklist
  - common mistake note
  - link button to the relevant existing studio week where useful
- Do not build full mini-labs in v1. Treat the cards as worked examples first; richer calculators or interactive lab expansions can be added later only if the simple page proves useful.
- Add a past-paper reference table listing `2019`, `2024`, and `2025`; do not copy or publish PDF assets into `app/v1` in v1. Keep references as filenames/local-folder notes to avoid broken public links and accidental publishing.

## Implementation Notes

- Update `app/v1/index.html` with the dropdown option, home launch card/button, and the `exam-prep` section.
- Update `app/v1/script.js`:
  - Add `examPrep` to `VIEWS`.
  - Update chrome rendering so `examPrep` hides `quickControlsBar`, settings drawer, control groups, and preset buttons.
  - Keep hash navigation working via `#examPrep`.
- Update `app/v1/style.css` with compact exam-card, priority-map, reveal panel, and past-paper table styles using the existing card/panel visual language.

## Test Plan

- Run the app locally from `app/v1` and verify:
  - `Exam Prep` appears in the dropdown.
  - Home can navigate to `Exam Prep`.
  - `#examPrep` deep link opens correctly.
  - No settings drawer, quick controls, or recommended setup buttons appear in Exam Prep.
  - Reveal answer/checklist controls work with keyboard and mouse.
  - Links from practice cards open the intended week views.
  - Mobile layout keeps cards readable and non-overlapping.
- Open `tests.html` to confirm existing math/unit checks still pass.
- Smoke-check existing week views to ensure hiding controls for `examPrep` did not affect normal studio views.

## Assumptions

- First version stays intentionally small and navigation-light.
- Exam prep content is derived from the local 2025 exam structure and current app topics.
- Past papers remain local references rather than app-served assets unless explicitly approved later.
- No new framework, build step, storage, or external libraries are introduced.
