# ML Class Studio V1 Design Notes

## Course grounding

V1 is organized to follow the slide material in `reference/slides/` rather than the PCA app's topic structure.

- Week 2 anchors the Visualisation Lab: scatterplot views, PCA, and classical MDS.
- Week 3 anchors the Resampling / Validation Lab: train/test splitting, stratification, and cross-validation.
- Weeks 4 and 5 anchor the Classification Lab: KNN, logistic regression, LDA as an interpretable linear classifier, and decision trees.
- Week 9 anchors the Clustering Lab: k-means and hierarchical clustering.
- Week 11 anchors the clustering evaluation metrics: confusion-style comparison ideas, numerical summaries, and low-dimensional cluster displays.

## Product and layout references borrowed from `adhnimc/pca`

The `adhnimc/pca` repo was used only as a design and interaction reference, not as a topic template.

- Fully static HTML, CSS, and JavaScript.
- One-page app structure.
- Persistent left sidebar for global controls.
- Section-based main content area.
- Seeded reproducibility so the same seed reproduces toy datasets and resampling splits.
- Built-in datasets instead of uploads for V1.
- Plain-English captions under each analytic panel.

## Deliberate V1 scope decisions

- PCA is included only as one visualisation tool, not as the main concept.
- Regression is explained in the Problem Framing section, but V1 does not include a dedicated regression modelling lab.
- Hierarchical clustering uses Ward-style agglomeration and, for larger datasets, a seeded subset so the static browser app stays responsive.
- The decision boundary panel is limited to the 2D toy datasets so the geometry remains interpretable.

## Styling direction

- Academic and readable rather than bright or promotional.
- Serif-forward typography with restrained blue-grey accents.
- Dense information panels, but still enough spacing for teaching captions and tables.
