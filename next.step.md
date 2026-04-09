# Next Content Steps

This note is only about content improvements for the teaching app. It is not a UX, deployment, or documentation checklist.

## Highest Priority

1. Check each numbered studio against the lecture slides again and trim anything that overclaims coverage.
2. Fill the remaining lecture-topic gaps before adding any new polish.
3. Keep the repo notes aligned with the actual app whenever scope changes.

## Week-by-Week Content Gaps

### Foundations
- Decide whether this stays as a permanent starter studio.
- Keep it focused on `x`, `y`, and KNN only.
- Avoid letting it become a hidden replacement for a real lecture week.

### Week 2: Visualisation
- Current app covers scatterplots, PCA, and classical MDS well.
- Still missing broader lecture material such as t-SNE, UMAP, and data-tour style ideas.
- Decide whether to add one more nonlinear visualisation method or leave Week 2 intentionally narrow.

### Week 3: Validation
- Current app is strong on train/test split, stratification, and k-fold CV.
- Now includes a permutation-based null check.
- Still missing bootstrap and broader simulation-based resampling ideas from the lecture.
- If this week gets another addition, it should be a small bootstrap panel rather than more generic text.

### Week 4: Logistic Regression
- Current app covers logistic regression and compares it with LDA.
- Now includes a simple penalty-strength control and a coefficient-shrinkage view.
- Regularisation is still represented lightly compared with the lecture framing.
- Keep logistic regression as the main object and avoid letting the comparison with LDA take over the page.

### Week 5: Decision Trees
- The tree-first refinement is now in place.
- Forests should stay as a short comparison or stability check, not the headline.
- If possible later, add a clearer stopping-rule view beyond depth alone.

### Week 6: Neural Networks
- Current app has a small MLP and decision-boundary support.
- The page now treats hidden units and training epochs more explicitly as flexibility controls.
- The page now states that lower training loss is not, by itself, evidence of better generalisation.
- Keep the neural net page focused on interpretation of flexibility and overfitting, not on expanding the architecture menu.

### Week 7: Explainability / XAI
- Current app has feature importance and local explanation.
- The page now separates global and local explanation more clearly.
- The page now states explicitly that it is a subset of the full XAI topic.
- If this week gets another pass, it should deepen one explanation path rather than broaden into generic XAI coverage.

### Week 8: SVM
- Current app covers linear and RBF SVM.
- The framing now makes the `C` control read more clearly as a regularisation tradeoff.
- The page now cross-references nearest-neighbour style local behaviour without making Week 8 stop being SVM-first.
- Keep the comparison as framing only; do not turn this week into a KNN recap.

### Week 9: Clustering Methods
- Current app covers k-means and hierarchical clustering well.
- Keep checking that this page stays method-focused and does not duplicate too much evaluation content.

### Week 10: Model-based Clustering
- Current app covers Gaussian-mixture clustering.
- The lecture also includes self-organising maps.
- This is now an explicit known gap rather than an implied target for the current prototype.
- Keep the Gaussian-mixture scope note visible and avoid wording that suggests broader Week 10 coverage.

### Week 11: Cluster Evaluation
- Current app covers silhouette, WCSS, and adjusted Rand index.
- The page now names silhouette and WCSS as internal metrics.
- The page now names adjusted Rand as an external metric tied to known labels when they exist.
- Keep reminding users that the PCA picture is supporting evidence rather than the full evaluation story.

## Cross-Cutting Content Work

- Make every week description match the lecture slides closely.
- Keep `Related worksheet` links, but do not let tutorial structure drive the studio content.
- Add short scope notes only where the app covers part of a lecture topic.
- Prefer one strong new teaching panel per week over more general explanation text.

## Suggested Build Order

1. Week 3 bootstrap extension
2. Week 2 decision on whether to stay intentionally narrow or add one nonlinear visualisation method
