(() => {
  "use strict";

  const output = document.getElementById("testOutput");
  const api = window.ML_STUDIO_TEST_API;
  const results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name, ok: true });
    } catch (error) {
      results.push({ name, ok: false, error });
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function assertClose(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  test("test API is available", () => {
    assert(api, "ML_STUDIO_TEST_API was not exposed");
  });

  test("silhouette returns 0 for singleton clusters", () => {
    const distances = [
      [0, 4],
      [4, 0]
    ];
    assertClose(api.silhouetteScore(distances, [0, 1], 2), 0, 1e-12, "singleton silhouette");
  });

  test("silhouette returns 0 when there is no other populated cluster", () => {
    const distances = [
      [0, 1, 2],
      [1, 0, 1],
      [2, 1, 0]
    ];
    assertClose(api.silhouetteScore(distances, [0, 0, 0], 2), 0, 1e-12, "single populated cluster silhouette");
  });

  test("silhouette is positive for separated clusters", () => {
    const distances = [
      [0, 1, 8, 9],
      [1, 0, 7, 8],
      [8, 7, 0, 1],
      [9, 8, 1, 0]
    ];
    const score = api.silhouetteScore(distances, [0, 0, 1, 1], 2);
    assert(score > 0.75 && score <= 1, `expected strong positive silhouette, got ${score}`);
  });

  test("adjusted Rand is 1 for equivalent labelings", () => {
    const score = api.adjustedRandIndex([0, 0, 1, 1], [1, 1, 0, 0]);
    assertClose(score, 1, 1e-12, "perfect adjusted Rand");
  });

  test("stratified holdout keeps each class in the test set", () => {
    const split = api.createTrainTestSplit([0, 0, 0, 0, 1, 1, 1, 1], 0.25, true, 42);
    assert(split.test[0] === 1 && split.test[1] === 1, `unexpected test balance ${split.test.join(",")}`);
    assert(split.train[0] === 3 && split.train[1] === 3, `unexpected train balance ${split.train.join(",")}`);
  });

  test("stratified folds distribute classes across folds", () => {
    const folds = api.createKFolds([0, 0, 0, 0, 1, 1, 1, 1], 4, true, 42);
    assert(folds.testSizes.every((size) => size === 2), `unexpected fold sizes ${folds.testSizes.join(",")}`);
    assert(
      folds.testDistributions.every((dist) => dist[0] === 1 && dist[1] === 1),
      `unexpected fold distributions ${JSON.stringify(folds.testDistributions)}`
    );
  });

  const failures = results.filter((result) => !result.ok);
  output.className = failures.length ? "fail" : "pass";
  output.textContent = results
    .map((result) => {
      if (result.ok) {
        return `PASS ${result.name}`;
      }
      return `FAIL ${result.name}\n  ${result.error.message}`;
    })
    .join("\n");

  if (failures.length) {
    throw new Error(`${failures.length} test(s) failed`);
  }
})();
