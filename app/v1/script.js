(() => {
  "use strict";

  const TOY_POINTS = 180;
  const MAX_HIERARCHICAL_ROWS = 180;
  const PERMUTATION_RUNS = 21;
  const BOOTSTRAP_RUNS = 31;
  const DEFAULT_LOGISTIC_PENALTY = 0.01;
  const PALETTE = [
    "#0f4d66",
    "#b85c38",
    "#5c7a3d",
    "#7c5ea6",
    "#9a3d52",
    "#3d7f85",
    "#8a6a2c",
    "#57617a"
  ];
  const LIGHT_PALETTE = [
    "rgba(15, 77, 102, 0.12)",
    "rgba(184, 92, 56, 0.12)",
    "rgba(92, 122, 61, 0.12)",
    "rgba(124, 94, 166, 0.12)",
    "rgba(154, 61, 82, 0.12)",
    "rgba(61, 127, 133, 0.12)",
    "rgba(138, 106, 44, 0.12)",
    "rgba(87, 97, 122, 0.12)"
  ];

  const state = {
    datasetId: "iris",
    viewId: "home",
    settingsOpen: false,
    seed: 123,
    validationMode: "holdout",
    testFraction: 0.25,
    kFolds: 5,
    stratify: true,
    knnK: 7,
    logisticPenalty: DEFAULT_LOGISTIC_PENALTY,
    treeDepth: 4,
    forestTrees: 21,
    splitFeature: 0,
    nnHidden: 8,
    nnEpochs: 180,
    svmC: 1.2,
    svmGamma: 1,
    clusterK: 3,
    gmmComponents: 3,
    framingMode: "classification",
    focusModel: "knn",
    xaiIndex: 0,
    scatterX: 0,
    scatterY: 1
  };

  const elements = {};
  const cache = {
    dataset: null,
    pca: null,
    mds: null,
    split: null,
    folds: null,
    resamplingExperiment: null,
    bootstrapExperiment: null,
    week4Regularisation: null,
    classification: null,
    neural: null,
    clustering: null
  };

  const VIEWS = {
    home: {
      label: "Home",
      title: "Choose a studio",
      summary: "Open one focused studio at a time.",
      prompt: "Start with Foundations for week-1 style basics, or open the lecture week you need. Related worksheets are referenced by tutorial number."
    },
    foundations: {
      label: "Foundations",
      title: "Basics + KNN",
      summary: "An unnumbered companion studio for x, y, and KNN before the lecture-week sequence begins.",
      prompt: "Use Iris first, then switch to Toy nonlinear to see why KNN behaves like a local rule. This studio supports the early course setup work rather than a numbered lecture slide deck.",
      tutorialPath: "Tut 2",
      controls: ["dataset", "problem", "validation", "classification"],
      preset: {
        datasetId: "iris",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        focusModel: "knn",
        knnK: 7,
        scatterX: 2,
        scatterY: 3
      },
      copy: {
        problem:
          "Keep this short: make sure you know what x and y mean, then move into the classifier comparison below.",
        classification:
          "Use KNN as the starting point here. Compare it with the other models, but treat KNN as the main reference."
      }
    },
    week2: {
      label: "Week 2",
      title: "Visualisation",
      summary: "See structure before fitting models.",
      prompt: "Start with Wine, then compare what the raw scatter, PCA, and MDS views reveal.",
      tutorialPath: "Tut 3",
      controls: ["dataset", "visual"],
      preset: {
        datasetId: "wine",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        scatterX: 0,
        scatterY: 5
      },
      copy: {
        visual:
          "Use the controls above or open Settings to change the two raw features, then compare that pair with the lower-dimensional PCA and MDS views."
      }
    },
    week3: {
      label: "Week 3",
      title: "Validation",
      summary: "See how the split changes the story.",
      prompt:
        "Start with Penguins. Toggle stratification, compare holdout with k-fold cross-validation, then use the permutation panel to check whether the model signal is stronger than a shuffled-label baseline. Finish with the bootstrap panel to see how the score moves across resampled training sets.",
      tutorialPath: "Tut 4",
      controls: ["dataset", "validation"],
      preset: {
        datasetId: "penguins",
        validationMode: "cv",
        stratify: true,
        framingMode: "classification",
        kFolds: 5,
        focusModel: "logistic",
        scatterX: 0,
        scatterY: 2
      },
      copy: {
        resampling:
          "This week is about generalisation. Read the split and fold balance first, then use the permutation null check to compare real-label performance with what the same workflow can achieve after the labels are shuffled. The bootstrap panel adds a separate stability view based on repeated with-replacement resamples."
      }
    },
    week4: {
      label: "Week 4",
      title: "Logistic Regression",
      summary: "Use logistic regression as the main linear classifier, then inspect how regularisation shrinks coefficients.",
      prompt: "Start with Penguins, inspect logistic regression first, adjust the penalty to watch the coefficients shrink, then compare the result with LDA on the same split.",
      tutorialPath: "Tut 5",
      controls: ["dataset", "validation", "classification"],
      preset: {
        datasetId: "penguins",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        focusModel: "logistic",
        logisticPenalty: DEFAULT_LOGISTIC_PENALTY,
        scatterX: 0,
        scatterY: 2
      },
      copy: {
        classification:
          "This week is about model-based linear boundaries plus shrinkage. Keep logistic regression as the main object, adjust the penalty to see which coefficients persist, then use LDA as the comparison baseline."
      }
    },
    week5: {
      label: "Week 5",
      title: "Decision Trees",
      summary: "Make the single tree the main story, then use the forest as a stability check.",
      prompt: "Start with Penguins, inspect the split explorer first, then read the early tree structure before using the forest comparison as a second opinion.",
      tutorialPath: "Tut 6",
      controls: ["dataset", "validation", "classification", "forest", "trees"],
      preset: {
        datasetId: "penguins",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        focusModel: "tree",
        treeDepth: 4,
        forestTrees: 21,
        splitFeature: 3
      },
      copy: {
        week5:
          "Keep the tree in the foreground: why the root split is chosen, what the first branches look like, and where the tree starts to struggle. Use the forest only to check whether those patterns look unstable."
      }
    },
    week6: {
      label: "Week 6",
      title: "Neural Networks",
      summary: "Use hidden units, epochs, and validation scores to judge neural-network flexibility.",
      prompt:
        "Start with Toy nonlinear. Increase hidden units or epochs, then compare the validation scores with the training-loss summary. A lower training loss alone is not enough if holdout or cross-validation performance does not improve.",
      tutorialPath: "Tut 7",
      controls: ["dataset", "validation", "neural"],
      preset: {
        datasetId: "toy_nonlinear",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        nnHidden: 8,
        nnEpochs: 180,
        scatterX: 0,
        scatterY: 1
      },
      copy: {
        neural:
          "Keep the interface light here: use hidden units and epochs as the main flexibility controls, then compare the neural net with the baselines to judge whether the lower training loss is translating into better validation performance rather than just extra complexity."
      }
    },
    week7: {
      label: "Week 7",
      title: "Explainability / XAI",
      summary: "Separate one global explanation view from one local explanation view.",
      prompt: "Start with Penguins and the random forest, then switch focus models to compare what the global view says about overall signal and what the local view says about one selected row. This studio is intentionally a narrow subset of XAI, not full topic coverage.",
      tutorialPath: "Tut 8",
      controls: ["dataset", "validation", "classification", "forest", "svm", "xai"],
      preset: {
        datasetId: "penguins",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        focusModel: "forest",
        treeDepth: 4,
        forestTrees: 21,
        svmC: 1.2,
        svmGamma: 1,
        xaiIndex: 0,
        scatterX: 0,
        scatterY: 2
      },
      copy: {
        classification:
          "Use the classification outputs as context, then move to the XAI section to compare what the current model seems to use overall with why it predicts one selected row the way it does.",
        xai:
          "This week is about interpretation, not just ranking models. Keep the two explanation levels separate: the global view summarizes broad model signal, while the local view explains one row at a time. Treat this as a focused subset of XAI rather than complete coverage."
      }
    },
    week8: {
      label: "Week 8",
      title: "Support Vector Machines",
      summary: "Compare margin-based SVM behaviour with more local decision rules.",
      prompt:
        "Start with Toy nonlinear. Compare linear SVM with RBF SVM, then change C and gamma to see how the margin width and boundary flexibility respond. Read C as a regularisation tradeoff, and keep in mind how this differs from nearest-neighbour style local decisions.",
      tutorialPath: "Tut 9",
      controls: ["dataset", "validation", "classification", "svm"],
      preset: {
        datasetId: "toy_nonlinear",
        validationMode: "holdout",
        stratify: true,
        framingMode: "classification",
        focusModel: "svm_rbf",
        svmC: 1.4,
        svmGamma: 1.4,
        scatterX: 0,
        scatterY: 1
      },
      copy: {
        classification:
          "This week is about margin-based classifiers. Compare the linear SVM with the RBF version, treat C as the main regularisation dial, and contrast the resulting boundary with the more local behaviour you would expect from nearest-neighbour rules."
      }
    },
    week9: {
      label: "Week 9",
      title: "Clustering Methods",
      summary: "Compare k-means and hierarchical clustering directly.",
      prompt: "Start with Wine, then check whether the two methods tell a similar grouping story in PCA space.",
      tutorialPath: "Tut 10",
      controls: ["dataset", "clustering"],
      preset: {
        datasetId: "wine",
        validationMode: "holdout",
        stratify: true,
        framingMode: "clustering",
        clusterK: 3,
        scatterX: 0,
        scatterY: 5
      },
      copy: {
        clustering:
          "Treat the PCA plots as a comparison space for the two clustering methods. The aim this week is method contrast, not metric theory."
      }
    },
    week10: {
      label: "Week 10",
      title: "Model-based Clustering",
      summary: "Compare Gaussian-mixture clustering with the geometric clustering methods, with SOMs left out explicitly.",
      prompt: "Start with Wine, keep k and the mixture component count aligned, then see where a probabilistic model groups points differently from k-means or hierarchical clustering. This studio is intentionally limited to Gaussian mixtures and does not claim SOM coverage.",
      tutorialPath: "Tut 11",
      controls: ["dataset", "clustering", "model-clustering"],
      preset: {
        datasetId: "wine",
        validationMode: "holdout",
        stratify: true,
        framingMode: "clustering",
        clusterK: 3,
        gmmComponents: 3,
        scatterX: 0,
        scatterY: 5
      },
      copy: {
        clustering:
          "This week adds a probabilistic clustering model. Compare its PCA-space grouping with the geometric methods, but remember the fit still happens in the full standardized feature space. Self-organising maps are an explicit out-of-scope topic for this prototype."
      }
    },
    week11: {
      label: "Week 11",
      title: "Cluster Evaluation",
      summary: "Separate internal cluster quality from external label agreement.",
      prompt:
        "Start with Toy clusters, then compare what the internal metrics say about compactness and separation with what adjusted Rand says about agreement with known labels. Use the PCA view as supporting evidence, not the whole argument.",
      tutorialPath: "Tut 12",
      controls: ["dataset", "clustering"],
      preset: {
        datasetId: "toy_clusters",
        validationMode: "holdout",
        stratify: true,
        framingMode: "clustering",
        clusterK: 3,
        scatterX: 0,
        scatterY: 1
      },
      copy: {
        clustering:
          "This week is about judging the result. Treat silhouette and WCSS as internal checks based on the fitted clusters alone, then use adjusted Rand as an external check against known labels when labels exist."
      }
    }
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    collectElements();
    bindControls();
    buildToyDatasets(state.seed);
    populateDatasetSelector();
    const initialView = getViewFromHash();
    if (initialView) {
      state.viewId = initialView;
    }
    syncScatterOptions();
    syncSplitFeatureOptions();
    if (state.viewId !== "home") {
      applyViewPreset(state.viewId, false);
    } else {
      syncControlsFromState();
    }
    syncXaiOptions();
    runAnalysis();
  }

  function collectElements() {
    const ids = [
      "viewSelect",
      "currentWeekBlock",
      "currentWeekLabel",
      "currentWeekTitle",
      "currentWeekSummary",
      "backHomeBtn",
      "applyPresetBtn",
      "tutorialPath",
      "homeView",
      "settingsToggleBtn",
      "settingsCloseBtn",
      "settingsBackdrop",
      "moreSettingsPanel",
      "quickControlsBar",
      "quickControlsTitle",
      "quickControlsGrid",
      "weekShell",
      "viewKicker",
      "viewTitle",
      "viewSummary",
      "viewPrompt",
      "viewTutorialPath",
      "viewPresetBtn",
      "datasetSelect",
      "analysisSeed",
      "analysisSeed_num",
      "validationMode",
      "testFraction",
      "testFraction_num",
      "kFolds",
      "kFolds_num",
      "stratifyToggle",
      "knnK",
      "knnK_num",
      "logisticPenalty",
      "logisticPenalty_num",
      "treeDepth",
      "treeDepth_num",
      "classificationKnnControl",
      "classificationLogisticControl",
      "classificationTreeControl",
      "forestTrees",
      "forestTrees_num",
      "splitFeature",
      "nnHidden",
      "nnHidden_num",
      "nnEpochs",
      "nnEpochs_num",
      "svmC",
      "svmC_num",
      "svmGamma",
      "svmGamma_num",
      "clusterK",
      "clusterK_num",
      "gmmComponents",
      "gmmComponents_num",
      "xaiIndex",
      "xaiIndex_num",
      "xaiIndexNote",
      "framingMode",
      "framingSummary",
      "xyDefinition",
      "problemIntro",
      "visualIntro",
      "resamplingIntro",
      "classificationIntro",
      "classificationKicker",
      "week5Intro",
      "week5SplitPlot",
      "week5SplitSummary",
      "week5SplitCaption",
      "week5TreePlot",
      "week5TreeSummary",
      "week5TreeCaption",
      "week5MetricsTable",
      "week5ComparisonSummary",
      "week5MetricsCaption",
      "week5ConfusionTable",
      "week5ModelSummary",
      "week5ConfusionCaption",
      "week5HardCasesTable",
      "week5HardCasesCaption",
      "week5ImportanceTable",
      "week5ImportanceCaption",
      "clusteringIntro",
      "clusteringKicker",
      "clusterEvaluationPanel",
      "xaiIntro",
      "neuralIntro",
      "nnMetricsTable",
      "nnMetricsCaption",
      "nnSummaryPanel",
      "nnSummary",
      "nnBoundaryPanel",
      "nnBoundaryPlot",
      "nnBoundaryCaption",
      "xaiGlobalTable",
      "xaiGlobalCaption",
      "xaiLocalSummary",
      "xaiLocalTable",
      "xaiLocalCaption",
      "datasetMeta",
      "datasetTeachingNote",
      "standardisationSummary",
      "standardisationCaption",
      "scatterX",
      "scatterY",
      "pairScatterSummary",
      "pairScatterPlot",
      "pairScatterCaption",
      "pcaPlot",
      "pcaCaption",
      "mdsPlot",
      "mdsCaption",
      "splitBalanceTable",
      "splitCaption",
      "foldBalanceTable",
      "foldCaption",
      "permutationPlot",
      "permutationSummary",
      "permutationCaption",
      "bootstrapPlot",
      "bootstrapSummary",
      "bootstrapCaption",
      "classificationMetricsTable",
      "classificationModeCaption",
      "classificationDetailGrid",
      "classificationSummaryPanel",
      "week4RegularisationPanel",
      "week4RegularisationTable",
      "week4RegularisationSummary",
      "week4RegularisationCaption",
      "focusModel",
      "confusionTable",
      "modelSummary",
      "boundaryPanel",
      "confusionCaption",
      "boundaryPlot",
      "boundaryCaption",
      "clusteringTable",
      "clusteringCaption",
      "week10ScopePanel",
      "kmeansPlot",
      "kmeansCaption",
      "hierPlot",
      "hierCaption",
      "modelClusteringPanel",
      "modelClusterPlot",
      "modelClusterCaption",
      "hierSummary",
      "hierSummaryCaption"
    ];

    ids.forEach((id) => {
      elements[id] = document.getElementById(id);
    });
    elements.weekSections = Array.from(document.querySelectorAll(".week-section"));
    elements.controlGroups = Array.from(document.querySelectorAll("[data-control-group]"));
    elements.viewButtons = Array.from(document.querySelectorAll("[data-view-target]"));
  }

  function bindControls() {
    bindPair("analysisSeed", "analysisSeed_num", (value) => {
      state.seed = clamp(Math.round(value), 1, 999);
      buildToyDatasets(state.seed);
      runAnalysis();
    });
    bindPair("testFraction", "testFraction_num", (value) => {
      state.testFraction = clamp(Number(value), 0.15, 0.45);
      runAnalysis();
    });
    bindPair("kFolds", "kFolds_num", (value) => {
      state.kFolds = clamp(Math.round(value), 3, 10);
      runAnalysis();
    });
    bindPair("knnK", "knnK_num", (value) => {
      const oddK = Math.max(1, Math.round(value));
      state.knnK = oddK % 2 === 0 ? oddK + 1 : oddK;
      setPairValue("knnK", "knnK_num", state.knnK);
      runAnalysis();
    });
    bindPair("logisticPenalty", "logisticPenalty_num", (value) => {
      state.logisticPenalty = clamp(Number(value), 0.001, 0.2);
      runAnalysis();
    });
    bindPair("treeDepth", "treeDepth_num", (value) => {
      state.treeDepth = clamp(Math.round(value), 1, 8);
      runAnalysis();
    });
    bindPair("forestTrees", "forestTrees_num", (value) => {
      const oddTrees = Math.max(5, Math.round(value));
      state.forestTrees = oddTrees % 2 === 0 ? oddTrees + 1 : oddTrees;
      setPairValue("forestTrees", "forestTrees_num", state.forestTrees);
      runAnalysis();
    });
    elements.splitFeature.addEventListener("change", (event) => {
      state.splitFeature = Number(event.target.value);
      renderQuickControls();
      renderWeek5Lab();
    });
    bindPair("nnHidden", "nnHidden_num", (value) => {
      state.nnHidden = clamp(Math.round(value), 3, 24);
      runAnalysis();
    });
    bindPair("nnEpochs", "nnEpochs_num", (value) => {
      state.nnEpochs = clamp(Math.round(value), 60, 320);
      runAnalysis();
    });
    bindPair("svmC", "svmC_num", (value) => {
      state.svmC = clamp(Number(value), 0.2, 3);
      runAnalysis();
    });
    bindPair("svmGamma", "svmGamma_num", (value) => {
      state.svmGamma = clamp(Number(value), 0.2, 3);
      runAnalysis();
    });
    bindPair("clusterK", "clusterK_num", (value) => {
      state.clusterK = clamp(Math.round(value), 2, 8);
      runAnalysis();
    });
    bindPair("gmmComponents", "gmmComponents_num", (value) => {
      state.gmmComponents = clamp(Math.round(value), 2, 8);
      runAnalysis();
    });
    bindPair("xaiIndex", "xaiIndex_num", (value) => {
      state.xaiIndex = clamp(Math.round(value) - 1, 0, Math.max(0, (cache.dataset?.n || 1) - 1));
      setPairValue("xaiIndex", "xaiIndex_num", state.xaiIndex + 1);
      renderXaiLab();
    });

    elements.datasetSelect.addEventListener("change", (event) => {
      state.datasetId = event.target.value;
      syncScatterOptions();
      syncSplitFeatureOptions();
      syncXaiOptions();
      runAnalysis();
    });
    elements.viewSelect.addEventListener("change", (event) => {
      navigateToView(event.target.value);
    });
    elements.validationMode.addEventListener("change", (event) => {
      state.validationMode = event.target.value;
      runAnalysis();
    });
    elements.stratifyToggle.addEventListener("change", (event) => {
      state.stratify = event.target.checked;
      runAnalysis();
    });
    elements.framingMode.addEventListener("change", (event) => {
      state.framingMode = event.target.value;
      renderProblemFraming();
    });
    elements.focusModel.addEventListener("change", (event) => {
      state.focusModel = event.target.value;
      renderModelInspection();
      renderWeek5Lab();
      renderXaiLab();
    });
    elements.scatterX.addEventListener("change", (event) => {
      state.scatterX = Number(event.target.value);
      renderVisualisationPanels();
    });
    elements.scatterY.addEventListener("change", (event) => {
      state.scatterY = Number(event.target.value);
      renderVisualisationPanels();
    });
    elements.backHomeBtn.addEventListener("click", () => {
      navigateToView("home");
    });
    elements.applyPresetBtn.addEventListener("click", () => {
      applyViewPreset(state.viewId);
    });
    elements.settingsToggleBtn.addEventListener("click", () => {
      setSettingsOpen(!state.settingsOpen);
    });
    elements.settingsCloseBtn.addEventListener("click", () => {
      setSettingsOpen(false);
    });
    elements.settingsBackdrop.addEventListener("click", () => {
      setSettingsOpen(false);
    });
    elements.viewPresetBtn.addEventListener("click", () => {
      applyViewPreset(state.viewId);
    });
    elements.viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        navigateToView(button.dataset.viewTarget);
      });
    });
    window.addEventListener("hashchange", () => {
      const nextView = getViewFromHash();
      if (nextView && nextView !== state.viewId) {
        navigateToView(nextView);
      }
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.settingsOpen) {
        setSettingsOpen(false);
      }
    });
  }

  function bindPair(rangeId, numberId, onChange) {
    const range = elements[rangeId];
    const number = elements[numberId];
    const handler = (event) => {
      const value = Number(event.target.value);
      range.value = value;
      number.value = value;
      onChange(value);
    };
    range.addEventListener("input", handler);
    number.addEventListener("change", handler);
  }

  function setPairValue(rangeId, numberId, value) {
    elements[rangeId].value = value;
    elements[numberId].value = value;
  }

  function populateDatasetSelector() {
    const datasets = datasetRegistry();
    const options = Object.keys(datasets).map((key) => {
      const selected = key === state.datasetId ? " selected" : "";
      return `<option value="${key}"${selected}>${escapeHtml(datasets[key].name)}</option>`;
    });
    elements.datasetSelect.innerHTML = options.join("");
  }

  function datasetRegistry() {
    return window.ML_DATASETS || {};
  }

  function buildToyDatasets(seed) {
    const registry = datasetRegistry();
    registry.toy_linear = createLinearToy(seed);
    registry.toy_nonlinear = createNonlinearToy(seed + 17);
    registry.toy_clusters = createClusterToy(seed + 31);
  }

  function navigateToView(viewId) {
    if (!VIEWS[viewId]) {
      return;
    }
    state.viewId = viewId;
    if (viewId === "home") {
      state.settingsOpen = false;
    }
    if (viewId !== "home") {
      applyViewPreset(viewId, false);
    } else {
      syncControlsFromState();
    }
    if (window.location.hash.slice(1) !== viewId) {
      history.replaceState(null, "", `#${viewId}`);
    }
    runAnalysis();
  }

  function applyViewPreset(viewId, rerun = true) {
    const view = VIEWS[viewId];
    if (!view || !view.preset) {
      if (rerun) {
        runAnalysis();
      }
      return;
    }
    Object.entries(view.preset).forEach(([key, value]) => {
      if (key !== "scatterX" && key !== "scatterY") {
        state[key] = value;
      }
    });
    if (view.preset.scatterX != null) {
      state.scatterX = view.preset.scatterX;
    }
    if (view.preset.scatterY != null) {
      state.scatterY = view.preset.scatterY;
    }
    syncControlsFromState();
    syncScatterOptions();
    syncSplitFeatureOptions();
    syncXaiOptions();
    elements.scatterX.value = state.scatterX;
    elements.scatterY.value = state.scatterY;
    if (rerun) {
      runAnalysis();
    }
  }

  function syncControlsFromState() {
    elements.viewSelect.value = state.viewId;
    elements.datasetSelect.value = state.datasetId;
    elements.validationMode.value = state.validationMode;
    elements.stratifyToggle.checked = state.stratify;
    elements.framingMode.value = state.framingMode;
    syncFocusModelOptions();
    elements.focusModel.value = state.focusModel;
    setPairValue("analysisSeed", "analysisSeed_num", state.seed);
    setPairValue("testFraction", "testFraction_num", state.testFraction);
    setPairValue("kFolds", "kFolds_num", state.kFolds);
    setPairValue("knnK", "knnK_num", state.knnK);
    setPairValue("logisticPenalty", "logisticPenalty_num", state.logisticPenalty);
    setPairValue("treeDepth", "treeDepth_num", state.treeDepth);
    setPairValue("forestTrees", "forestTrees_num", state.forestTrees);
    elements.splitFeature.value = state.splitFeature;
    setPairValue("nnHidden", "nnHidden_num", state.nnHidden);
    setPairValue("nnEpochs", "nnEpochs_num", state.nnEpochs);
    setPairValue("svmC", "svmC_num", state.svmC);
    setPairValue("svmGamma", "svmGamma_num", state.svmGamma);
    setPairValue("clusterK", "clusterK_num", state.clusterK);
    setPairValue("gmmComponents", "gmmComponents_num", state.gmmComponents);
    setPairValue("xaiIndex", "xaiIndex_num", state.xaiIndex + 1);
  }

  function runAnalysis() {
    const dataset = getActiveDataset();
    cache.dataset = dataset;
    cache.pca = computePCA(dataset.data, 2);
    cache.mds = computeClassicalMDS(cache.pca.standardized, 2, state.seed + 5);
    cache.split = createTrainTestSplit(dataset.target, state.testFraction, state.stratify, state.seed + 11);
    cache.folds = createKFolds(dataset.target, state.kFolds, state.stratify, state.seed + 23);
    cache.resamplingExperiment = state.viewId === "week3" ? evaluatePermutationExperiment(dataset) : null;
    cache.bootstrapExperiment = state.viewId === "week3" ? evaluateBootstrapExperiment(dataset) : null;
    cache.week4Regularisation = state.viewId === "week4" ? evaluateWeek4Regularisation(dataset) : null;
    cache.classification = classificationViews().has(state.viewId) ? evaluateClassificationModels(dataset) : null;
    cache.neural = state.viewId === "week6" ? evaluateNeuralNetwork(dataset) : null;
    cache.clustering = evaluateClustering(dataset, cache.pca);

    renderAppChrome();
    renderProblemFraming();
    renderDatasetMeta();
    renderQuickControls();
    renderVisualisationPanels();
    renderResamplingPanels();
    renderClassificationPanels();
    renderWeek4Regularisation();
    renderWeek5Lab();
    renderClusteringPanels();
    renderNeuralLab();
    renderXaiLab();
  }

  function renderAppChrome() {
    const view = VIEWS[state.viewId] || VIEWS.home;
    const isHome = state.viewId === "home";
    const visibleControls = new Set(view.controls || []);
    const showSettingsDrawer = !isHome && state.settingsOpen;

    if (isHome) {
      state.settingsOpen = false;
    }

    document.body.dataset.view = state.viewId;
    document.body.classList.toggle("settings-open", showSettingsDrawer);
    setVisible(elements.homeView, isHome);
    setVisible(elements.moreSettingsPanel, !isHome);
    setVisible(elements.settingsBackdrop, showSettingsDrawer);
    setVisible(elements.quickControlsBar, !isHome);
    setVisible(elements.weekShell, !isHome);
    setVisible(elements.currentWeekBlock, !isHome);
    elements.settingsToggleBtn.setAttribute("aria-expanded", String(showSettingsDrawer));

    elements.controlGroups.forEach((group) => {
      setVisible(group, !isHome && visibleControls.has(group.dataset.controlGroup));
    });
    elements.weekSections.forEach((section) => {
      const allowed = (section.dataset.views || "").split(/\s+/).includes(state.viewId);
      setVisible(section, !isHome && allowed);
    });

    elements.currentWeekLabel.textContent = view.label;
    elements.currentWeekTitle.textContent = view.title;
    elements.currentWeekSummary.textContent = view.summary;
    elements.viewKicker.textContent = view.label;
    elements.viewTitle.textContent = view.title;
    elements.viewSummary.textContent = view.summary;
    elements.viewPrompt.textContent = view.prompt || "";
    elements.tutorialPath.textContent = view.tutorialPath ? `Related worksheet: ${view.tutorialPath}` : "";
    elements.viewTutorialPath.textContent = view.tutorialPath ? `Related worksheet: ${view.tutorialPath}` : "";
    setVisible(elements.tutorialPath, !isHome && Boolean(view.tutorialPath));
    setVisible(elements.viewTutorialPath, !isHome && Boolean(view.tutorialPath));
    setVisible(elements.viewPresetBtn, !isHome);
    setVisible(elements.clusterEvaluationPanel, state.viewId === "week11");
    setVisible(elements.modelClusteringPanel, state.viewId === "week10");
    setVisible(elements.week10ScopePanel, state.viewId === "week10");
    setVisible(elements.classificationKnnControl, state.viewId === "foundations");
    setVisible(elements.classificationLogisticControl, state.viewId === "week4");
    setVisible(elements.classificationTreeControl, state.viewId === "week5");
    setVisible(elements.week4RegularisationPanel, state.viewId === "week4");

    elements.problemIntro.textContent = view.copy?.problem || "";
    elements.visualIntro.textContent = view.copy?.visual || "";
    elements.resamplingIntro.textContent = view.copy?.resampling || "";
    elements.classificationIntro.textContent = view.copy?.classification || "";
    elements.week5Intro.textContent = view.copy?.week5 || "";
    elements.clusteringIntro.textContent = view.copy?.clustering || "";
    elements.neuralIntro.textContent = view.copy?.neural || "";
    elements.xaiIntro.textContent = view.copy?.xai || "";
    elements.classificationKicker.textContent = view.label;
    elements.clusteringKicker.textContent = view.label;
  }

  function getViewFromHash() {
    const hash = window.location.hash.replace("#", "");
    return VIEWS[hash] ? hash : null;
  }

  function classificationViews() {
    return new Set(["foundations", "week4", "week5", "week6", "week7", "week8"]);
  }

  function renderQuickControls() {
    if (state.viewId === "home") {
      return;
    }

    const view = VIEWS[state.viewId];
    const config = quickControlConfig(state.viewId);
    elements.quickControlsTitle.textContent = `${view.label}: controls`;
    elements.quickControlsGrid.innerHTML = config.map(renderQuickControlCard).join("");

    elements.quickControlsGrid.querySelectorAll("[data-quick-key]").forEach((input) => {
      const key = input.dataset.quickKey;
      const type = input.dataset.quickType;
      const handler = () => {
        applyQuickControlChange(key, type, input);
      };
      input.addEventListener(type === "checkbox" ? "change" : "input", handler);
      if (input.tagName === "SELECT" || input.type === "number") {
        input.addEventListener("change", handler);
      }
    });
  }

  function setSettingsOpen(nextOpen) {
    state.settingsOpen = Boolean(nextOpen) && state.viewId !== "home";
    renderAppChrome();
  }

  function quickControlConfig(viewId) {
    const byView = {
      foundations: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "focusModel", label: "Focus model", type: "select", options: classificationModelOptions() },
        { key: "knnK", label: "KNN k", type: "range", min: 1, max: 25, step: 2 }
      ],
      week2: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "scatterX", label: "X feature", type: "select", options: featureOptions() },
        { key: "scatterY", label: "Y feature", type: "select", options: featureOptions() }
      ],
      week3: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "validationMode", label: "Validation", type: "select", options: validationOptions() },
        { key: "stratify", label: "Stratify", type: "checkbox" }
      ],
      week4: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "focusModel", label: "Focus model", type: "select", options: classificationModelOptions(["logistic", "lda"]) },
        { key: "logisticPenalty", label: "Penalty", type: "range", min: 0.001, max: 0.2, step: 0.001 }
      ],
      week5: [
        { key: "splitFeature", label: "Split feature", type: "select", options: featureOptions() },
        { key: "focusModel", label: "Focus model", type: "select", options: classificationModelOptions(["tree", "forest"]) },
        { key: "treeDepth", label: "Tree depth", type: "range", min: 1, max: 8, step: 1 }
      ],
      week6: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "nnHidden", label: "Hidden units", type: "range", min: 3, max: 24, step: 1 },
        { key: "nnEpochs", label: "Epochs", type: "range", min: 60, max: 320, step: 20 }
      ],
      week7: [
        { key: "focusModel", label: "Focus model", type: "select", options: classificationModelOptions() },
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "xaiIndex", label: "Selected row", type: "range", min: 1, max: cache.dataset?.n || 1, step: 1, displayValue: state.xaiIndex + 1 }
      ],
      week8: [
        { key: "focusModel", label: "Focus model", type: "select", options: classificationModelOptions(["svm_linear", "svm_rbf"]) },
        { key: "svmC", label: "SVM C", type: "range", min: 0.2, max: 3, step: 0.2 },
        { key: "svmGamma", label: "RBF gamma", type: "range", min: 0.2, max: 3, step: 0.2 }
      ],
      week9: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "clusterK", label: "Clusters", type: "range", min: 2, max: 8, step: 1 }
      ],
      week10: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "clusterK", label: "Clusters", type: "range", min: 2, max: 8, step: 1 },
        { key: "gmmComponents", label: "Mixture parts", type: "range", min: 2, max: 8, step: 1 }
      ],
      week11: [
        { key: "datasetId", label: "Dataset", type: "select", options: datasetOptions() },
        { key: "clusterK", label: "Clusters", type: "range", min: 2, max: 8, step: 1 }
      ]
    };
    return byView[viewId] || [];
  }

  function renderQuickControlCard(item) {
    if (item.type === "select") {
      const options = item.options
        .map((option) => {
          const selected = String(option.value) === String(state[item.key]) ? " selected" : "";
          return `<option value="${escapeHtml(option.value)}"${selected}>${escapeHtml(option.label)}</option>`;
        })
        .join("");
      return `
        <div class="quick-control">
          <label for="quick_${item.key}">${escapeHtml(item.label)}</label>
          <select id="quick_${item.key}" data-quick-key="${item.key}" data-quick-type="select">${options}</select>
        </div>
      `;
    }

    if (item.type === "checkbox") {
      return `
        <div class="quick-control compact-check">
          <label>${escapeHtml(item.label)}</label>
          <div class="quick-check-row">
            <input id="quick_${item.key}" type="checkbox" data-quick-key="${item.key}" data-quick-type="checkbox"${state[item.key] ? " checked" : ""} />
            <span>${state[item.key] ? "On" : "Off"}</span>
          </div>
        </div>
      `;
    }

    const displayValue = item.displayValue != null ? item.displayValue : state[item.key];
    return `
      <div class="quick-control">
        <label for="quick_${item.key}">${escapeHtml(item.label)}</label>
        <div class="quick-range-row">
          <input
            id="quick_${item.key}"
            type="range"
            min="${item.min}"
            max="${item.max}"
            step="${item.step}"
            value="${displayValue}"
            data-quick-key="${item.key}"
            data-quick-type="range"
          />
          <input
            id="quick_${item.key}_num"
            type="number"
            min="${item.min}"
            max="${item.max}"
            step="${item.step}"
            value="${displayValue}"
            data-quick-key="${item.key}"
            data-quick-type="range"
          />
        </div>
      </div>
    `;
  }

  function applyQuickControlChange(key, type, input) {
    if (type === "select") {
      updateStateValue(key, input.value);
      return;
    }

    if (type === "checkbox") {
      updateStateValue(key, input.checked);
      renderQuickControls();
      return;
    }

    const value = Number(input.value);
    const pairId = input.id.endsWith("_num") ? input.id.slice(0, -4) : `${input.id}_num`;
    const pair = document.getElementById(pairId);
    if (pair) {
      pair.value = value;
    }
    updateStateValue(key, value);
  }

  function updateStateValue(key, rawValue) {
    switch (key) {
      case "datasetId":
        state.datasetId = rawValue;
        syncScatterOptions();
        syncSplitFeatureOptions();
        syncXaiOptions();
        runAnalysis();
        return;
      case "validationMode":
        state.validationMode = rawValue;
        runAnalysis();
        return;
      case "stratify":
        state.stratify = Boolean(rawValue);
        runAnalysis();
        return;
      case "scatterX":
      case "scatterY":
        state[key] = Number(rawValue);
        if (state.scatterX === state.scatterY) {
          state.scatterY = state.scatterX === 0 ? 1 : 0;
        }
        renderQuickControls();
        renderVisualisationPanels();
        syncControlsFromState();
        return;
      case "focusModel":
        state.focusModel = rawValue;
        syncControlsFromState();
        renderQuickControls();
        renderModelInspection();
        renderWeek4Regularisation();
        renderWeek5Lab();
        renderXaiLab();
        return;
      case "splitFeature":
        state.splitFeature = clamp(Math.round(rawValue), 0, Math.max(0, (cache.dataset?.p || 1) - 1));
        syncControlsFromState();
        renderQuickControls();
        renderWeek5Lab();
        return;
      case "xaiIndex":
        state.xaiIndex = clamp(Math.round(rawValue) - 1, 0, Math.max(0, (cache.dataset?.n || 1) - 1));
        syncControlsFromState();
        renderQuickControls();
        renderXaiLab();
        return;
      case "knnK": {
        const odd = Math.max(1, Math.round(rawValue));
        state.knnK = odd % 2 === 0 ? odd + 1 : odd;
        syncControlsFromState();
        runAnalysis();
        return;
      }
      case "logisticPenalty":
        state.logisticPenalty = clamp(Number(rawValue), 0.001, 0.2);
        syncControlsFromState();
        runAnalysis();
        return;
      case "forestTrees": {
        const odd = Math.max(5, Math.round(rawValue));
        state.forestTrees = odd % 2 === 0 ? odd + 1 : odd;
        syncControlsFromState();
        runAnalysis();
        return;
      }
      case "treeDepth":
        state.treeDepth = clamp(Math.round(rawValue), 1, 8);
        syncControlsFromState();
        runAnalysis();
        return;
      case "nnHidden":
        state.nnHidden = clamp(Math.round(rawValue), 3, 24);
        syncControlsFromState();
        runAnalysis();
        return;
      case "nnEpochs":
        state.nnEpochs = clamp(Math.round(rawValue), 60, 320);
        syncControlsFromState();
        runAnalysis();
        return;
      case "svmC":
        state.svmC = clamp(Number(rawValue), 0.2, 3);
        syncControlsFromState();
        runAnalysis();
        return;
      case "svmGamma":
        state.svmGamma = clamp(Number(rawValue), 0.2, 3);
        syncControlsFromState();
        runAnalysis();
        return;
      case "clusterK":
        state.clusterK = clamp(Math.round(rawValue), 2, 8);
        syncControlsFromState();
        runAnalysis();
        return;
      case "gmmComponents":
        state.gmmComponents = clamp(Math.round(rawValue), 2, 8);
        syncControlsFromState();
        runAnalysis();
        return;
      case "testFraction":
        state.testFraction = clamp(Number(rawValue), 0.15, 0.45);
        syncControlsFromState();
        renderQuickControls();
        runAnalysis();
        return;
      case "kFolds":
        state.kFolds = clamp(Math.round(rawValue), 3, 10);
        syncControlsFromState();
        runAnalysis();
        return;
      default:
        return;
    }
  }

  function datasetOptions() {
    return Object.entries(datasetRegistry()).map(([value, dataset]) => ({
      value,
      label: dataset.name
    }));
  }

  function featureOptions() {
    const dataset = cache.dataset || getActiveDataset();
    return dataset.columns.map((label, index) => ({
      value: index,
      label
    }));
  }

  function validationOptions() {
    return [
      { value: "holdout", label: "Train/test split" },
      { value: "cv", label: "k-fold cross-validation" }
    ];
  }

  function classificationModelOptions(allowed = null) {
    const labels = {
      knn: "KNN",
      logistic: "Logistic regression",
      lda: "LDA",
      tree: "Decision tree",
      forest: "Random forest",
      svm_linear: "Linear SVM",
      svm_rbf: "RBF SVM"
    };
    return Object.entries(labels)
      .filter(([value]) => !allowed || allowed.includes(value))
      .map(([value, label]) => ({ value, label }));
  }

  function focusModelAllowedByView() {
    if (state.viewId === "week4") {
      return ["logistic", "lda"];
    }
    if (state.viewId === "week5") {
      return ["tree", "forest"];
    }
    if (state.viewId === "week8") {
      return ["svm_linear", "svm_rbf"];
    }
    return null;
  }

  function syncFocusModelOptions() {
    const options = classificationModelOptions(focusModelAllowedByView());
    if (!options.length) {
      return;
    }
    elements.focusModel.innerHTML = options
      .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
      .join("");
    if (!options.some((option) => option.value === state.focusModel)) {
      state.focusModel = options[0].value;
    }
  }

  function getActiveDataset() {
    const registry = datasetRegistry();
    const raw = registry[state.datasetId];
    const target = raw.target.slice();
    const targetNames = raw.target_names ? raw.target_names.slice() : [];
    const columns = raw.columns.slice();
    return {
      id: state.datasetId,
      name: raw.name,
      data: raw.data.map((row) => row.slice()),
      target,
      targetNames,
      columns,
      n: raw.data.length,
      p: columns.length,
      description: raw.description || "",
      source: raw.source || "",
      hasLabels: target.length > 0
    };
  }

  function syncScatterOptions() {
    const dataset = getActiveDataset();
    const options = dataset.columns.map((label, index) => {
      return `<option value="${index}">${escapeHtml(label)}</option>`;
    });
    elements.scatterX.innerHTML = options.join("");
    elements.scatterY.innerHTML = options.join("");
    state.scatterX = Math.min(state.scatterX, dataset.columns.length - 1);
    state.scatterY = Math.min(Math.max(state.scatterY, 1), dataset.columns.length - 1);
    if (state.scatterX === state.scatterY) {
      state.scatterY = state.scatterX === 0 ? 1 : 0;
    }
    elements.scatterX.value = state.scatterX;
    elements.scatterY.value = state.scatterY;
  }

  function syncSplitFeatureOptions() {
    const dataset = getActiveDataset();
    const options = dataset.columns.map((label, index) => {
      return `<option value="${index}">${escapeHtml(label)}</option>`;
    });
    elements.splitFeature.innerHTML = options.join("");
    state.splitFeature = clamp(state.splitFeature, 0, dataset.columns.length - 1);
    elements.splitFeature.value = state.splitFeature;
  }

  function syncXaiOptions() {
    const dataset = cache.dataset || getActiveDataset();
    state.xaiIndex = clamp(state.xaiIndex, 0, Math.max(0, dataset.n - 1));
    elements.xaiIndex.min = 1;
    elements.xaiIndex.max = dataset.n;
    elements.xaiIndex_num.min = 1;
    elements.xaiIndex_num.max = dataset.n;
    setPairValue("xaiIndex", "xaiIndex_num", state.xaiIndex + 1);
    elements.xaiIndexNote.textContent = `${dataset.name}: row ${state.xaiIndex + 1} of ${dataset.n}`;
  }

  function renderProblemFraming() {
    const descriptions = {
      classification:
        "Classification predicts a category. Here, x is the feature vector for one observation and y is the class label such as species, cultivar, or toy class.",
      regression:
        "Regression predicts a numeric outcome. The same x stores the measured features, while y is a continuous number such as price, score, or temperature.",
      clustering:
        "Clustering does not fit y during training. We use x to discover groups, and only compare against y later when a labelled dataset gives us a benchmark."
    };

    elements.framingSummary.textContent = descriptions[state.framingMode];

    const xyBlock = {
      classification: `x = [feature_1, feature_2, ..., feature_p]\ny = class label\n\nExample:\nx = [sepal length, sepal width, petal length, petal width]\ny = "setosa"`,
      regression: `x = [feature_1, feature_2, ..., feature_p]\ny = continuous outcome\n\nExample:\nx = [study hours, attendance, tutorial score]\ny = final exam mark`,
      clustering: `x = [feature_1, feature_2, ..., feature_p]\ny = optional reference label\n\nFit uses x only.\nIf labels exist, y is used afterward to judge cluster quality.`
    };
    elements.xyDefinition.textContent = xyBlock[state.framingMode];
    renderStandardisationPanel();
  }

  function renderDatasetMeta() {
    const dataset = cache.dataset;
    const counts = countByLabel(dataset.target, dataset.targetNames.length);
    const balance = dataset.targetNames
      .map((label, index) => `${label}: ${counts[index]}`)
      .join(" | ");
    const lines = [
      `${dataset.name}: ${dataset.n} rows, ${dataset.p} features, ${dataset.targetNames.length} labelled classes.`,
      balance
    ];
    if (dataset.description) {
      lines.push(dataset.description);
    }
    elements.datasetMeta.textContent = lines.join(" ");
    elements.datasetTeachingNote.textContent = buildDatasetTeachingNote(dataset);
  }

  function renderStandardisationPanel() {
    const dataset = cache.dataset;
    const stats = describeFeatureScales(dataset.data, dataset.columns);
    elements.standardisationSummary.textContent =
      `Raw feature spreads\n${stats.lines.join("\n")}\n\nLargest spread is about ${formatNumber(
        stats.maxStd / Math.max(stats.minStd, 1e-9),
        1
      )}x the smallest.`;
    elements.standardisationCaption.textContent =
      "Plain-English caption: the app standardises features before PCA, MDS, KNN, logistic regression, LDA, and clustering so variables with larger units do not dominate the analysis just because of scale.";
  }

  function buildDatasetTeachingNote(dataset) {
    const notes = {
      iris:
        "Iris is a clean introductory dataset. It helps show how visible class separation in plots often lines up with strong classifier performance.",
      penguins:
        "Penguins is more realistic: species overlap in some measurements, so confusion matrices and validation choices matter more than they do on Iris.",
      wine:
        "Wine has richer multivariate structure, so PCA and MDS become more informative. It is a good teaching case for dimension reduction before comparison.",
      toy_linear:
        "This toy dataset is intentionally friendly to linear boundaries, so it gives a baseline for what simple classification looks like when the geometry matches the model.",
      toy_nonlinear:
        "This toy dataset is intentionally curved, so local methods like KNN should look stronger than linear boundaries in both the scores and the decision map.",
      toy_clusters:
        "This toy dataset is useful for unsupervised learning: the labels are kept only for evaluation after clustering, not for fitting the clusters."
    };
    return notes[dataset.id] || "";
  }

  function renderVisualisationPanels() {
    const dataset = cache.dataset;
    const pca = cache.pca;
    const mds = cache.mds;
    const xIndex = state.scatterX;
    const yIndex = state.scatterY;

    elements.pairScatterSummary.textContent =
      `This view compares ${dataset.columns[xIndex]} against ${dataset.columns[yIndex]}. Use it to see simple overlap, linear trends, or class separation before moving to reduced dimensions.`;

    const pairPoints = dataset.data.map((row, index) => ({
      x: row[xIndex],
      y: row[yIndex],
      classId: dataset.target[index],
      label: dataset.targetNames[dataset.target[index]]
    }));
    renderScatterSvg(elements.pairScatterPlot, pairPoints, dataset.columns[xIndex], dataset.columns[yIndex]);
    elements.pairScatterCaption.textContent =
      `Plain-English caption: raw feature plots show whether separation is already visible in the original variables. If classes overlap heavily here, a single pair of variables is probably not enough.`;

    const pcaPoints = pca.scores.map((row, index) => ({
      x: row[0],
      y: row[1],
      classId: dataset.target[index],
      label: dataset.targetNames[dataset.target[index]]
    }));
    renderScatterSvg(elements.pcaPlot, pcaPoints, "PC1", "PC2");
    elements.pcaCaption.textContent =
      `Plain-English caption: PCA rotates the standardized data into directions of maximum variance. PC1 explains ${formatPct(
        pca.explained[0]
      )} and PC2 explains ${formatPct(pca.explained[1])}, so this view preserves the strongest linear variation.`;

    const mdsPoints = mds.coords.map((row, index) => ({
      x: row[0],
      y: row[1],
      classId: dataset.target[index],
      label: dataset.targetNames[dataset.target[index]]
    }));
    renderScatterSvg(elements.mdsPlot, mdsPoints, "MDS1", "MDS2");
    elements.mdsCaption.textContent =
      `Plain-English caption: classical MDS tries to place points so that pairwise distances in the plot match pairwise distances in the full feature space. Use it when distance preservation matters more than variance explanation.`;
  }

  function renderResamplingPanels() {
    if (state.viewId !== "week3") {
      return;
    }
    const dataset = cache.dataset;
    const split = cache.split;
    const folds = cache.folds;
    const experiment = cache.resamplingExperiment;
    const bootstrap = cache.bootstrapExperiment;
    const classNames = dataset.targetNames;

    const splitRows = classNames.map((label, index) => {
      const fullCount = split.full[index];
      const trainCount = split.train[index];
      const testCount = split.test[index];
      return [
        label,
        `${trainCount} (${formatPct(trainCount / Math.max(1, split.trainSize))})`,
        `${testCount} (${formatPct(testCount / Math.max(1, split.testSize))})`,
        `${fullCount} (${formatPct(fullCount / dataset.n)})`
      ];
    });
    renderTable(elements.splitBalanceTable, ["Class", "Train", "Test", "Full"], splitRows);

    const balanceShift = splitRows
      .map((row) => `${row[0]} train/test ${row[1]} vs ${row[2]}`)
      .join("; ");
    elements.splitCaption.textContent =
      `${state.stratify ? "Stratification is on" : "Stratification is off"}, so the split ${
        state.stratify ? "tries to preserve" : "can distort"
      } class proportions. ${balanceShift}.`;

    const foldRows = folds.testDistributions.map((dist, foldIndex) => {
      const parts = classNames.map((label, classIndex) => `${label}: ${dist[classIndex]}`);
      return [`Fold ${foldIndex + 1}`, parts.join(" | "), `${folds.testSizes[foldIndex]} rows`];
    });
    renderTable(elements.foldBalanceTable, ["Held-out fold", "Class balance", "Fold size"], foldRows);
    elements.foldCaption.textContent =
      `k-fold cross-validation rotates the held-out data across ${state.kFolds} folds. ${
        state.stratify
          ? "With stratification on, every fold stays close to the global class mix."
          : "With stratification off, some folds can over-represent one class and under-represent another."
      }`;

    if (!experiment) {
      return;
    }

    renderPermutationHistogramSvg(elements.permutationPlot, experiment);
    elements.permutationSummary.textContent =
      `Probe model\nLogistic regression\n\n` +
      `Observed balanced accuracy: ${formatPct(experiment.observedScore)}\n` +
      `Shuffled-label median: ${formatPct(experiment.nullMedian)}\n` +
      `Middle 80% of shuffled-label scores: ${formatPct(experiment.nullLow)} to ${formatPct(experiment.nullHigh)}\n` +
      `Tail probability estimate: ${formatNumber(experiment.tailProbability, 3)}\n` +
      `Class-count chance guide: ${formatPct(experiment.chanceLevel)}`;
    elements.permutationCaption.textContent =
      `${state.validationMode === "holdout" ? "This uses the current holdout split." : `This uses the current ${state.kFolds}-fold cross-validation setup.`} The labels are shuffled ${experiment.runs} times while the features stay fixed. If the observed score sits well to the right of the shuffled-label distribution, the workflow is finding real signal rather than just exploiting chance structure.`;

    if (!bootstrap) {
      return;
    }

    if (!bootstrap.validRuns) {
      renderMessageSvg(elements.bootstrapPlot, "Bootstrap runs did not produce a usable out-of-bag score.");
      elements.bootstrapSummary.textContent =
        `Probe model\nLogistic regression\n\n` +
        `Bootstrap runs attempted: ${bootstrap.runs}\n` +
        `Usable runs: 0`;
      elements.bootstrapCaption.textContent =
        `This bootstrap view skips runs whose out-of-bag rows do not contain every class, so some datasets can be too small or too imbalanced for a stable summary here.`;
      return;
    }

    renderBootstrapHistogramSvg(elements.bootstrapPlot, bootstrap);
    elements.bootstrapSummary.textContent =
      `Probe model\nLogistic regression\n\n` +
      `Bootstrap median balanced accuracy: ${formatPct(bootstrap.medianScore)}\n` +
      `Middle 80% of bootstrap scores: ${formatPct(bootstrap.lowScore)} to ${formatPct(bootstrap.highScore)}\n` +
      `Mean out-of-bag rows per run: ${formatNumber(bootstrap.meanOobSize, 1)}\n` +
      `Runs with all classes represented out of bag: ${bootstrap.validRuns} of ${bootstrap.runs}`;
    elements.bootstrapCaption.textContent =
      `Bootstrap resampling draws ${dataset.n} training rows with replacement, then evaluates the fitted model on the out-of-bag rows left out of that draw. Use this panel to judge score stability across repeated resampled training sets; unlike the permutation panel, it is about variability under resampling rather than a no-signal null baseline.`;
  }

  function evaluatePermutationExperiment(dataset) {
    const evaluationSplits =
      state.validationMode === "holdout"
        ? [{ train: cache.split.trainIndices, test: cache.split.testIndices }]
        : cache.folds.foldIndices.map((testIndices) => ({
            train: complementIndices(dataset.n, testIndices),
            test: testIndices
          }));

    const observedScore = evaluateLogisticBalancedAccuracy(dataset.data, dataset.target, dataset.columns, evaluationSplits, dataset.targetNames.length);
    const nullScores = [];
    for (let runIndex = 0; runIndex < PERMUTATION_RUNS; runIndex += 1) {
      const shuffledTarget = shuffle(dataset.target.slice(), mulberry32(state.seed + 601 + runIndex * 17));
      nullScores.push(
        evaluateLogisticBalancedAccuracy(dataset.data, shuffledTarget, dataset.columns, evaluationSplits, dataset.targetNames.length)
      );
    }
    const sortedNull = nullScores.slice().sort((a, b) => a - b);
    const tailCount = nullScores.filter((score) => score >= observedScore - 1e-12).length;

    return {
      runs: PERMUTATION_RUNS,
      observedScore,
      nullScores,
      nullMedian: quantile(sortedNull, 0.5),
      nullLow: quantile(sortedNull, 0.1),
      nullHigh: quantile(sortedNull, 0.9),
      tailProbability: (tailCount + 1) / (PERMUTATION_RUNS + 1),
      chanceLevel: 1 / Math.max(1, dataset.targetNames.length)
    };
  }

  function evaluateBootstrapExperiment(dataset) {
    const scores = [];
    const oobSizes = [];

    for (let runIndex = 0; runIndex < BOOTSTRAP_RUNS; runIndex += 1) {
      const draw = bootstrapSampleIndices(dataset.n, state.seed + 801 + runIndex * 23);
      const used = new Set(draw);
      const oob = range(dataset.n).filter((index) => !used.has(index));
      if (!oob.length) {
        continue;
      }

      const oobClasses = uniqueSorted(oob.map((index) => dataset.target[index]));
      if (oobClasses.length < dataset.targetNames.length) {
        continue;
      }

      const trainX = selectRows(dataset.data, draw);
      const trainY = selectEntries(dataset.target, draw);
      const testX = selectRows(dataset.data, oob);
      const testY = selectEntries(dataset.target, oob);
      const fit = fitLogisticOvr(trainX, trainY, dataset.columns, DEFAULT_LOGISTIC_PENALTY);
      const preds = fit.predict(testX);
      scores.push(computeBalancedAccuracy(testY, preds, dataset.targetNames.length));
      oobSizes.push(oob.length);
    }

    const sortedScores = scores.slice().sort((a, b) => a - b);
    return {
      runs: BOOTSTRAP_RUNS,
      validRuns: scores.length,
      scores,
      medianScore: quantile(sortedScores, 0.5),
      lowScore: quantile(sortedScores, 0.1),
      highScore: quantile(sortedScores, 0.9),
      meanOobSize: average(oobSizes)
    };
  }

  function evaluateWeek4Regularisation(dataset) {
    const currentPenalty = state.logisticPenalty;
    const weakPenalty = Math.max(0.001, currentPenalty / 4);
    const strongPenalty = Math.min(0.2, Math.max(currentPenalty * 4, currentPenalty + 0.02));
    const weakFit = fitLogisticOvr(dataset.data, dataset.target, dataset.columns, weakPenalty);
    const currentFit = fitLogisticOvr(dataset.data, dataset.target, dataset.columns, currentPenalty);
    const strongFit = fitLogisticOvr(dataset.data, dataset.target, dataset.columns, strongPenalty);
    const weakValues = averageAbsWeightsArray(weakFit.weights, dataset.columns.length);
    const currentValues = averageAbsWeightsArray(currentFit.weights, dataset.columns.length);
    const strongValues = averageAbsWeightsArray(strongFit.weights, dataset.columns.length);
    const orderedFeatures = range(dataset.columns.length)
      .sort((a, b) => currentValues[b] - currentValues[a])
      .slice(0, 5);

    return {
      headers: [
        "Feature",
        `Weak (${formatNumber(weakPenalty, 3)})`,
        `Current (${formatNumber(currentPenalty, 3)})`,
        `Strong (${formatNumber(strongPenalty, 3)})`
      ],
      rows: orderedFeatures.map((featureIndex) => [
        dataset.columns[featureIndex],
        formatNumber(weakValues[featureIndex], 3),
        formatNumber(currentValues[featureIndex], 3),
        formatNumber(strongValues[featureIndex], 3)
      ]),
      weakPenalty,
      currentPenalty,
      strongPenalty,
      weakMean: average(weakValues),
      currentMean: average(currentValues),
      strongMean: average(strongValues),
      strongLeader: dataset.columns[argMax(strongValues)]
    };
  }

  function evaluateLogisticBalancedAccuracy(X, y, columns, evaluationSplits, classCount) {
    const predicted = new Array(y.length).fill(null);
    evaluationSplits.forEach((split) => {
      const trainX = selectRows(X, split.train);
      const trainY = selectEntries(y, split.train);
      const testX = selectRows(X, split.test);
      const fit = fitLogisticOvr(trainX, trainY, columns, DEFAULT_LOGISTIC_PENALTY);
      const preds = fit.predict(testX);
      split.test.forEach((rowIndex, localIndex) => {
        predicted[rowIndex] = preds[localIndex];
      });
    });

    const actual = [];
    const filteredPredicted = [];
    predicted.forEach((value, index) => {
      if (value != null) {
        actual.push(y[index]);
        filteredPredicted.push(value);
      }
    });
    return computeBalancedAccuracy(actual, filteredPredicted, classCount);
  }

  function renderClassificationPanels() {
    const evaluation = cache.classification;
    if (!evaluation) {
      return;
    }
    const rows = evaluation.order.map((modelId) => {
      const metrics = evaluation.metrics[modelId];
      return [
        evaluation.labels[modelId],
        formatPct(metrics.accuracy),
        formatPct(metrics.macroF1)
      ];
    });
    renderTable(elements.classificationMetricsTable, ["Model", "Accuracy", "Macro F1"], rows);
    elements.classificationModeCaption.textContent =
      state.validationMode === "holdout"
        ? `Metrics come from a reproducible ${Math.round(state.testFraction * 100)}% test split. The seed controls the split, and stratification changes whether the train and test sets keep the same class proportions.`
        : `Metrics come from reproducible ${state.kFolds}-fold cross-validation. Every row is predicted out of fold, so the scores summarize how the models generalize across repeated train/test rotations.`;

    renderModelInspection();
  }

  function renderWeek4Regularisation() {
    if (state.viewId !== "week4") {
      return;
    }
    const comparison = cache.week4Regularisation;
    if (!comparison) {
      return;
    }
    renderTable(elements.week4RegularisationTable, comparison.headers, comparison.rows);
    elements.week4RegularisationSummary.textContent =
      `Penalty settings\n` +
      `Weak: ${formatNumber(comparison.weakPenalty, 3)}\n` +
      `Current: ${formatNumber(comparison.currentPenalty, 3)}\n` +
      `Strong: ${formatNumber(comparison.strongPenalty, 3)}\n\n` +
      `Mean |coefficient|\n` +
      `Weak: ${formatNumber(comparison.weakMean, 3)}\n` +
      `Current: ${formatNumber(comparison.currentMean, 3)}\n` +
      `Strong: ${formatNumber(comparison.strongMean, 3)}\n\n` +
      `Most persistent feature under strong penalty: ${comparison.strongLeader}`;
    elements.week4RegularisationCaption.textContent =
      "Plain-English caption: stronger regularisation pulls the logistic coefficients closer to zero. Features that stay relatively large even under the strong setting are the ones carrying the most stable linear signal.";
  }

  function renderWeek5Lab() {
    if (state.viewId !== "week5") {
      return;
    }
    const dataset = cache.dataset;
    const evaluation = cache.classification;
    if (!dataset || !evaluation) {
      return;
    }

    const treeFit = evaluation.fits.tree;
    const forestFit = evaluation.fits.forest;
    const split = computeSplitExplorer(dataset, state.splitFeature);
    renderWeek5SplitExplorer(split, dataset);
    renderWeek5TreeView(dataset, treeFit.tree);
    renderWeek5Comparison(evaluation, dataset);
    renderWeek5FocusedModel(evaluation, dataset);
    renderWeek5HardCases(dataset, evaluation);
    renderWeek5Importance(dataset, forestFit);
  }

  function renderNeuralLab() {
    if (state.viewId !== "week6") {
      return;
    }
    const neural = cache.neural;
    const baselines = cache.classification;
    if (!neural || !baselines) {
      return;
    }

    const baselineIds = ["logistic", "forest", "svm_rbf"];
    const rows = baselineIds
      .filter((modelId) => baselines.metrics[modelId])
      .map((modelId) => [
        baselines.labels[modelId],
        formatPct(baselines.metrics[modelId].accuracy),
        formatPct(baselines.metrics[modelId].macroF1)
      ]);
    rows.push(["Neural network", formatPct(neural.metrics.accuracy), formatPct(neural.metrics.macroF1)]);
    renderTable(elements.nnMetricsTable, ["Model", "Accuracy", "Macro F1"], rows);
    elements.nnMetricsCaption.textContent =
      `The neural net uses ${state.nnHidden} hidden units and ${state.nnEpochs} epochs on standardized features. These scores come from the current ${
        state.validationMode === "holdout" ? "holdout split" : `${state.kFolds}-fold cross-validation setup`
      }, so use them to judge whether extra flexibility is improving generalisation rather than just lowering training loss.`;

    elements.nnSummary.textContent = neural.summary;

    const dataset = cache.dataset;
    if (!dataset.id.startsWith("toy_") || dataset.p !== 2) {
      setVisible(elements.nnBoundaryPanel, false);
      elements.nnSummaryPanel.style.gridColumn = "1 / -1";
      return;
    }

    setVisible(elements.nnBoundaryPanel, true);
    elements.nnSummaryPanel.style.gridColumn = "";
    const points = dataset.data.map((row, index) => ({
      x: row[0],
      y: row[1],
      classId: dataset.target[index]
    }));
    renderDecisionBoundarySvg(elements.nnBoundaryPlot, neural.fit.predict, points, dataset.targetNames.length);
    elements.nnBoundaryCaption.textContent =
      "Plain-English caption: the hidden layer lets the neural net bend the boundary instead of staying strictly linear. More hidden units or epochs can fit the training pattern more closely, but the validation table is the check on whether that extra flexibility is helping or just overfitting.";
  }

  function renderModelInspection() {
    const evaluation = cache.classification;
    if (!evaluation) {
      return;
    }

    const modelId = evaluation.details[state.focusModel] ? state.focusModel : evaluation.order[0];
    state.focusModel = modelId;
    elements.focusModel.value = modelId;
    const modelEval = evaluation.details[modelId];
    const dataset = cache.dataset;

    const confusion = confusionMatrix(modelEval.actual, modelEval.predicted, dataset.targetNames.length);
    const header = ["Actual \\ Predicted"].concat(dataset.targetNames);
    const rows = dataset.targetNames.map((label, rowIndex) => {
      return [label].concat(confusion[rowIndex].map((value) => String(value)));
    });
    renderTable(elements.confusionTable, header, rows);

    elements.modelSummary.textContent = evaluation.summaries[modelId];
    elements.confusionCaption.textContent =
      `Plain-English caption: the diagonal is correct predictions. Off-diagonal cells show which classes the model confuses under the current ${state.validationMode === "holdout" ? "train/test split" : "cross-validation"} setup.`;

    renderDecisionBoundary(modelId);
  }

  function renderDecisionBoundary(modelId) {
    const dataset = cache.dataset;
    if (!dataset.id.startsWith("toy_") || dataset.p !== 2) {
      setVisible(elements.boundaryPanel, false);
      elements.classificationSummaryPanel.style.gridColumn = "1 / -1";
      return;
    }

    setVisible(elements.boundaryPanel, true);
    elements.classificationSummaryPanel.style.gridColumn = "";
    const model = fitModel(modelId, dataset.data, dataset.target, dataset.columns);
    const points = dataset.data.map((row, index) => ({
      x: row[0],
      y: row[1],
      classId: dataset.target[index]
    }));
    renderDecisionBoundarySvg(elements.boundaryPlot, model.predict, points, dataset.targetNames.length);
    elements.boundaryCaption.textContent =
      "Plain-English caption: the coloured background shows the class each model would predict across the plane. The points are the observed data, so sharp bends or patchy regions usually signal a more local decision rule.";
  }

  function computeSplitExplorer(dataset, featureIndex) {
    const values = dataset.data.map((row) => row[featureIndex]).slice().sort((a, b) => a - b);
    const thresholds = [];
    for (let i = 1; i < values.length; i += 1) {
      if (values[i] !== values[i - 1]) {
        thresholds.push((values[i] + values[i - 1]) / 2);
      }
    }

    const parentImpurity = giniImpurity(dataset.target);
    const candidates = thresholds.map((threshold) => {
      const leftY = [];
      const rightY = [];
      dataset.data.forEach((row, index) => {
        if (row[featureIndex] <= threshold) {
          leftY.push(dataset.target[index]);
        } else {
          rightY.push(dataset.target[index]);
        }
      });
      const weightedImpurity =
        (leftY.length / dataset.n) * giniImpurity(leftY) +
        (rightY.length / dataset.n) * giniImpurity(rightY);
      return {
        threshold,
        weightedImpurity,
        gain: parentImpurity - weightedImpurity,
        leftY,
        rightY
      };
    });

    const best = candidates.reduce((current, candidate) => {
      if (!current || candidate.gain > current.gain) {
        return candidate;
      }
      return current;
    }, null);

    return {
      featureIndex,
      featureName: dataset.columns[featureIndex],
      parentImpurity,
      candidates,
      best
    };
  }

  function renderWeek5SplitExplorer(split, dataset) {
    renderWeek6SplitSvg(elements.week5SplitPlot, split);
    if (!split.best) {
      elements.week5SplitSummary.textContent = "No useful split candidates were found for this feature.";
      elements.week5SplitCaption.textContent =
        "Plain-English caption: if every candidate threshold leaves almost the same class mix on both sides, the tree has little reason to split here first.";
      return;
    }
    const leftCounts = countByLabel(split.best.leftY, dataset.targetNames.length);
    const rightCounts = countByLabel(split.best.rightY, dataset.targetNames.length);
    elements.week5SplitSummary.textContent =
      `Parent Gini: ${formatNumber(split.parentImpurity, 3)}\n` +
      `Best threshold on ${split.featureName}: ${formatNumber(split.best.threshold, 2)}\n` +
      `Weighted Gini after split: ${formatNumber(split.best.weightedImpurity, 3)}\n` +
      `Impurity reduction: ${formatNumber(split.best.gain, 3)}\n` +
      `Left side: ${summarizeCounts(leftCounts, dataset.targetNames)}\n` +
      `Right side: ${summarizeCounts(rightCounts, dataset.targetNames)}`;
    elements.week5SplitCaption.textContent =
      "Plain-English caption: lower weighted Gini means the split leaves purer child nodes. This is the core rule a classification tree is optimizing when it searches for the next split.";
  }

  function renderWeek5TreeView(dataset, tree) {
    const axes = chooseWeek6Axes(tree, dataset);
    const points = dataset.data.map((row, index) => ({
      x: row[axes.xIndex],
      y: row[axes.yIndex],
      classId: dataset.target[index],
      label: dataset.targetNames[dataset.target[index]]
    }));
    renderWeek6TreeSvg(elements.week5TreePlot, points, axes, tree);
    const leftSplit = tree.type === "split" && tree.left?.type === "split" ? `${tree.left.featureName} <= ${formatNumber(tree.left.threshold, 2)}` : "no second left split";
    const rightSplit = tree.type === "split" && tree.right?.type === "split" ? `${tree.right.featureName} <= ${formatNumber(tree.right.threshold, 2)}` : "no second right split";
    elements.week5TreeSummary.textContent =
      `Teaching slice\nx-axis: ${dataset.columns[axes.xIndex]}\ny-axis: ${dataset.columns[axes.yIndex]}\n\n` +
      `Root split\n${tree.type === "split" ? `${tree.featureName} <= ${formatNumber(tree.threshold, 2)}` : "no useful root split"}\n\n` +
      `Second splits\nLeft child: ${leftSplit}\nRight child: ${rightSplit}`;
    elements.week5TreeCaption.textContent =
      "Plain-English caption: the scatter uses the tree's main early split directions. Solid lines show the first split and dashed lines show the next splits when they are visible in this 2D slice.";
  }

  function renderWeek5Comparison(evaluation, dataset) {
    const rows = ["tree", "forest"].map((modelId) => {
      const metrics = evaluation.metrics[modelId];
      return [
        evaluation.labels[modelId],
        formatPct(metrics.accuracy),
        formatPct(metrics.macroF1),
        formatPct(metrics.balancedAccuracy)
      ];
    });
    renderTable(elements.week5MetricsTable, ["Model", "Accuracy", "Macro F1", "Balanced Acc"], rows);
    const treeMetrics = evaluation.metrics.tree;
    const forestMetrics = evaluation.metrics.forest;
    const gain = forestMetrics.balancedAccuracy - treeMetrics.balancedAccuracy;
    elements.week5ComparisonSummary.textContent =
      `Tree-first reading: start with the decision tree row.\n` +
      `Forest minus tree balanced accuracy: ${formatPct(gain)}\n` +
      `${gain >= 0 ? "The forest is stabilising the tree on this dataset." : "The single tree is currently matching or beating the forest on this split."}\n` +
      `Read this as a stability check, not as the main tree lesson.`;
    elements.week5MetricsCaption.textContent =
      `${state.validationMode === "holdout" ? "These scores come from one reproducible train/test split." : `These scores come from ${state.kFolds}-fold cross-validation.`} Start by reading the tree row, then use the forest row to see whether bagging improves stability. Balanced accuracy gives each class equal weight, so it is useful when one species is easier or harder than the others.`;
  }

  function renderWeek5FocusedModel(evaluation, dataset) {
    const modelId = state.focusModel === "tree" || state.focusModel === "forest" ? state.focusModel : "tree";
    state.focusModel = modelId;
    elements.focusModel.value = modelId;
    const modelEval = evaluation.details[modelId];
    const confusion = confusionMatrix(modelEval.actual, modelEval.predicted, dataset.targetNames.length);
    const header = ["Actual \\ Predicted"].concat(dataset.targetNames);
    const rows = dataset.targetNames.map((label, rowIndex) => [label].concat(confusion[rowIndex].map((value) => String(value))));
    renderTable(elements.week5ConfusionTable, header, rows);
    elements.week5ModelSummary.textContent = evaluation.summaries[modelId];
    elements.week5ConfusionCaption.textContent =
      `Plain-English caption: use the confusion matrix to see whether the ${evaluation.labels[modelId].toLowerCase()} is making one repeated mistake or spreading errors across several classes.`;
  }

  function renderWeek5HardCases(dataset, evaluation) {
    const modelId = state.focusModel === "tree" || state.focusModel === "forest" ? state.focusModel : "tree";
    const fit = evaluation.fits[modelId];
    const scored = dataset.data.map((row, index) => {
      const validatedPrediction = evaluation.details[modelId].byRow[index];
      if (validatedPrediction == null) {
        return null;
      }
      const detail = modelId === "tree" ? treePredictionDetail(fit.tree, row) : forestPredictionDetail(fit, row, dataset.targetNames.length);
      return {
        row: index + 1,
        actual: dataset.targetNames[dataset.target[index]],
        predicted: dataset.targetNames[validatedPrediction],
        confidence: detail.confidence,
        correct: validatedPrediction === dataset.target[index]
      };
    }).filter(Boolean);
    scored.sort((a, b) => {
      if (a.correct !== b.correct) {
        return a.correct ? 1 : -1;
      }
      return a.confidence - b.confidence;
    });
    const rows = scored.slice(0, 8).map((item) => [
      `Row ${item.row}`,
      item.actual,
      item.predicted,
      formatPct(item.confidence),
      item.correct ? "Correct" : "Misclassified"
    ]);
    renderTable(elements.week5HardCasesTable, ["Row", "Actual", "Predicted", "Confidence", "Status"], rows);
    elements.week5HardCasesCaption.textContent =
      `Plain-English caption: these are the rows the ${evaluation.labels[modelId].toLowerCase()} finds hardest. Misclassified rows are shown first, then the lowest-confidence correct rows. Start with the tree, then switch to the forest if you want to see whether the same difficult rows remain difficult after bagging.`;
  }

  function renderWeek5Importance(dataset, forestFit) {
    const global = buildGlobalExplanation("forest", forestFit, dataset);
    renderTable(elements.week5ImportanceTable, ["Feature", "Signal"], global.rows);
    elements.week5ImportanceCaption.textContent =
      "Plain-English caption: this uses the forest as a supporting diagnostic. It shows which variables repeatedly reduce impurity across many trees, which complements the single-tree split view above.";
  }

  function renderClusteringPanels() {
    const clustering = cache.clustering;
    const rows = ["kmeans", "hierarchical"].map((key) => {
      const result = clustering[key];
      return [
        key === "kmeans" ? "k-means" : "Hierarchical",
        formatNumber(result.silhouette, 3),
        formatNumber(result.wcss, 1),
        result.ari == null ? "N/A" : formatNumber(result.ari, 3)
      ];
    });
    if (clustering.modelBased) {
      rows.push([
        "Model-based",
        formatNumber(clustering.modelBased.silhouette, 3),
        formatNumber(clustering.modelBased.wcss, 1),
        clustering.modelBased.ari == null ? "N/A" : formatNumber(clustering.modelBased.ari, 3)
      ]);
    }
    renderTable(elements.clusteringTable, ["Algorithm", "Silhouette", "WCSS", "Adjusted Rand"], rows);
    elements.clusteringCaption.textContent =
      `Silhouette and WCSS are internal metrics: they judge separation and compactness from the fitted clusters alone. Adjusted Rand is an external metric: it compares the unsupervised clusters with known labels after fitting, when such labels exist.`;

    renderClusterPlot(elements.kmeansPlot, clustering.displayPoints, clustering.kmeans.assignments, "PC1", "PC2");
    renderClusterPlot(elements.hierPlot, clustering.displayPoints, clustering.hierarchical.assignments, "PC1", "PC2");

    elements.kmeansCaption.textContent = buildClusterCaption("k-means", clustering.kmeans, clustering);
    elements.hierCaption.textContent = buildClusterCaption("hierarchical clustering", clustering.hierarchical, clustering);
    if (clustering.modelBased) {
      renderClusterPlot(
        elements.modelClusterPlot,
        clustering.displayPoints,
        clustering.modelBased.assignments,
        "PC1",
        "PC2"
      );
      elements.modelClusterCaption.textContent = buildModelClusterCaption(clustering.modelBased, clustering);
    }
    renderHierarchicalSummary(clustering.hierarchical);
  }

  function buildClusterCaption(name, result, clustering) {
    const subsetNote =
      clustering.usedSubset
        ? ` For responsiveness, this panel uses a seeded subset of ${clustering.displayPoints.length} rows from the full dataset.`
        : "";
    const ariPart =
      result.ari == null ? "" : ` Its adjusted Rand index is ${formatNumber(result.ari, 3)}, so the discovered groups ${describeAri(result.ari)}.`;
    return `Plain-English caption: ${capitalize(name)} forms ${state.clusterK} groups in standardized feature space and then displays them in PCA coordinates. Its silhouette is ${formatNumber(
      result.silhouette,
      3
    )}, so the clusters ${describeSilhouette(result.silhouette)}.${ariPart}${subsetNote}`;
  }

  function buildModelClusterCaption(result, clustering) {
    const subsetNote =
      clustering.usedSubset
        ? ` For responsiveness, this panel uses a seeded subset of ${clustering.displayPoints.length} rows from the full dataset.`
        : "";
    const ariPart =
      result.ari == null ? "" : ` Its adjusted Rand index is ${formatNumber(result.ari, 3)}, so the discovered groups ${describeAri(result.ari)}.`;
    return `Plain-English caption: the Gaussian mixture fits ${state.gmmComponents} soft components with diagonal covariance in standardized feature space, then shows hard assignments in PCA coordinates. Its silhouette is ${formatNumber(
      result.silhouette,
      3
    )}, so the clusters ${describeSilhouette(result.silhouette)}.${ariPart}${subsetNote} This panel is intentionally about Gaussian mixtures only, not self-organising maps.`;
  }

  function renderHierarchicalSummary(result) {
    const finalClusters = result.clusters
      .map((cluster, index) => `Cluster ${index + 1}: ${cluster.size} rows`)
      .join("\n");
    const recentMerges = result.mergeHistory
      .slice(-5)
      .map((merge, index) => {
        return `Merge ${result.mergeHistory.length - 4 + index}: sizes ${merge.leftSize} + ${merge.rightSize} at height ${formatNumber(
          merge.height,
          3
        )}`;
      })
      .join("\n");
    elements.hierSummary.textContent =
      `Final cluster sizes\n${finalClusters}\n\nRecent merges\n${recentMerges || "No merge history recorded."}`;
    elements.hierSummaryCaption.textContent =
      "Plain-English caption: hierarchical clustering joins groups step by step. Small merge heights mean two groups were close when they joined, while large late-stage heights suggest broader separation between the remaining groups.";
  }

  function renderXaiLab() {
    if (state.viewId !== "week7") {
      return;
    }
    const evaluation = cache.classification;
    if (!evaluation || !elements.xaiGlobalTable) {
      return;
    }
    const modelId = evaluation.fits[state.focusModel] ? state.focusModel : evaluation.order[0];
    const fit = evaluation.fits[modelId];
    const dataset = cache.dataset;
    const index = clamp(state.xaiIndex, 0, Math.max(0, dataset.n - 1));
    state.xaiIndex = index;
    syncXaiOptions();

    const global = buildGlobalExplanation(modelId, fit, dataset);
    renderTable(elements.xaiGlobalTable, ["Feature", "Signal"], global.rows);
    elements.xaiGlobalCaption.textContent = global.caption;

    const local = buildLocalExplanation(modelId, fit, dataset, index);
    elements.xaiLocalSummary.textContent = local.summary;
    renderTable(elements.xaiLocalTable, ["Item", "Detail"], local.rows);
    elements.xaiLocalCaption.textContent = local.caption;
  }

  function evaluateClassificationModels(dataset) {
    const modelIds = ["knn", "logistic", "lda", "tree", "forest", "svm_linear", "svm_rbf"];
    const labels = {
      knn: "KNN",
      logistic: "Logistic regression",
      lda: "LDA",
      tree: "Decision tree",
      forest: "Random forest",
      svm_linear: "Linear SVM",
      svm_rbf: "RBF SVM"
    };

    const metrics = {};
    const details = {};
    const summaries = {};
    const fits = {};
    const evaluationSplits =
      state.validationMode === "holdout"
        ? [{ train: cache.split.trainIndices, test: cache.split.testIndices }]
        : cache.folds.foldIndices.map((testIndices) => ({
            train: complementIndices(dataset.n, testIndices),
            test: testIndices
          }));

    modelIds.forEach((modelId) => {
      const predicted = new Array(dataset.n).fill(null);
      const actual = [];
      let firstFit = null;

      evaluationSplits.forEach((split, splitIndex) => {
        const trainX = selectRows(dataset.data, split.train);
        const trainY = selectEntries(dataset.target, split.train);
        const testX = selectRows(dataset.data, split.test);
        const testY = selectEntries(dataset.target, split.test);
        const fit = fitModel(modelId, trainX, trainY, dataset.columns);
        if (splitIndex === 0) {
          firstFit = fit;
        }
        const preds = fit.predict(testX);
        split.test.forEach((rowIndex, localIndex) => {
          predicted[rowIndex] = preds[localIndex];
          actual[rowIndex] = dataset.target[rowIndex];
        });
        void testY;
      });

      const filteredActual = [];
      const filteredPred = [];
      predicted.forEach((value, index) => {
        if (value != null) {
          filteredActual.push(dataset.target[index]);
          filteredPred.push(value);
        }
      });

      const accuracy = computeAccuracy(filteredActual, filteredPred);
      const macroF1 = computeMacroF1(filteredActual, filteredPred, dataset.targetNames.length);
      const balancedAccuracy = computeBalancedAccuracy(filteredActual, filteredPred, dataset.targetNames.length);
      metrics[modelId] = { accuracy, macroF1, balancedAccuracy };
      details[modelId] = { actual: filteredActual, predicted: filteredPred, byRow: predicted.slice() };

      const fullFit = fitModel(modelId, dataset.data, dataset.target, dataset.columns);
      summaries[modelId] = buildModelSummary(modelId, fullFit, dataset);
      fits[modelId] = fullFit;
      if (!firstFit) {
        firstFit = fullFit;
      }
    });

    return {
      order: modelIds,
      labels,
      metrics,
      details,
      summaries,
      fits
    };
  }

  function evaluateNeuralNetwork(dataset) {
    const evaluationSplits =
      state.validationMode === "holdout"
        ? [{ train: cache.split.trainIndices, test: cache.split.testIndices }]
        : cache.folds.foldIndices.map((testIndices) => ({
            train: complementIndices(dataset.n, testIndices),
            test: testIndices
          }));

    const predicted = new Array(dataset.n).fill(null);
    evaluationSplits.forEach((split, splitIndex) => {
      const trainX = selectRows(dataset.data, split.train);
      const trainY = selectEntries(dataset.target, split.train);
      const testX = selectRows(dataset.data, split.test);
      const fit = fitNeuralNetwork(trainX, trainY, dataset.columns, state.nnHidden, state.nnEpochs, state.seed + 307 + splitIndex * 29);
      const preds = fit.predict(testX);
      split.test.forEach((rowIndex, localIndex) => {
        predicted[rowIndex] = preds[localIndex];
      });
    });

    const filteredActual = [];
    const filteredPredicted = [];
    predicted.forEach((value, index) => {
      if (value != null) {
        filteredActual.push(dataset.target[index]);
        filteredPredicted.push(value);
      }
    });

    const fullFit = fitNeuralNetwork(dataset.data, dataset.target, dataset.columns, state.nnHidden, state.nnEpochs, state.seed + 389);
    return {
      metrics: {
        accuracy: computeAccuracy(filteredActual, filteredPredicted),
        macroF1: computeMacroF1(filteredActual, filteredPredicted, dataset.targetNames.length)
      },
      actual: filteredActual,
      predicted: filteredPredicted,
      fit: fullFit,
      summary: buildNeuralSummary(fullFit, dataset)
    };
  }

  function evaluateClustering(dataset, pca) {
    const subsetIndices =
      dataset.n > MAX_HIERARCHICAL_ROWS
        ? sampleWithoutReplacement(dataset.n, MAX_HIERARCHICAL_ROWS, state.seed + 41)
        : range(dataset.n);
    const usedSubset = subsetIndices.length !== dataset.n;
    const subsetX = selectRows(pca.standardized, subsetIndices);
    const subsetY = selectEntries(dataset.target, subsetIndices);
    const subsetScores = subsetIndices.map((index) => pca.scores[index]);

    const kmeans = runKMeans(subsetX, state.clusterK, state.seed + 53);
    const hierarchical = runWardClustering(subsetX, state.clusterK);
    const distances = pairwiseDistances(subsetX);

    kmeans.silhouette = silhouetteScore(distances, kmeans.assignments, state.clusterK);
    hierarchical.silhouette = silhouetteScore(distances, hierarchical.assignments, state.clusterK);
    kmeans.wcss = withinClusterSumSquares(subsetX, kmeans.assignments, state.clusterK);
    hierarchical.wcss = withinClusterSumSquares(subsetX, hierarchical.assignments, state.clusterK);
    kmeans.ari = dataset.hasLabels ? adjustedRandIndex(subsetY, kmeans.assignments) : null;
    hierarchical.ari = dataset.hasLabels ? adjustedRandIndex(subsetY, hierarchical.assignments) : null;

    let modelBased = null;
    if (state.viewId === "week10") {
      modelBased = runGaussianMixture(subsetX, state.gmmComponents, state.seed + 67);
      modelBased.silhouette = silhouetteScore(distances, modelBased.assignments, state.gmmComponents);
      modelBased.wcss = withinClusterSumSquares(subsetX, modelBased.assignments, state.gmmComponents);
      modelBased.ari = dataset.hasLabels ? adjustedRandIndex(subsetY, modelBased.assignments) : null;
    }

    const displayPoints = subsetScores.map((row) => ({ x: row[0], y: row[1] }));

    return {
      usedSubset,
      displayPoints,
      kmeans,
      hierarchical,
      modelBased
    };
  }

  function fitModel(modelId, X, y, columns) {
    switch (modelId) {
      case "knn":
        return fitKNN(X, y, state.knnK);
      case "logistic":
        return fitLogisticOvr(X, y, columns, state.viewId === "week4" ? state.logisticPenalty : DEFAULT_LOGISTIC_PENALTY);
      case "lda":
        return fitLDA(X, y, columns);
      case "tree":
        return fitDecisionTree(X, y, columns, state.treeDepth);
      case "forest":
        return fitRandomForest(X, y, columns, state.forestTrees, state.treeDepth, state.seed + 101);
      case "svm_linear":
        return fitLinearSvmOvr(X, y, columns, state.svmC, state.seed + 131);
      case "svm_rbf":
        return fitRbfSvmApprox(X, y, columns, state.svmC, state.svmGamma, state.seed + 151);
      default:
        throw new Error(`Unknown model ${modelId}`);
    }
  }

  function fitNeuralNetwork(X, y, columns, hiddenUnits, epochs, seed) {
    const standard = standardizeMatrix(X);
    const features = standard.X;
    const classes = uniqueSorted(y);
    const inputDim = features[0].length;
    const outputDim = classes.length;
    const rng = mulberry32(seed);
    const lambda = 0.0008;
    const W1 = range(hiddenUnits).map(() => range(inputDim).map(() => (rng() - 0.5) * 0.6));
    const b1 = new Array(hiddenUnits).fill(0);
    const W2 = range(outputDim).map(() => range(hiddenUnits).map(() => (rng() - 0.5) * 0.45));
    const b2 = new Array(outputDim).fill(0);
    const classToIndex = new Map(classes.map((cls, index) => [cls, index]));
    const order = range(features.length);
    const lossHistory = [];

    for (let epoch = 0; epoch < epochs; epoch += 1) {
      shuffle(order, mulberry32(seed + epoch * 19));
      const eta = 0.08 / (1 + epoch / 70);

      order.forEach((rowIndex) => {
        const x = features[rowIndex];
        const targetIndex = classToIndex.get(y[rowIndex]);
        const hiddenPre = W1.map((weights, hiddenIndex) => dot(weights, x) + b1[hiddenIndex]);
        const hiddenAct = hiddenPre.map((value) => Math.tanh(value));
        const logits = W2.map((weights, outputIndex) => dot(weights, hiddenAct) + b2[outputIndex]);
        const probs = softmax(logits);
        const delta2 = probs.map((value, outputIndex) => value - (outputIndex === targetIndex ? 1 : 0));
        const delta1 = hiddenAct.map((hiddenValue, hiddenIndex) => {
          let total = 0;
          for (let outputIndex = 0; outputIndex < outputDim; outputIndex += 1) {
            total += W2[outputIndex][hiddenIndex] * delta2[outputIndex];
          }
          return total * (1 - hiddenValue * hiddenValue);
        });

        for (let outputIndex = 0; outputIndex < outputDim; outputIndex += 1) {
          for (let hiddenIndex = 0; hiddenIndex < hiddenUnits; hiddenIndex += 1) {
            W2[outputIndex][hiddenIndex] -=
              eta * (delta2[outputIndex] * hiddenAct[hiddenIndex] + lambda * W2[outputIndex][hiddenIndex]);
          }
          b2[outputIndex] -= eta * delta2[outputIndex];
        }

        for (let hiddenIndex = 0; hiddenIndex < hiddenUnits; hiddenIndex += 1) {
          for (let featureIndex = 0; featureIndex < inputDim; featureIndex += 1) {
            W1[hiddenIndex][featureIndex] -=
              eta * (delta1[hiddenIndex] * x[featureIndex] + lambda * W1[hiddenIndex][featureIndex]);
          }
          b1[hiddenIndex] -= eta * delta1[hiddenIndex];
        }
      });

      if (epoch % 20 === 0 || epoch === epochs - 1) {
        lossHistory.push({
          epoch: epoch + 1,
          loss: neuralNetworkLoss(features, y, classes, W1, b1, W2, b2)
        });
      }
    }

    return {
      modelType: "neural",
      columns: columns.slice(),
      standard,
      classes,
      hiddenUnits,
      epochs,
      W1,
      b1,
      W2,
      b2,
      lossHistory,
      predict(rows) {
        const scaled = applyStandardization(rows, standard.mean, standard.std);
        return scaled.map((row) => {
          const hiddenAct = W1.map((weights, hiddenIndex) => Math.tanh(dot(weights, row) + b1[hiddenIndex]));
          const logits = W2.map((weights, outputIndex) => dot(weights, hiddenAct) + b2[outputIndex]);
          return classes[argMax(logits)];
        });
      }
    };
  }

  function fitKNN(X, y, k) {
    const standard = standardizeMatrix(X);
    return {
      modelType: "knn",
      k,
      standard,
      classes: uniqueSorted(y),
      trainingY: y.slice(),
      predict(rows) {
        const scaledRows = applyStandardization(rows, standard.mean, standard.std);
        return scaledRows.map((row) => {
          const distances = standard.X.map((trainRow, index) => ({
            distance: euclidean(trainRow, row),
            label: y[index]
          }));
          distances.sort((a, b) => a.distance - b.distance);
          return majorityVote(distances.slice(0, Math.min(k, distances.length)).map((item) => item.label));
        });
      }
    };
  }

  function fitLogisticOvr(X, y, columns, lambda = DEFAULT_LOGISTIC_PENALTY) {
    const standard = standardizeMatrix(X);
    const classes = uniqueSorted(y);
    const Xb = addIntercept(standard.X);
    const epochs = 350;
    const lr = 0.25;
    const weights = classes.map((cls) => {
      const target = y.map((value) => (value === cls ? 1 : 0));
      let w = new Array(Xb[0].length).fill(0);
      for (let epoch = 0; epoch < epochs; epoch += 1) {
        const gradient = new Array(w.length).fill(0);
        for (let i = 0; i < Xb.length; i += 1) {
          const z = dot(Xb[i], w);
          const p = sigmoid(z);
          const error = p - target[i];
          for (let j = 0; j < w.length; j += 1) {
            gradient[j] += error * Xb[i][j];
          }
        }
        for (let j = 0; j < w.length; j += 1) {
          const penalty = j === 0 ? 0 : lambda * w[j];
          w[j] -= lr * ((gradient[j] / Xb.length) + penalty);
        }
      }
      return w;
    });

    return {
      modelType: "logistic",
      standard,
      classes,
      columns,
      lambda,
      weights: weights.map((w) => ({
        b: w[0],
        w: w.slice(1)
      })),
      predict(rows) {
        const scaled = applyStandardization(rows, standard.mean, standard.std);
        return scaled.map((row) => {
          const scores = weights.map((w) => w[0] + dot(row, w.slice(1)));
          return classes[argMax(scores)];
        });
      }
    };
  }

  function fitLDA(X, y, columns) {
    const standard = standardizeMatrix(X);
    const classes = uniqueSorted(y);
    const priors = [];
    const means = [];
    const p = X[0].length;
    const overallCounts = countByLabel(y, classes.length);

    classes.forEach((cls, classIndex) => {
      const rows = standard.X.filter((_, index) => y[index] === cls);
      priors[classIndex] = rows.length / y.length;
      means[classIndex] = columnMeans(rows);
    });

    const covariance = zeros(p, p);
    classes.forEach((cls, classIndex) => {
      standard.X.forEach((row, index) => {
        if (y[index] !== cls) {
          return;
        }
        const diff = subtractVectors(row, means[classIndex]);
        for (let i = 0; i < p; i += 1) {
          for (let j = 0; j < p; j += 1) {
            covariance[i][j] += diff[i] * diff[j];
          }
        }
      });
    });

    const denom = Math.max(1, y.length - classes.length);
    for (let i = 0; i < p; i += 1) {
      for (let j = 0; j < p; j += 1) {
        covariance[i][j] /= denom;
      }
      covariance[i][i] += 1e-6;
    }
    const inverse = invertMatrix(covariance);

    return {
      modelType: "lda",
      standard,
      classes,
      columns,
      means,
      priors,
      inverse,
      classCounts: overallCounts,
      predict(rows) {
        const scaled = applyStandardization(rows, standard.mean, standard.std);
        return scaled.map((row) => {
          const scores = means.map((mean, classIndex) => {
            const left = dot(row, matVec(inverse, mean));
            const right = 0.5 * dot(mean, matVec(inverse, mean));
            return left - right + Math.log(priors[classIndex]);
          });
          return classes[argMax(scores)];
        });
      }
    };
  }

  function fitDecisionTree(X, y, columns, maxDepth) {
    const featureNames = columns.slice();
    const tree = buildTree(X, y, featureNames, 0, maxDepth, null);
    return {
      modelType: "tree",
      tree,
      columns: featureNames,
      predict(rows) {
        return rows.map((row) => predictTree(tree, row));
      }
    };
  }

  function fitRandomForest(X, y, columns, treeCount, maxDepth, seed) {
    const rng = mulberry32(seed);
    const trees = [];
    const featureSubsample = Math.max(1, Math.floor(Math.sqrt(columns.length)));

    for (let treeIndex = 0; treeIndex < treeCount; treeIndex += 1) {
      const sampleX = [];
      const sampleY = [];
      for (let i = 0; i < X.length; i += 1) {
        const pick = Math.floor(rng() * X.length);
        sampleX.push(X[pick]);
        sampleY.push(y[pick]);
      }
      trees.push(buildTree(sampleX, sampleY, columns.slice(), 0, maxDepth, { featureSubsample, rng }));
    }

    return {
      modelType: "forest",
      trees,
      treeCount,
      featureSubsample,
      columns: columns.slice(),
      predict(rows) {
        return rows.map((row) => {
          const votes = trees.map((tree) => predictTree(tree, row));
          return majorityVote(votes);
        });
      }
    };
  }

  function fitLinearSvmOvr(X, y, columns, cValue, seed) {
    const standard = standardizeMatrix(X);
    const classes = uniqueSorted(y);
    const trained = trainLinearSvmOneVsRest(standard.X, y, classes, cValue, seed);
    return {
      modelType: "svm_linear",
      standard,
      columns: columns.slice(),
      classes,
      weights: trained.weights,
      activeCount: trained.activeCount,
      trainingX: standard.X,
      trainingY: y.slice(),
      predict(rows) {
        const scaled = applyStandardization(rows, standard.mean, standard.std);
        return predictLinearSvmOneVsRest(scaled, classes, trained.weights);
      }
    };
  }

  function fitRbfSvmApprox(X, y, columns, cValue, gamma, seed) {
    const standard = standardizeMatrix(X);
    const classes = uniqueSorted(y);
    const featureMap = createRandomFourierMap(X[0].length, gamma, 90, seed);
    const mapped = featureMap.transform(standard.X);
    const trained = trainLinearSvmOneVsRest(mapped, y, classes, cValue, seed + 17);
    return {
      modelType: "svm_rbf",
      standard,
      columns: columns.slice(),
      classes,
      gamma,
      featureMap,
      weights: trained.weights,
      activeCount: trained.activeCount,
      trainingRows: X.map((row) => row.slice()),
      trainingY: y.slice(),
      predict(rows) {
        const scaled = applyStandardization(rows, standard.mean, standard.std);
        return predictLinearSvmOneVsRest(featureMap.transform(scaled), classes, trained.weights);
      }
    };
  }

  function buildTree(X, y, columns, depth, maxDepth, options) {
    const counts = countByLabel(y, uniqueSorted(y).length);
    const prediction = majorityVote(y);
    const node = {
      type: "leaf",
      prediction,
      depth,
      counts
    };

    if (depth >= maxDepth || new Set(y).size === 1 || X.length < 6) {
      return node;
    }

    const baseImpurity = giniImpurity(y);
    let best = null;
    const featureIndices = options?.featureSubsample
      ? randomFeatureSubset(columns.length, options.featureSubsample, options.rng)
      : range(columns.length);

    for (const feature of featureIndices) {
      const values = X.map((row) => row[feature]).slice().sort((a, b) => a - b);
      const thresholds = [];
      for (let i = 1; i < values.length; i += 1) {
        if (values[i] !== values[i - 1]) {
          thresholds.push((values[i] + values[i - 1]) / 2);
        }
      }
      thresholds.forEach((threshold) => {
        const leftX = [];
        const leftY = [];
        const rightX = [];
        const rightY = [];
        X.forEach((row, index) => {
          if (row[feature] <= threshold) {
            leftX.push(row);
            leftY.push(y[index]);
          } else {
            rightX.push(row);
            rightY.push(y[index]);
          }
        });
        if (!leftY.length || !rightY.length) {
          return;
        }
        const impurity =
          (leftY.length / y.length) * giniImpurity(leftY) +
          (rightY.length / y.length) * giniImpurity(rightY);
        const gain = baseImpurity - impurity;
        if (!best || gain > best.gain) {
          best = {
            feature,
            threshold,
            gain,
            leftX,
            leftY,
            rightX,
            rightY
          };
        }
      });
    }

    if (!best || best.gain <= 1e-6) {
      return node;
    }

    return {
      type: "split",
      prediction,
      depth,
      feature: best.feature,
      featureName: columns[best.feature],
      threshold: best.threshold,
      gain: best.gain,
      left: buildTree(best.leftX, best.leftY, columns, depth + 1, maxDepth, options),
      right: buildTree(best.rightX, best.rightY, columns, depth + 1, maxDepth, options)
    };
  }

  function predictTree(node, row) {
    if (node.type === "leaf") {
      return node.prediction;
    }
    if (row[node.feature] <= node.threshold) {
      return predictTree(node.left, row);
    }
    return predictTree(node.right, row);
  }

  function predictTreeWithPath(node, row, path = []) {
    if (node.type === "leaf") {
      return { prediction: node.prediction, path, counts: node.counts || [] };
    }
    const rule = `${node.featureName} <= ${formatNumber(node.threshold, 2)}`;
    if (row[node.feature] <= node.threshold) {
      return predictTreeWithPath(node.left, row, path.concat(`${rule} -> left`));
    }
    return predictTreeWithPath(node.right, row, path.concat(`${rule} -> right`));
  }

  function treePredictionDetail(tree, row) {
    const explanation = predictTreeWithPath(tree, row);
    const total = explanation.counts.reduce((sum, value) => sum + value, 0) || 1;
    const confidence = Math.max(...explanation.counts, 0) / total;
    return {
      prediction: explanation.prediction,
      confidence,
      path: explanation.path,
      counts: explanation.counts
    };
  }

  function forestPredictionDetail(fit, row, classCount) {
    const votes = new Array(classCount).fill(0);
    fit.trees.forEach((tree) => {
      votes[predictTree(tree, row)] += 1;
    });
    const prediction = argMax(votes);
    return {
      prediction,
      confidence: votes[prediction] / Math.max(1, fit.trees.length),
      votes
    };
  }

  function trainLinearSvmOneVsRest(features, y, classes, cValue, seed) {
    const lambda = 1 / Math.max(1, cValue * features.length);
    const weights = [];
    let activeCount = 0;

    classes.forEach((cls, classIndex) => {
      const w = new Array(features[0].length).fill(0);
      let b = 0;
      const order = range(features.length);
      const rng = mulberry32(seed + classIndex * 31);

      for (let epoch = 0; epoch < 28; epoch += 1) {
        shuffle(order, rng);
        order.forEach((rowIndex, step) => {
          const eta = 0.18 / Math.sqrt(epoch * features.length + step + 1);
          const yi = y[rowIndex] === cls ? 1 : -1;
          const margin = yi * (dot(w, features[rowIndex]) + b);
          for (let j = 0; j < w.length; j += 1) {
            w[j] *= 1 - eta * lambda;
          }
          if (margin < 1) {
            for (let j = 0; j < w.length; j += 1) {
              w[j] += eta * cValue * yi * features[rowIndex][j];
            }
            b += eta * cValue * yi;
          }
        });
      }

      features.forEach((row, rowIndex) => {
        const yi = y[rowIndex] === cls ? 1 : -1;
        if (yi * (dot(w, row) + b) < 1) {
          activeCount += 1;
        }
      });
      weights.push({ w, b });
    });

    return { weights, activeCount };
  }

  function predictLinearSvmOneVsRest(rows, classes, weights) {
    return rows.map((row) => {
      const scores = weights.map((item) => dot(item.w, row) + item.b);
      return classes[argMax(scores)];
    });
  }

  function createRandomFourierMap(inputDim, gamma, components, seed) {
    const rng = mulberry32(seed);
    const omega = range(components).map(() =>
      range(inputDim).map(() => randomNormal(rng) * Math.sqrt(2 * gamma))
    );
    const phase = range(components).map(() => rng() * Math.PI * 2);

    return {
      omega,
      phase,
      transform(rows) {
        return rows.map((row) =>
          omega.map((vector, featureIndex) => {
            return Math.sqrt(2 / components) * Math.cos(dot(row, vector) + phase[featureIndex]);
          })
        );
      }
    };
  }

  function randomFeatureSubset(total, size, rng) {
    const indices = range(total);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, size);
  }

  function computeTreeFeatureImportance(tree, featureCount) {
    const importance = new Array(featureCount).fill(0);
    traverseTree(tree, (node) => {
      if (node.type === "split") {
        importance[node.feature] += node.gain || 0;
      }
    });
    return importance;
  }

  function averageAbsWeightsByFeature(weights, columns) {
    const sums = new Array(columns.length).fill(0);
    weights.forEach((item) => {
      item.w.forEach((value, index) => {
        sums[index] += Math.abs(value);
      });
    });
    return columns
      .map((name, index) => ({
        name,
        value: sums[index] / Math.max(1, weights.length)
      }))
      .sort((a, b) => b.value - a.value);
  }

  function averageAbsWeightsArray(weights, featureCount) {
    const sums = new Array(featureCount).fill(0);
    weights.forEach((item) => {
      item.w.forEach((value, index) => {
        sums[index] += Math.abs(value);
      });
    });
    return sums.map((value) => value / Math.max(1, weights.length));
  }

  function permutationFeatureImportance(fit, dataset, seed) {
    const baseline = computeAccuracy(dataset.target, fit.predict(dataset.data));
    return dataset.columns
      .map((name, featureIndex) => {
        const shuffled = shuffle(
          dataset.data.map((row) => row[featureIndex]).slice(),
          mulberry32(seed + featureIndex * 17)
        );
        const mutated = dataset.data.map((row, rowIndex) => {
          const copy = row.slice();
          copy[featureIndex] = shuffled[rowIndex];
          return copy;
        });
        const score = computeAccuracy(dataset.target, fit.predict(mutated));
        return { name, value: baseline - score };
      })
      .sort((a, b) => b.value - a.value);
  }

  function buildModelSummary(modelId, fit, dataset) {
    if (modelId === "knn") {
      return `KNN summary\n- Uses k = ${fit.k} neighbours.\n- Works by finding nearby training points after standardising the features.\n- It adapts well to curved boundaries, but it can become noisy when classes overlap.`;
    }

    if (modelId === "logistic") {
      const blocks = fit.weights.map((weightBlock, classIndex) => {
        const pairs = weightBlock.w
          .map((value, featureIndex) => ({
            name: dataset.columns[featureIndex],
            value
          }))
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
          .slice(0, 2)
          .map((item) => `${item.name} (${item.value >= 0 ? "+" : ""}${formatNumber(item.value, 2)})`);
        return `${dataset.targetNames[classIndex]}: strongest coefficients ${pairs.join(", ")}`;
      });
      return `Logistic regression summary\n- Fits one linear log-odds boundary per class in a one-vs-rest setup.\n- Features are standardised before fitting.\n- Current penalty lambda is ${formatNumber(fit.lambda, 3)}, so larger values shrink coefficients harder.\n- ${blocks.join("\n- ")}`;
    }

    if (modelId === "lda") {
      const spreads = dataset.columns
        .map((name, featureIndex) => {
          const values = fit.means.map((mean) => mean[featureIndex]);
          return {
            name,
            spread: Math.max(...values) - Math.min(...values)
          };
        })
        .sort((a, b) => b.spread - a.spread)
        .slice(0, 3)
        .map((item) => `${item.name} (${formatNumber(item.spread, 2)})`);
      return `LDA summary\n- Assumes each class is roughly Gaussian with a shared covariance matrix.\n- Strongest mean separation appears in ${spreads.join(", ")}.\n- Because LDA uses a pooled covariance estimate, it prefers smoother linear boundaries.`;
    }

    if (modelId === "forest") {
      const importance = computeTreeFeatureImportance(fit.trees[0], dataset.columns.length);
      fit.trees.slice(1).forEach((tree) => {
        const treeImportance = computeTreeFeatureImportance(tree, dataset.columns.length);
        treeImportance.forEach((value, index) => {
          importance[index] += value;
        });
      });
      const top = dataset.columns
        .map((name, index) => ({ name, value: importance[index] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((item) => `${item.name} (${formatNumber(item.value, 2)})`);
      return `Random forest summary\n- Uses ${fit.treeCount} trees with random feature subsets of size ${fit.featureSubsample}.\n- Forests reduce the instability of a single tree by averaging many bootstrap trees.\n- Strongest split signal appears in ${top.join(", ")}.`;
    }

    if (modelId === "svm_linear") {
      const top = averageAbsWeightsByFeature(fit.weights, dataset.columns)
        .slice(0, 3)
        .map((item) => `${item.name} (${formatNumber(item.value, 2)})`);
      return `Linear SVM summary\n- Uses hinge-loss optimisation with C = ${formatNumber(state.svmC, 1)} on standardised features.\n- Margin-active training points: ${fit.activeCount}.\n- Strongest linear margin directions appear in ${top.join(", ")}.`;
    }

    if (modelId === "svm_rbf") {
      return `RBF SVM summary\n- Uses a nonlinear RBF-style feature map with C = ${formatNumber(state.svmC, 1)} and gamma = ${formatNumber(
        state.svmGamma,
        1
      )}.\n- Margin-active training points: ${fit.activeCount}.\n- Higher gamma allows tighter bends, while lower gamma gives smoother boundaries.`;
    }

    const stats = describeTree(fit.tree);
    return `Decision tree summary\n- Maximum depth is ${state.treeDepth}; realised depth is ${stats.depth} with ${stats.leaves} leaves.\n- First split: ${stats.firstSplit || "no split was useful on the full dataset"}.\n- Trees are easy to explain, but deep trees can fit local quirks rather than broad patterns.`;
  }

  function buildNeuralSummary(fit, dataset) {
    const inputSignal = dataset.columns
      .map((name, featureIndex) => {
        const value =
          fit.W1.reduce((sum, row) => sum + Math.abs(row[featureIndex]), 0) / Math.max(1, fit.W1.length);
        return { name, value };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item) => `${item.name} (${formatNumber(item.value, 2)})`);
    const firstLoss = fit.lossHistory[0]?.loss ?? NaN;
    const lastLoss = fit.lossHistory[fit.lossHistory.length - 1]?.loss ?? NaN;
    return `Neural network summary\n- One hidden layer with ${fit.hiddenUnits} tanh units and ${fit.classes.length} output classes.\n- Trained for ${fit.epochs} epochs on standardized features.\n- Training loss moved from ${formatNumber(firstLoss, 3)} to ${formatNumber(lastLoss, 3)}.\n- Read that loss change as an optimisation signal on the training fit, not as proof of better generalisation.\n- Strongest input signal appears in ${inputSignal.join(", ")}.`;
  }

  function buildGlobalExplanation(modelId, fit, dataset) {
    let importance = [];
    let caption = "";

    if (modelId === "logistic" || modelId === "svm_linear") {
      importance = averageAbsWeightsByFeature(fit.weights, dataset.columns);
      caption =
        "Plain-English caption: these scores come from the average absolute weight size across the one-vs-rest linear models.";
    } else if (modelId === "lda") {
      importance = dataset.columns
        .map((name, featureIndex) => {
          const values = fit.means.map((mean) => mean[featureIndex]);
          return { name, value: Math.max(...values) - Math.min(...values) };
        })
        .sort((a, b) => b.value - a.value);
      caption =
        "Plain-English caption: these scores show where the class means are most separated after standardisation.";
    } else if (modelId === "tree") {
      importance = dataset.columns
        .map((name, index) => ({ name, value: computeTreeFeatureImportance(fit.tree, dataset.columns.length)[index] }))
        .sort((a, b) => b.value - a.value);
      caption =
        "Plain-English caption: these scores add up the impurity reduction from every split that used each feature.";
    } else if (modelId === "forest") {
      const scores = new Array(dataset.columns.length).fill(0);
      fit.trees.forEach((tree) => {
        const treeScores = computeTreeFeatureImportance(tree, dataset.columns.length);
        treeScores.forEach((value, index) => {
          scores[index] += value;
        });
      });
      importance = dataset.columns
        .map((name, index) => ({ name, value: scores[index] / Math.max(1, fit.trees.length) }))
        .sort((a, b) => b.value - a.value);
      caption =
        "Plain-English caption: these scores average split importance across the forest, so they show broad signal rather than one tree's path.";
    } else {
      importance = permutationFeatureImportance(fit, dataset, state.seed + 211);
      caption =
        "Plain-English caption: this model does not have simple feature coefficients here, so the app uses permutation importance based on how much accuracy drops when each feature is shuffled.";
    }

    return {
      rows: importance.slice(0, 5).map((item) => [item.name, formatNumber(item.value, 3)]),
      caption
    };
  }

  function buildLocalExplanation(modelId, fit, dataset, index) {
    const row = dataset.data[index];
    const predicted = fit.predict([row])[0];
    const predictedLabel = dataset.targetNames[predicted] || String(predicted);
    const actualLabel = dataset.targetNames[dataset.target[index]] || String(dataset.target[index]);
    const summary = `Selected row ${index + 1}\nActual: ${actualLabel}\nPredicted: ${predictedLabel}`;

    if (modelId === "logistic" || modelId === "svm_linear") {
      const scaled = applyStandardization([row], fit.standard.mean, fit.standard.std)[0];
      const classIndex = fit.classes.indexOf(predicted);
      const weights = fit.weights[classIndex].w;
      const rows = dataset.columns
        .map((name, featureIndex) => ({
          item: name,
          value: scaled[featureIndex] * weights[featureIndex]
        }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 5)
        .map((item) => [item.item, `${item.value >= 0 ? "+" : ""}${formatNumber(item.value, 3)}`]);
      return {
        summary,
        rows,
        caption:
          "Plain-English caption: larger positive contributions push this row toward the predicted class in the current linear model."
      };
    }

    if (modelId === "knn") {
      const scaled = applyStandardization([row], fit.standard.mean, fit.standard.std)[0];
      const neighbours = fit.standard.X
        .map((trainRow, rowIndex) => ({
          label: dataset.targetNames[fit.trainingY ? fit.trainingY[rowIndex] : 0] || String(fit.trainingY?.[rowIndex] || ""),
          distance: euclidean(trainRow, scaled)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, Math.min(fit.k, 5))
        .map((item, idx) => [`Neighbour ${idx + 1}`, `${item.label}, distance ${formatNumber(item.distance, 3)}`]);
      return {
        summary,
        rows: neighbours,
        caption:
          "Plain-English caption: KNN explanations come from the nearby training points that voted for this prediction."
      };
    }

    if (modelId === "lda") {
      const scaled = applyStandardization([row], fit.standard.mean, fit.standard.std)[0];
      const classIndex = fit.classes.indexOf(predicted);
      const rows = dataset.columns
        .map((name, featureIndex) => ({
          item: name,
          value: scaled[featureIndex] - fit.means[classIndex][featureIndex]
        }))
        .sort((a, b) => Math.abs(a.value) - Math.abs(b.value))
        .slice(0, 5)
        .map((item) => [item.item, `distance from class mean ${formatNumber(item.value, 3)}`]);
      return {
        summary,
        rows,
        caption:
          "Plain-English caption: small distances mean this row looks close to the predicted class mean after standardisation."
      };
    }

    if (modelId === "tree") {
      const explanation = predictTreeWithPath(fit.tree, row);
      return {
        summary,
        rows: explanation.path.slice(0, 6).map((step, idx) => [`Step ${idx + 1}`, step]),
        caption:
          "Plain-English caption: the tree explanation is the rule path followed from the root to the leaf."
      };
    }

    if (modelId === "forest") {
      const votes = new Map();
      const featureCounts = new Map();
      fit.trees.forEach((tree) => {
        const explanation = predictTreeWithPath(tree, row);
        votes.set(explanation.prediction, (votes.get(explanation.prediction) || 0) + 1);
        explanation.path.forEach((step) => {
          const feature = step.split(" <=")[0];
          featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
        });
      });
      const voteRows = Array.from(votes.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => [dataset.targetNames[label] || String(label), `${count} tree votes`]);
      const featureRows = Array.from(featureCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count], idx) => [`Frequent split ${idx + 1}`, `${name} used on ${count} tree paths`]);
      return {
        summary,
        rows: voteRows.concat(featureRows),
        caption:
          "Plain-English caption: the forest explanation shows the vote mix plus which features appeared most often on the tree paths for this row."
      };
    }

    const neighbours = fit.trainingRows
      .map((trainRow, rowIndex) => ({
        label: dataset.targetNames[fit.trainingY[rowIndex]] || String(fit.trainingY[rowIndex]),
        distance: euclidean(trainRow, row)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map((item, idx) => [`Nearby row ${idx + 1}`, `${item.label}, distance ${formatNumber(item.distance, 3)}`]);
    return {
      summary,
      rows: neighbours,
      caption:
        "Plain-English caption: for the nonlinear SVM, the app shows nearby training cases because there is no short coefficient list in the original feature space."
    };
  }

  function describeTree(tree) {
    let depth = 0;
    let leaves = 0;
    let firstSplit = "";
    traverseTree(tree, (node) => {
      depth = Math.max(depth, node.depth || 0);
      if (node.type === "leaf") {
        leaves += 1;
      } else if (!firstSplit) {
        firstSplit = `${node.featureName} <= ${formatNumber(node.threshold, 2)}`;
      }
    });
    return { depth, leaves, firstSplit };
  }

  function traverseTree(node, callback) {
    callback(node);
    if (node.type === "split") {
      traverseTree(node.left, callback);
      traverseTree(node.right, callback);
    }
  }

  function computePCA(X, components) {
    const standard = standardizeMatrix(X);
    const covariance = covarianceMatrix(standard.X);
    const eigen = topSymmetricEigen(covariance, components, state.seed + 71);
    const scores = standard.X.map((row) => {
      return eigen.vectors.map((vector) => dot(row, vector));
    });
    const totalVariance =
      covariance.reduce((sum, row, index) => sum + row[index], 0) || 1;
    const explained = eigen.values.map((value) => Math.max(value, 0) / totalVariance);
    return {
      standardized: standard.X,
      mean: standard.mean,
      std: standard.std,
      scores,
      loadings: eigen.vectors,
      explained
    };
  }

  function computeClassicalMDS(X, components, seed) {
    const distancesSquared = pairwiseSquaredDistances(X);
    const n = distancesSquared.length;
    const rowMeans = distancesSquared.map((row) => average(row));
    const totalMean = average(rowMeans);
    const b = zeros(n, n);

    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        b[i][j] = -0.5 * (distancesSquared[i][j] - rowMeans[i] - rowMeans[j] + totalMean);
      }
    }

    const eigen = topSymmetricEigen(b, components, seed);
    const coords = range(n).map((rowIndex) =>
      eigen.vectors.map((vector, componentIndex) => {
        return vector[rowIndex] * Math.sqrt(Math.max(eigen.values[componentIndex], 0));
      })
    );
    return { coords, eigenvalues: eigen.values };
  }

  function topSymmetricEigen(matrix, components, seed) {
    const working = matrix.map((row) => row.slice());
    const vectors = [];
    const values = [];
    const rng = mulberry32(seed);
    const size = matrix.length;

    for (let component = 0; component < components; component += 1) {
      let vector = range(size).map(() => rng() - 0.5);
      vector = normalize(vector);

      for (let iter = 0; iter < 90; iter += 1) {
        let next = matVec(working, vector);
        vectors.forEach((prev) => {
          const projection = dot(next, prev);
          next = subtractVectors(next, scaleVector(prev, projection));
        });
        const norm = magnitude(next);
        if (norm < 1e-10) {
          break;
        }
        vector = next.map((value) => value / norm);
      }

      const lambda = dot(vector, matVec(working, vector));
      values.push(lambda);
      vectors.push(vector.slice());

      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          working[i][j] -= lambda * vector[i] * vector[j];
        }
      }
    }

    return { values, vectors };
  }

  function createTrainTestSplit(y, testFraction, stratify, seed) {
    const classCount = uniqueSorted(y).length;
    const full = countByLabel(y, classCount);
    const rng = mulberry32(seed);
    let testIndices = [];

    if (stratify) {
      const grouped = groupIndicesByLabel(y, classCount);
      grouped.forEach((indices) => {
        const shuffled = shuffle(indices.slice(), rng);
        const take = clamp(Math.round(indices.length * testFraction), 1, Math.max(1, indices.length - 1));
        testIndices = testIndices.concat(shuffled.slice(0, take));
      });
    } else {
      const shuffled = shuffle(range(y.length), rng);
      const take = clamp(Math.round(y.length * testFraction), 1, y.length - 1);
      testIndices = shuffled.slice(0, take);
    }

    testIndices.sort((a, b) => a - b);
    const testSet = new Set(testIndices);
    const trainIndices = range(y.length).filter((index) => !testSet.has(index));

    return {
      trainIndices,
      testIndices,
      train: countByLabel(selectEntries(y, trainIndices), classCount),
      test: countByLabel(selectEntries(y, testIndices), classCount),
      full,
      trainSize: trainIndices.length,
      testSize: testIndices.length
    };
  }

  function createKFolds(y, k, stratify, seed) {
    const classCount = uniqueSorted(y).length;
    const rng = mulberry32(seed);
    const foldIndices = range(k).map(() => []);

    if (stratify) {
      const grouped = groupIndicesByLabel(y, classCount);
      grouped.forEach((indices) => {
        const shuffled = shuffle(indices.slice(), rng);
        shuffled.forEach((index, position) => {
          foldIndices[position % k].push(index);
        });
      });
    } else {
      const shuffled = shuffle(range(y.length), rng);
      shuffled.forEach((index, position) => {
        foldIndices[position % k].push(index);
      });
    }

    foldIndices.forEach((fold) => fold.sort((a, b) => a - b));

    return {
      foldIndices,
      testDistributions: foldIndices.map((indices) => countByLabel(selectEntries(y, indices), classCount)),
      testSizes: foldIndices.map((indices) => indices.length)
    };
  }

  function runKMeans(X, k, seed) {
    const rng = mulberry32(seed);
    const centers = [];
    centers.push(X[Math.floor(rng() * X.length)].slice());

    while (centers.length < k) {
      const distances = X.map((row) => {
        const best = Math.min(...centers.map((center) => squaredDistance(row, center)));
        return best;
      });
      const total = distances.reduce((sum, value) => sum + value, 0);
      let threshold = rng() * total;
      let chosen = X[0];
      for (let i = 0; i < X.length; i += 1) {
        threshold -= distances[i];
        if (threshold <= 0) {
          chosen = X[i];
          break;
        }
      }
      centers.push(chosen.slice());
    }

    let assignments = new Array(X.length).fill(0);
    for (let iter = 0; iter < 40; iter += 1) {
      assignments = X.map((row) => {
        const dists = centers.map((center) => squaredDistance(row, center));
        return argMin(dists);
      });

      const nextCenters = range(k).map(() => []);
      X.forEach((row, index) => {
        nextCenters[assignments[index]].push(row);
      });

      for (let cluster = 0; cluster < k; cluster += 1) {
        if (!nextCenters[cluster].length) {
          centers[cluster] = X[Math.floor(rng() * X.length)].slice();
        } else {
          centers[cluster] = columnMeans(nextCenters[cluster]);
        }
      }
    }

    return { assignments, centers };
  }

  function runWardClustering(X, k) {
    let clusters = X.map((row, index) => ({
      id: index,
      indices: [index],
      size: 1,
      centroid: row.slice()
    }));
    const mergeHistory = [];

    while (clusters.length > k) {
      let bestI = 0;
      let bestJ = 1;
      let bestDistance = Infinity;

      for (let i = 0; i < clusters.length; i += 1) {
        for (let j = i + 1; j < clusters.length; j += 1) {
          const a = clusters[i];
          const b = clusters[j];
          const distance =
            (a.size * b.size) / (a.size + b.size) * squaredDistance(a.centroid, b.centroid);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestI = i;
            bestJ = j;
          }
        }
      }

      const first = clusters[bestI];
      const second = clusters[bestJ];
      const mergedSize = first.size + second.size;
      const mergedCentroid = first.centroid.map((value, dim) => {
        return (value * first.size + second.centroid[dim] * second.size) / mergedSize;
      });
      const merged = {
        id: first.id,
        indices: first.indices.concat(second.indices),
        size: mergedSize,
        centroid: mergedCentroid
      };
      mergeHistory.push({
        leftSize: first.size,
        rightSize: second.size,
        height: Math.sqrt(bestDistance)
      });

      clusters = clusters.filter((_, index) => index !== bestI && index !== bestJ);
      clusters.push(merged);
    }

    const assignments = new Array(X.length).fill(0);
    clusters.forEach((cluster, clusterIndex) => {
      cluster.indices.forEach((rowIndex) => {
        assignments[rowIndex] = clusterIndex;
      });
    });

    return { assignments, clusters, mergeHistory };
  }

  function runGaussianMixture(X, k, seed) {
    const rng = mulberry32(seed);
    const n = X.length;
    const p = X[0].length;
    const initial = runKMeans(X, k, seed + 13);
    const globalMean = columnMeans(X);
    const globalVar = new Array(p).fill(0);
    X.forEach((row) => {
      row.forEach((value, index) => {
        const diff = value - globalMean[index];
        globalVar[index] += diff * diff;
      });
    });
    for (let index = 0; index < p; index += 1) {
      globalVar[index] = globalVar[index] / Math.max(1, n - 1) + 0.05;
    }

    let means = initial.centers.map((center) => center.slice());
    let variances = range(k).map(() => globalVar.slice());
    let weights = new Array(k).fill(1 / k);
    let responsibilities = zeros(n, k);
    let logLikelihood = -Infinity;

    for (let iter = 0; iter < 24; iter += 1) {
      logLikelihood = 0;
      for (let i = 0; i < n; i += 1) {
        const logScores = range(k).map((component) => {
          return Math.log(Math.max(weights[component], 1e-9)) + gaussianLogDensityDiag(X[i], means[component], variances[component]);
        });
        const maxScore = Math.max(...logScores);
        const scores = logScores.map((value) => Math.exp(value - maxScore));
        const total = scores.reduce((sum, value) => sum + value, 0) || 1;
        for (let component = 0; component < k; component += 1) {
          responsibilities[i][component] = scores[component] / total;
        }
        logLikelihood += maxScore + Math.log(total);
      }

      for (let component = 0; component < k; component += 1) {
        const Nk = responsibilities.reduce((sum, row) => sum + row[component], 0);
        if (Nk < 1e-6) {
          means[component] = X[Math.floor(rng() * n)].slice();
          variances[component] = globalVar.slice();
          weights[component] = 1 / k;
          continue;
        }
        weights[component] = Nk / n;
        const mean = new Array(p).fill(0);
        for (let i = 0; i < n; i += 1) {
          for (let dim = 0; dim < p; dim += 1) {
            mean[dim] += responsibilities[i][component] * X[i][dim];
          }
        }
        for (let dim = 0; dim < p; dim += 1) {
          mean[dim] /= Nk;
        }
        const variance = new Array(p).fill(0);
        for (let i = 0; i < n; i += 1) {
          for (let dim = 0; dim < p; dim += 1) {
            const diff = X[i][dim] - mean[dim];
            variance[dim] += responsibilities[i][component] * diff * diff;
          }
        }
        for (let dim = 0; dim < p; dim += 1) {
          variance[dim] = variance[dim] / Nk + 1e-4;
        }
        means[component] = mean;
        variances[component] = variance;
      }
    }

    logLikelihood = 0;
    for (let i = 0; i < n; i += 1) {
      const logScores = range(k).map((component) => {
        return Math.log(Math.max(weights[component], 1e-9)) + gaussianLogDensityDiag(X[i], means[component], variances[component]);
      });
      const maxScore = Math.max(...logScores);
      const scores = logScores.map((value) => Math.exp(value - maxScore));
      const total = scores.reduce((sum, value) => sum + value, 0) || 1;
      for (let component = 0; component < k; component += 1) {
        responsibilities[i][component] = scores[component] / total;
      }
      logLikelihood += maxScore + Math.log(total);
    }

    const assignments = responsibilities.map((row) => argMax(row));
    const counts = new Array(k).fill(0);
    assignments.forEach((clusterId) => {
      counts[clusterId] += 1;
    });

    return {
      assignments,
      means,
      variances,
      weights,
      responsibilities,
      counts,
      logLikelihood
    };
  }

  function silhouetteScore(distances, assignments, k) {
    const clusters = range(k).map(() => []);
    assignments.forEach((clusterId, index) => {
      clusters[clusterId].push(index);
    });

    const values = assignments.map((clusterId, index) => {
      const sameCluster = clusters[clusterId].filter((item) => item !== index);
      const a =
        sameCluster.length === 0
          ? 0
          : average(sameCluster.map((otherIndex) => distances[index][otherIndex]));

      let b = Infinity;
      clusters.forEach((cluster, otherClusterId) => {
        if (otherClusterId === clusterId || cluster.length === 0) {
          return;
        }
        const candidate = average(cluster.map((otherIndex) => distances[index][otherIndex]));
        b = Math.min(b, candidate);
      });

      if (!Number.isFinite(b) && !a) {
        return 0;
      }
      return (b - a) / Math.max(a, b);
    });

    return average(values);
  }

  function withinClusterSumSquares(X, assignments, k) {
    const clusters = range(k).map(() => []);
    X.forEach((row, index) => {
      clusters[assignments[index]].push(row);
    });
    return clusters.reduce((sum, rows) => {
      if (!rows.length) {
        return sum;
      }
      const centroid = columnMeans(rows);
      return (
        sum +
        rows.reduce((inner, row) => inner + squaredDistance(row, centroid), 0)
      );
    }, 0);
  }

  function adjustedRandIndex(actual, predicted) {
    const actualClasses = uniqueSorted(actual);
    const predictedClasses = uniqueSorted(predicted);
    const contingency = zeros(actualClasses.length, predictedClasses.length);

    actual.forEach((value, index) => {
      const i = actualClasses.indexOf(value);
      const j = predictedClasses.indexOf(predicted[index]);
      contingency[i][j] += 1;
    });

    const sumComb = contingency.reduce((sum, row) => {
      return sum + row.reduce((inner, cell) => inner + combinations2(cell), 0);
    }, 0);
    const rowSums = contingency.map((row) => row.reduce((sum, value) => sum + value, 0));
    const colSums = transpose(contingency).map((row) => row.reduce((sum, value) => sum + value, 0));
    const totalPairs = combinations2(actual.length);
    const expected =
      (rowSums.reduce((sum, value) => sum + combinations2(value), 0) *
        colSums.reduce((sum, value) => sum + combinations2(value), 0)) /
      Math.max(1, totalPairs);
    const maxIndex =
      0.5 *
      (rowSums.reduce((sum, value) => sum + combinations2(value), 0) +
        colSums.reduce((sum, value) => sum + combinations2(value), 0));
    return (sumComb - expected) / Math.max(1e-12, maxIndex - expected);
  }

  function chooseWeek6Axes(tree, dataset) {
    if (tree.type !== "split") {
      return { xIndex: 0, yIndex: Math.min(1, dataset.p - 1) };
    }
    const childFeatures = [tree.left, tree.right]
      .filter((node) => node?.type === "split")
      .map((node) => node.feature)
      .find((feature) => feature !== tree.feature);
    const xIndex = tree.feature;
    const yIndex = childFeatures != null ? childFeatures : firstDifferentFeature(dataset.p, xIndex);
    return { xIndex, yIndex };
  }

  function firstDifferentFeature(total, excluded) {
    for (let index = 0; index < total; index += 1) {
      if (index !== excluded) {
        return index;
      }
    }
    return excluded;
  }

  function summarizeCounts(counts, labels) {
    return counts
      .map((count, index) => `${labels[index]} ${count}`)
      .join(" | ");
  }

  function renderWeek6SplitSvg(svg, split) {
    const width = 540;
    const height = 420;
    const margin = { top: 20, right: 20, bottom: 48, left: 56 };
    const points = split.candidates.length ? split.candidates : [{ threshold: 0, weightedImpurity: split.parentImpurity }];
    const xScale = linearScale(extent(points.map((point) => point.threshold)), [margin.left, width - margin.right]);
    const yValues = points.map((point) => point.weightedImpurity).concat(split.parentImpurity);
    const yScale = linearScale([Math.max(0, Math.min(...yValues) - 0.02), Math.min(1, Math.max(...yValues) + 0.02)], [height - margin.bottom, margin.top]);
    const path = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.threshold)} ${yScale(point.weightedImpurity)}`)
      .join(" ");
    const markers = points
      .map((point) => {
        const isBest = split.best && point.threshold === split.best.threshold;
        return `<circle cx="${xScale(point.threshold)}" cy="${yScale(point.weightedImpurity)}" r="${isBest ? 4.5 : 2.6}" fill="${isBest ? "#b85c38" : "#0f4d66"}"></circle>`;
      })
      .join("");
    const parentY = yScale(split.parentImpurity);
    const bestLine = split.best
      ? `<line x1="${xScale(split.best.threshold)}" y1="${margin.top}" x2="${xScale(split.best.threshold)}" y2="${height - margin.bottom}" stroke="#b85c38" stroke-dasharray="6 5" stroke-width="1.4"></line>`
      : "";
    svg.innerHTML =
      `${axisFrame(width, height, margin, split.featureName, "weighted Gini after split")}` +
      `<line x1="${margin.left}" y1="${parentY}" x2="${width - margin.right}" y2="${parentY}" stroke="#8f99aa" stroke-dasharray="4 4"></line>` +
      bestLine +
      `<path d="${path}" fill="none" stroke="#0f4d66" stroke-width="2"></path>` +
      markers;
  }

  function renderWeek6TreeSvg(svg, points, axes, tree) {
    const width = 540;
    const height = 420;
    const margin = { top: 20, right: 20, bottom: 48, left: 56 };
    const xRange = padExtent(extent(points.map((point) => point.x)), 0.08);
    const yRange = padExtent(extent(points.map((point) => point.y)), 0.08);
    const xScale = linearScale(xRange, [margin.left, width - margin.right]);
    const yScale = linearScale(yRange, [height - margin.bottom, margin.top]);
    const circles = points
      .map((point) => `<circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="4.2" fill="${PALETTE[point.classId % PALETTE.length]}" fill-opacity="0.8" stroke="#ffffff" stroke-width="0.8"></circle>`)
      .join("");
    const lines = [];
    drawWeek6TreeLines(tree, axes, xRange, yRange, xScale, yScale, lines, 0);
    svg.innerHTML =
      `${axisFrame(width, height, margin, cache.dataset.columns[axes.xIndex], cache.dataset.columns[axes.yIndex])}` +
      lines.join("") +
      circles;
  }

  function drawWeek6TreeLines(node, axes, xRange, yRange, xScale, yScale, lines, depth) {
    if (!node || node.type !== "split" || depth > 1) {
      return;
    }
    let leftXRange = xRange.slice();
    let rightXRange = xRange.slice();
    let leftYRange = yRange.slice();
    let rightYRange = yRange.slice();
    if (node.feature === axes.xIndex) {
      const x = xScale(node.threshold);
      lines.push(`<line x1="${x}" y1="${yScale(yRange[0])}" x2="${x}" y2="${yScale(yRange[1])}" stroke="${depth === 0 ? "#b85c38" : "#0f4d66"}" stroke-width="${depth === 0 ? 2.2 : 1.6}" stroke-dasharray="${depth === 0 ? "" : "6 5"}"></line>`);
      leftXRange = [xRange[0], Math.min(xRange[1], node.threshold)];
      rightXRange = [Math.max(xRange[0], node.threshold), xRange[1]];
    } else if (node.feature === axes.yIndex) {
      const y = yScale(node.threshold);
      lines.push(`<line x1="${xScale(xRange[0])}" y1="${y}" x2="${xScale(xRange[1])}" y2="${y}" stroke="${depth === 0 ? "#b85c38" : "#0f4d66"}" stroke-width="${depth === 0 ? 2.2 : 1.6}" stroke-dasharray="${depth === 0 ? "" : "6 5"}"></line>`);
      leftYRange = [yRange[0], Math.min(yRange[1], node.threshold)];
      rightYRange = [Math.max(yRange[0], node.threshold), yRange[1]];
    } else if (depth === 0) {
      return;
    }
    drawWeek6TreeLines(node.left, axes, leftXRange, leftYRange, xScale, yScale, lines, depth + 1);
    drawWeek6TreeLines(node.right, axes, rightXRange, rightYRange, xScale, yScale, lines, depth + 1);
  }

  function renderScatterSvg(svg, points, xLabel, yLabel) {
    const width = 540;
    const height = 420;
    const margin = { top: 20, right: 20, bottom: 48, left: 56 };
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const xScale = linearScale(extent(xs), [margin.left, width - margin.right]);
    const yScale = linearScale(extent(ys), [height - margin.bottom, margin.top]);
    const classes = uniqueSorted(points.map((point) => point.classId));

    const circles = points
      .map((point) => {
        const fill = PALETTE[point.classId % PALETTE.length];
        return `<circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="4.3" fill="${fill}" fill-opacity="0.78" stroke="#ffffff" stroke-width="0.8"></circle>`;
      })
      .join("");

    const legend = classes
      .map((classId, index) => {
        return `
          <circle cx="${margin.left + index * 88}" cy="${height - 18}" r="5" fill="${PALETTE[classId % PALETTE.length]}"></circle>
          <text x="${margin.left + 10 + index * 88}" y="${height - 14}" font-size="12" fill="#5a6475">${escapeHtml(
            points.find((point) => point.classId === classId)?.label || `Class ${classId + 1}`
          )}</text>
        `;
      })
      .join("");

    svg.innerHTML = `
      ${axisFrame(width, height, margin, xLabel, yLabel)}
      ${circles}
      ${legend}
    `;
  }

  function renderDecisionBoundarySvg(svg, predictFn, points, classCount) {
    const width = 540;
    const height = 420;
    const margin = { top: 18, right: 18, bottom: 42, left: 48 };
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const xRange = padExtent(extent(xs), 0.18);
    const yRange = padExtent(extent(ys), 0.18);
    const xScale = linearScale(xRange, [margin.left, width - margin.right]);
    const yScale = linearScale(yRange, [height - margin.bottom, margin.top]);
    const gridX = 42;
    const gridY = 30;
    const cellWidth = (width - margin.left - margin.right) / gridX;
    const cellHeight = (height - margin.top - margin.bottom) / gridY;
    const rects = [];

    for (let gx = 0; gx < gridX; gx += 1) {
      for (let gy = 0; gy < gridY; gy += 1) {
        const x = xRange[0] + ((gx + 0.5) / gridX) * (xRange[1] - xRange[0]);
        const y = yRange[0] + ((gy + 0.5) / gridY) * (yRange[1] - yRange[0]);
        const pred = predictFn([[x, y]])[0];
        rects.push(
          `<rect x="${margin.left + gx * cellWidth}" y="${margin.top + gy * cellHeight}" width="${cellWidth + 0.5}" height="${cellHeight + 0.5}" fill="${
            LIGHT_PALETTE[pred % LIGHT_PALETTE.length]
          }"></rect>`
        );
      }
    }

    const circles = points
      .map((point) => {
        return `<circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="4.6" fill="${PALETTE[point.classId % PALETTE.length]}" stroke="#ffffff" stroke-width="1"></circle>`;
      })
      .join("");

    svg.innerHTML = `${axisFrame(width, height, margin, "x1", "x2")}${rects.join("")}${circles}`;
  }

  function renderClusterPlot(svg, displayPoints, assignments, xLabel, yLabel) {
    const width = 540;
    const height = 420;
    const margin = { top: 20, right: 20, bottom: 44, left: 56 };
    const xs = displayPoints.map((point) => point.x);
    const ys = displayPoints.map((point) => point.y);
    const xScale = linearScale(extent(xs), [margin.left, width - margin.right]);
    const yScale = linearScale(extent(ys), [height - margin.bottom, margin.top]);
    const marks = displayPoints
      .map((point, index) => {
        const clusterId = assignments[index];
        return `<circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="4.4" fill="${PALETTE[clusterId % PALETTE.length]}" fill-opacity="0.78" stroke="#ffffff" stroke-width="0.9"></circle>`;
      })
      .join("");
    svg.innerHTML = `${axisFrame(width, height, margin, xLabel, yLabel)}${marks}`;
  }

  function renderMessageSvg(svg, message) {
    svg.innerHTML = `
      <rect x="1" y="1" width="538" height="418" fill="#fbfcfd" stroke="#e3e7ed"></rect>
      <text x="270" y="205" text-anchor="middle" font-size="15" fill="#5a6475">${escapeHtml(message)}</text>
    `;
  }

  function renderPermutationHistogramSvg(svg, experiment) {
    const width = 540;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 48, left: 56 };
    const bins = 10;
    const counts = new Array(bins).fill(0);
    experiment.nullScores.forEach((score) => {
      const binIndex = Math.min(bins - 1, Math.floor(score * bins));
      counts[binIndex] += 1;
    });
    const xScale = linearScale([0, 1], [margin.left, width - margin.right]);
    const yScale = linearScale([0, Math.max(1, Math.max(...counts))], [height - margin.bottom, margin.top]);
    const barWidth = (width - margin.left - margin.right) / bins;
    const bars = counts
      .map((count, index) => {
        const x0 = margin.left + index * barWidth + 3;
        const x1 = x0 + barWidth - 6;
        const y = yScale(count);
        return `<rect x="${x0}" y="${y}" width="${Math.max(1, x1 - x0)}" height="${height - margin.bottom - y}" fill="#d8e4ea" stroke="#9bb3bf"></rect>`;
      })
      .join("");
    const observedX = xScale(experiment.observedScore);
    const chanceX = xScale(experiment.chanceLevel);

    svg.innerHTML =
      `${axisFrame(width, height, margin, "balanced accuracy", "shuffled-label runs")}` +
      bars +
      `<line x1="${chanceX}" y1="${margin.top}" x2="${chanceX}" y2="${height - margin.bottom}" stroke="#8f99aa" stroke-dasharray="5 4" stroke-width="1.4"></line>` +
      `<line x1="${observedX}" y1="${margin.top}" x2="${observedX}" y2="${height - margin.bottom}" stroke="#b85c38" stroke-width="2.2"></line>` +
      `<text x="${Math.min(width - margin.right, observedX + 6)}" y="${margin.top + 14}" font-size="12" fill="#b85c38">observed</text>` +
      `<text x="${Math.min(width - margin.right, chanceX + 6)}" y="${margin.top + 30}" font-size="12" fill="#5a6475">chance</text>`;
  }

  function renderBootstrapHistogramSvg(svg, experiment) {
    const width = 540;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 48, left: 56 };
    const bins = 10;
    const counts = new Array(bins).fill(0);
    experiment.scores.forEach((score) => {
      const clipped = Math.max(0, Math.min(0.999999, score));
      const binIndex = Math.min(bins - 1, Math.floor(clipped * bins));
      counts[binIndex] += 1;
    });
    const xScale = linearScale([0, 1], [margin.left, width - margin.right]);
    const yScale = linearScale([0, Math.max(1, Math.max(...counts))], [height - margin.bottom, margin.top]);
    const barWidth = (width - margin.left - margin.right) / bins;
    const bars = counts
      .map((count, index) => {
        const x0 = margin.left + index * barWidth + 3;
        const x1 = x0 + barWidth - 6;
        const y = yScale(count);
        return `<rect x="${x0}" y="${y}" width="${Math.max(1, x1 - x0)}" height="${height - margin.bottom - y}" fill="#efe2cf" stroke="#c8a97e"></rect>`;
      })
      .join("");
    const medianX = xScale(experiment.medianScore);
    const lowX = xScale(experiment.lowScore);
    const highX = xScale(experiment.highScore);

    svg.innerHTML =
      `${axisFrame(width, height, margin, "balanced accuracy", "bootstrap runs")}` +
      bars +
      `<line x1="${lowX}" y1="${margin.top}" x2="${lowX}" y2="${height - margin.bottom}" stroke="#7a6a52" stroke-dasharray="4 4" stroke-width="1.2"></line>` +
      `<line x1="${highX}" y1="${margin.top}" x2="${highX}" y2="${height - margin.bottom}" stroke="#7a6a52" stroke-dasharray="4 4" stroke-width="1.2"></line>` +
      `<line x1="${medianX}" y1="${margin.top}" x2="${medianX}" y2="${height - margin.bottom}" stroke="#9a5a24" stroke-width="2.2"></line>` +
      `<text x="${Math.min(width - margin.right, medianX + 6)}" y="${margin.top + 14}" font-size="12" fill="#9a5a24">median</text>` +
      `<text x="${Math.min(width - margin.right, highX + 6)}" y="${margin.top + 30}" font-size="12" fill="#7a6a52">80% band</text>`;
  }

  function setVisible(element, visible) {
    if (!element) {
      return;
    }
    element.hidden = !visible;
  }

  function axisFrame(width, height, margin, xLabel, yLabel) {
    return `
      <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"></rect>
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#8f99aa"></line>
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${margin.left}" y2="${margin.top}" stroke="#8f99aa"></line>
      <text x="${(margin.left + width - margin.right) / 2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#5a6475">${escapeHtml(
        xLabel
      )}</text>
      <text x="16" y="${(margin.top + height - margin.bottom) / 2}" transform="rotate(-90 16 ${(margin.top +
        height -
        margin.bottom) /
        2})" text-anchor="middle" font-size="12" fill="#5a6475">${escapeHtml(yLabel)}</text>
    `;
  }

  function renderTable(table, headers, rows) {
    const headerHtml = `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>`;
    const bodyHtml = rows
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
      .join("");
    table.innerHTML = `<thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody>`;
  }

  function computeAccuracy(actual, predicted) {
    let correct = 0;
    for (let i = 0; i < actual.length; i += 1) {
      if (actual[i] === predicted[i]) {
        correct += 1;
      }
    }
    return correct / Math.max(1, actual.length);
  }

  function computeMacroF1(actual, predicted, classCount) {
    const matrix = confusionMatrix(actual, predicted, classCount);
    const f1s = range(classCount).map((classIndex) => {
      const tp = matrix[classIndex][classIndex];
      const fp = matrix.reduce((sum, row, rowIndex) => sum + (rowIndex === classIndex ? 0 : row[classIndex]), 0);
      const fn = matrix[classIndex].reduce((sum, value, columnIndex) => sum + (columnIndex === classIndex ? 0 : value), 0);
      const precision = tp / Math.max(1, tp + fp);
      const recall = tp / Math.max(1, tp + fn);
      return (2 * precision * recall) / Math.max(1e-12, precision + recall);
    });
    return average(f1s);
  }

  function computeBalancedAccuracy(actual, predicted, classCount) {
    const matrix = confusionMatrix(actual, predicted, classCount);
    const recalls = range(classCount).map((classIndex) => {
      const tp = matrix[classIndex][classIndex];
      const total = matrix[classIndex].reduce((sum, value) => sum + value, 0);
      return tp / Math.max(1, total);
    });
    return average(recalls);
  }

  function confusionMatrix(actual, predicted, classCount) {
    const matrix = zeros(classCount, classCount);
    actual.forEach((label, index) => {
      matrix[label][predicted[index]] += 1;
    });
    return matrix;
  }

  function countByLabel(values, classCount) {
    const counts = new Array(classCount).fill(0);
    values.forEach((value) => {
      counts[value] += 1;
    });
    return counts;
  }

  function groupIndicesByLabel(y, classCount) {
    const groups = range(classCount).map(() => []);
    y.forEach((label, index) => groups[label].push(index));
    return groups;
  }

  function standardizeMatrix(X) {
    const mean = columnMeans(X);
    const std = columnStd(X, mean);
    return {
      X: applyStandardization(X, mean, std),
      mean,
      std
    };
  }

  function applyStandardization(X, mean, std) {
    return X.map((row) => row.map((value, index) => (value - mean[index]) / std[index]));
  }

  function columnMeans(X) {
    const sums = new Array(X[0].length).fill(0);
    X.forEach((row) => {
      row.forEach((value, index) => {
        sums[index] += value;
      });
    });
    return sums.map((value) => value / X.length);
  }

  function columnStd(X, mean) {
    const sums = new Array(X[0].length).fill(0);
    X.forEach((row) => {
      row.forEach((value, index) => {
        const diff = value - mean[index];
        sums[index] += diff * diff;
      });
    });
    return sums.map((value) => {
      const std = Math.sqrt(value / Math.max(1, X.length - 1));
      return std === 0 ? 1 : std;
    });
  }

  function covarianceMatrix(X) {
    const p = X[0].length;
    const cov = zeros(p, p);
    X.forEach((row) => {
      for (let i = 0; i < p; i += 1) {
        for (let j = 0; j < p; j += 1) {
          cov[i][j] += row[i] * row[j];
        }
      }
    });
    for (let i = 0; i < p; i += 1) {
      for (let j = 0; j < p; j += 1) {
        cov[i][j] /= Math.max(1, X.length - 1);
      }
    }
    return cov;
  }

  function addIntercept(X) {
    return X.map((row) => [1].concat(row));
  }

  function invertMatrix(matrix) {
    const n = matrix.length;
    const augmented = matrix.map((row, rowIndex) => {
      const identity = new Array(n).fill(0);
      identity[rowIndex] = 1;
      return row.slice().concat(identity);
    });

    for (let col = 0; col < n; col += 1) {
      let pivot = col;
      for (let row = col + 1; row < n; row += 1) {
        if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivot][col])) {
          pivot = row;
        }
      }
      if (pivot !== col) {
        [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
      }
      const pivotValue = augmented[col][col] || 1e-10;
      for (let j = 0; j < 2 * n; j += 1) {
        augmented[col][j] /= pivotValue;
      }
      for (let row = 0; row < n; row += 1) {
        if (row === col) {
          continue;
        }
        const factor = augmented[row][col];
        for (let j = 0; j < 2 * n; j += 1) {
          augmented[row][j] -= factor * augmented[col][j];
        }
      }
    }

    return augmented.map((row) => row.slice(n));
  }

  function pairwiseDistances(X) {
    return X.map((row) => X.map((other) => euclidean(row, other)));
  }

  function pairwiseSquaredDistances(X) {
    return X.map((row) => X.map((other) => squaredDistance(row, other)));
  }

  function linearScale(domain, rangeValues) {
    const [d0, d1] = domain[0] === domain[1] ? [domain[0] - 1, domain[1] + 1] : domain;
    const [r0, r1] = rangeValues;
    return (value) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
  }

  function padExtent(domain, ratio) {
    const span = domain[1] - domain[0] || 1;
    return [domain[0] - span * ratio, domain[1] + span * ratio];
  }

  function extent(values) {
    return [Math.min(...values), Math.max(...values)];
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  }

  function quantile(sortedValues, q) {
    if (!sortedValues.length) {
      return NaN;
    }
    const index = (sortedValues.length - 1) * q;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
      return sortedValues[lower];
    }
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  function euclidean(a, b) {
    return Math.sqrt(squaredDistance(a, b));
  }

  function squaredDistance(a, b) {
    let total = 0;
    for (let i = 0; i < a.length; i += 1) {
      const diff = a[i] - b[i];
      total += diff * diff;
    }
    return total;
  }

  function matVec(matrix, vector) {
    return matrix.map((row) => dot(row, vector));
  }

  function dot(a, b) {
    let total = 0;
    for (let i = 0; i < a.length; i += 1) {
      total += a[i] * b[i];
    }
    return total;
  }

  function transpose(matrix) {
    return matrix[0].map((_, columnIndex) => matrix.map((row) => row[columnIndex]));
  }

  function zeros(rows, cols) {
    return range(rows).map(() => new Array(cols).fill(0));
  }

  function normalize(vector) {
    const norm = magnitude(vector) || 1;
    return vector.map((value) => value / norm);
  }

  function magnitude(vector) {
    return Math.sqrt(dot(vector, vector));
  }

  function subtractVectors(a, b) {
    return a.map((value, index) => value - b[index]);
  }

  function scaleVector(vector, scalar) {
    return vector.map((value) => value * scalar);
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values)).sort((a, b) => a - b);
  }

  function majorityVote(values) {
    const counts = new Map();
    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  function giniImpurity(values) {
    const counts = new Map();
    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return 1 - Array.from(counts.values()).reduce((sum, count) => {
      const p = count / values.length;
      return sum + p * p;
    }, 0);
  }

  function sigmoid(value) {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, value))));
  }

  function softmax(values) {
    const maxValue = Math.max(...values);
    const exps = values.map((value) => Math.exp(value - maxValue));
    const total = exps.reduce((sum, value) => sum + value, 0) || 1;
    return exps.map((value) => value / total);
  }

  function neuralNetworkLoss(features, y, classes, W1, b1, W2, b2) {
    const classToIndex = new Map(classes.map((cls, index) => [cls, index]));
    let total = 0;
    for (let rowIndex = 0; rowIndex < features.length; rowIndex += 1) {
      const hiddenAct = W1.map((weights, hiddenIndex) => Math.tanh(dot(weights, features[rowIndex]) + b1[hiddenIndex]));
      const logits = W2.map((weights, outputIndex) => dot(weights, hiddenAct) + b2[outputIndex]);
      const probs = softmax(logits);
      total -= Math.log(Math.max(probs[classToIndex.get(y[rowIndex])], 1e-9));
    }
    return total / Math.max(1, features.length);
  }

  function gaussianLogDensityDiag(row, mean, variance) {
    let total = 0;
    for (let dim = 0; dim < row.length; dim += 1) {
      const varValue = Math.max(variance[dim], 1e-6);
      const diff = row[dim] - mean[dim];
      total += -0.5 * (Math.log(2 * Math.PI * varValue) + (diff * diff) / varValue);
    }
    return total;
  }

  function argMax(values) {
    let bestIndex = 0;
    for (let i = 1; i < values.length; i += 1) {
      if (values[i] > values[bestIndex]) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  function argMin(values) {
    let bestIndex = 0;
    for (let i = 1; i < values.length; i += 1) {
      if (values[i] < values[bestIndex]) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  function selectRows(matrix, indices) {
    return indices.map((index) => matrix[index].slice());
  }

  function selectEntries(values, indices) {
    return indices.map((index) => values[index]);
  }

  function complementIndices(length, excluded) {
    const set = new Set(excluded);
    return range(length).filter((index) => !set.has(index));
  }

  function sampleWithoutReplacement(length, sampleSize, seed) {
    return shuffle(range(length), mulberry32(seed)).slice(0, sampleSize).sort((a, b) => a - b);
  }

  function bootstrapSampleIndices(length, seed) {
    const rng = mulberry32(seed);
    return range(length).map(() => Math.floor(rng() * length));
  }

  function shuffle(values, rng) {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }

  function combinations2(n) {
    return n < 2 ? 0 : (n * (n - 1)) / 2;
  }

  function range(n) {
    return Array.from({ length: n }, (_, index) => index);
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function next() {
      t += 0x6d2b79f5;
      let value = t;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomNormal(rng) {
    const u1 = Math.max(rng(), 1e-12);
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function createLinearToy(seed) {
    const rng = mulberry32(seed);
    const data = [];
    const target = [];
    const centers = [
      [-1.9, -1.2],
      [1.8, 1.3]
    ];

    centers.forEach((center, classId) => {
      for (let i = 0; i < TOY_POINTS / 2; i += 1) {
        const x1 = center[0] + randomNormal(rng) * 0.45;
        const x2 = center[1] + randomNormal(rng) * 0.45;
        data.push([x1 + x2 * 0.08, x2]);
        target.push(classId);
      }
    });

    return {
      name: "Toy: linearly separable classes",
      columns: ["x1", "x2"],
      data,
      target,
      target_names: ["Class A", "Class B"],
      description:
        "Two well-separated Gaussian clouds for showing linear decision boundaries, stratified splits, and simple classifier comparisons."
    };
  }

  function createNonlinearToy(seed) {
    const rng = mulberry32(seed);
    const data = [];
    const target = [];

    for (let i = 0; i < TOY_POINTS / 2; i += 1) {
      const angle = rng() * Math.PI;
      const noise = randomNormal(rng) * 0.12;
      data.push([Math.cos(angle) + noise, Math.sin(angle) + noise]);
      target.push(0);
    }
    for (let i = 0; i < TOY_POINTS / 2; i += 1) {
      const angle = rng() * Math.PI;
      const noise = randomNormal(rng) * 0.12;
      data.push([1 - Math.cos(angle) + noise, 1 - Math.sin(angle) - 0.55 + noise]);
      target.push(1);
    }

    return {
      name: "Toy: nonlinear classes",
      columns: ["x1", "x2"],
      data,
      target,
      target_names: ["Moon A", "Moon B"],
      description:
        "Two interleaving moon-shaped classes for showing when local models like KNN or trees can fit curved structure better than linear boundaries."
    };
  }

  function createClusterToy(seed) {
    const rng = mulberry32(seed);
    const data = [];
    const target = [];
    const centers = [
      [-2.4, -0.6],
      [0.2, 2.1],
      [2.5, -1.4]
    ];

    centers.forEach((center, classId) => {
      for (let i = 0; i < TOY_POINTS / centers.length; i += 1) {
        const spread = classId === 1 ? 0.35 : 0.55;
        data.push([
          center[0] + randomNormal(rng) * spread,
          center[1] + randomNormal(rng) * (spread + 0.05)
        ]);
        target.push(classId);
      }
    });

    return {
      name: "Toy: clustering blobs",
      columns: ["x1", "x2"],
      data,
      target,
      target_names: ["Blob 1", "Blob 2", "Blob 3"],
      description:
        "A three-blob toy dataset with known labels kept only for evaluation, useful for comparing k-means and hierarchical clustering quality."
    };
  }

  function describeFeatureScales(data, columns) {
    const means = columnMeans(data);
    const std = columnStd(data, means);
    const ranked = columns
      .map((name, index) => ({ name, std: std[index] }))
      .sort((a, b) => b.std - a.std);
    return {
      lines: ranked
        .slice(0, Math.min(4, ranked.length))
        .map((item) => `${item.name}: sd ${formatNumber(item.std, 2)}`),
      maxStd: ranked[0]?.std || 1,
      minStd: ranked[ranked.length - 1]?.std || 1
    };
  }

  function describeSilhouette(value) {
    if (value > 0.5) {
      return "look well separated in this projection";
    }
    if (value > 0.25) {
      return "show some structure but still overlap";
    }
    return "are weakly separated or mixed together";
  }

  function describeAri(value) {
    if (value > 0.75) {
      return "align closely with the known labels";
    }
    if (value > 0.4) {
      return "capture part of the labelled structure";
    }
    return "do not line up strongly with the known labels";
  }

  function formatPct(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function formatNumber(value, digits) {
    if (!Number.isFinite(value)) {
      return "N/A";
    }
    return Number(value).toFixed(digits);
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
})();
