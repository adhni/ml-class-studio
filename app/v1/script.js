(() => {
  "use strict";

  const TOY_POINTS = 180;
  const MAX_HIERARCHICAL_ROWS = 180;
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
    seed: 123,
    validationMode: "holdout",
    testFraction: 0.25,
    kFolds: 5,
    stratify: true,
    knnK: 7,
    treeDepth: 4,
    clusterK: 3,
    framingMode: "classification",
    focusModel: "knn",
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
    classification: null,
    clustering: null
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    collectElements();
    bindControls();
    buildToyDatasets(state.seed);
    populateDatasetSelector();
    syncScatterOptions();
    runAnalysis();
  }

  function collectElements() {
    const ids = [
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
      "treeDepth",
      "treeDepth_num",
      "clusterK",
      "clusterK_num",
      "framingMode",
      "framingSummary",
      "xyDefinition",
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
      "classificationMetricsTable",
      "classificationModeCaption",
      "focusModel",
      "confusionTable",
      "modelSummary",
      "confusionCaption",
      "boundaryPlot",
      "boundaryCaption",
      "clusteringTable",
      "clusteringCaption",
      "kmeansPlot",
      "kmeansCaption",
      "hierPlot",
      "hierCaption",
      "hierSummary",
      "hierSummaryCaption",
      "rerunBtn"
    ];

    ids.forEach((id) => {
      elements[id] = document.getElementById(id);
    });
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
    bindPair("treeDepth", "treeDepth_num", (value) => {
      state.treeDepth = clamp(Math.round(value), 1, 8);
      runAnalysis();
    });
    bindPair("clusterK", "clusterK_num", (value) => {
      state.clusterK = clamp(Math.round(value), 2, 8);
      runAnalysis();
    });

    elements.datasetSelect.addEventListener("change", (event) => {
      state.datasetId = event.target.value;
      syncScatterOptions();
      runAnalysis();
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
    });
    elements.scatterX.addEventListener("change", (event) => {
      state.scatterX = Number(event.target.value);
      renderVisualisationPanels();
    });
    elements.scatterY.addEventListener("change", (event) => {
      state.scatterY = Number(event.target.value);
      renderVisualisationPanels();
    });
    elements.rerunBtn.addEventListener("click", runAnalysis);
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

  function runAnalysis() {
    const dataset = getActiveDataset();
    cache.dataset = dataset;
    cache.pca = computePCA(dataset.data, 2);
    cache.mds = computeClassicalMDS(cache.pca.standardized, 2, state.seed + 5);
    cache.split = createTrainTestSplit(dataset.target, state.testFraction, state.stratify, state.seed + 11);
    cache.folds = createKFolds(dataset.target, state.kFolds, state.stratify, state.seed + 23);
    cache.classification = evaluateClassificationModels(dataset);
    cache.clustering = evaluateClustering(dataset, cache.pca);

    renderProblemFraming();
    renderDatasetMeta();
    renderVisualisationPanels();
    renderResamplingPanels();
    renderClassificationPanels();
    renderClusteringPanels();
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
    const dataset = cache.dataset;
    const split = cache.split;
    const folds = cache.folds;
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
  }

  function renderClassificationPanels() {
    const evaluation = cache.classification;
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

  function renderModelInspection() {
    const evaluation = cache.classification;
    if (!evaluation) {
      return;
    }

    const modelId = state.focusModel;
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
      renderMessageSvg(
        elements.boundaryPlot,
        "Decision boundaries are shown only for the 2D toy datasets so the geometry stays readable."
      );
      elements.boundaryCaption.textContent =
        "Plain-English caption: switch to the linear or nonlinear toy dataset to see how each classifier carves up the feature space.";
      return;
    }

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
    renderTable(elements.clusteringTable, ["Algorithm", "Silhouette", "WCSS", "Adjusted Rand"], rows);
    elements.clusteringCaption.textContent =
      `Silhouette closer to 1 means tighter, cleaner separation. Lower within-cluster sum of squares means clusters are more compact. Adjusted Rand compares the unsupervised clusters to the known labels without using those labels during fitting.`;

    renderClusterPlot(elements.kmeansPlot, clustering.displayPoints, clustering.kmeans.assignments, "PC1", "PC2");
    renderClusterPlot(elements.hierPlot, clustering.displayPoints, clustering.hierarchical.assignments, "PC1", "PC2");

    elements.kmeansCaption.textContent = buildClusterCaption("k-means", clustering.kmeans, clustering);
    elements.hierCaption.textContent = buildClusterCaption("hierarchical clustering", clustering.hierarchical, clustering);
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

  function evaluateClassificationModels(dataset) {
    const modelIds = ["knn", "logistic", "lda", "tree"];
    const labels = {
      knn: "KNN",
      logistic: "Logistic regression",
      lda: "LDA",
      tree: "Decision tree"
    };

    const metrics = {};
    const details = {};
    const summaries = {};
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
      metrics[modelId] = { accuracy, macroF1 };
      details[modelId] = { actual: filteredActual, predicted: filteredPred };

      const fullFit = fitModel(modelId, dataset.data, dataset.target, dataset.columns);
      summaries[modelId] = buildModelSummary(modelId, fullFit, dataset);
      if (!firstFit) {
        firstFit = fullFit;
      }
    });

    return {
      order: modelIds,
      labels,
      metrics,
      details,
      summaries
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

    const displayPoints = subsetScores.map((row) => ({ x: row[0], y: row[1] }));

    return {
      usedSubset,
      displayPoints,
      kmeans,
      hierarchical
    };
  }

  function fitModel(modelId, X, y, columns) {
    switch (modelId) {
      case "knn":
        return fitKNN(X, y, state.knnK);
      case "logistic":
        return fitLogisticOvr(X, y, columns);
      case "lda":
        return fitLDA(X, y, columns);
      case "tree":
        return fitDecisionTree(X, y, columns, state.treeDepth);
      default:
        throw new Error(`Unknown model ${modelId}`);
    }
  }

  function fitKNN(X, y, k) {
    const standard = standardizeMatrix(X);
    return {
      modelType: "knn",
      k,
      standard,
      classes: uniqueSorted(y),
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

  function fitLogisticOvr(X, y, columns) {
    const standard = standardizeMatrix(X);
    const classes = uniqueSorted(y);
    const Xb = addIntercept(standard.X);
    const lambda = 0.01;
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
      weights,
      predict(rows) {
        const scaled = addIntercept(applyStandardization(rows, standard.mean, standard.std));
        return scaled.map((row) => {
          const scores = weights.map((w) => dot(row, w));
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
    const tree = buildTree(X, y, featureNames, 0, maxDepth);
    return {
      modelType: "tree",
      tree,
      columns: featureNames,
      predict(rows) {
        return rows.map((row) => predictTree(tree, row));
      }
    };
  }

  function buildTree(X, y, columns, depth, maxDepth) {
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

    for (let feature = 0; feature < columns.length; feature += 1) {
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
      left: buildTree(best.leftX, best.leftY, columns, depth + 1, maxDepth),
      right: buildTree(best.rightX, best.rightY, columns, depth + 1, maxDepth)
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

  function buildModelSummary(modelId, fit, dataset) {
    if (modelId === "knn") {
      return `KNN summary\n- Uses k = ${fit.k} neighbours.\n- Works by finding nearby training points after standardising the features.\n- It adapts well to curved boundaries, but it can become noisy when classes overlap.`;
    }

    if (modelId === "logistic") {
      const blocks = fit.weights.map((weights, classIndex) => {
        const pairs = weights
          .slice(1)
          .map((value, featureIndex) => ({
            name: dataset.columns[featureIndex],
            value
          }))
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
          .slice(0, 2)
          .map((item) => `${item.name} (${item.value >= 0 ? "+" : ""}${formatNumber(item.value, 2)})`);
        return `${dataset.targetNames[classIndex]}: strongest coefficients ${pairs.join(", ")}`;
      });
      return `Logistic regression summary\n- Fits one linear log-odds boundary per class in a one-vs-rest setup.\n- Features are standardised before fitting.\n- ${blocks.join("\n- ")}`;
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

    const stats = describeTree(fit.tree);
    return `Decision tree summary\n- Maximum depth is ${state.treeDepth}; realised depth is ${stats.depth} with ${stats.leaves} leaves.\n- First split: ${stats.firstSplit || "no split was useful on the full dataset"}.\n- Trees are easy to explain, but deep trees can fit local quirks rather than broad patterns.`;
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
