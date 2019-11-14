import { fixture } from "sir-helpalot";

import { shouldValidate, ForTestingConfig } from "../../../../lib/config";
import { getNewFakeConfig } from "../../../helpers";

interface GetFixtureArgs {
  forTesting: ForTestingConfig;
}

const _getFixture = fixture<GetFixtureArgs>({ forTesting: { fakeConfig: getNewFakeConfig() } });

describe("smoke", () => {
  it("should exist", () => {
    expect(shouldValidate).toBeDefined();
  });
});

describe("shouldValidate", () => {
  it("should return false when shouldValidate option is false", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({
            overrides: { shouldValidate: false },
            exclude: ["validateForNodeEnv"],
          }),
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(false);
  });

  it("should return false when shouldValidate option is undefined", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({ exclude: ["shouldValidate", "validateForNodeEnv"] }),
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(false);
  });

  it("should return true when shouldValidate option is true (and validateForNodeEnv is undefined)", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({
            overrides: { shouldValidate: true },
            exclude: ["validateForNodeEnv"],
          }),
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(true);
  });
});

describe("validateForNodeEnv, and shouldValidate=true", () => {
  it("should return false when the node env doesn't match", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({
            overrides: {
              shouldValidate: true,
              validateForNodeEnv: new Set(["fake-env"]),
            },
          }),
          nodeEnv: "fake-unmatching-env",
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(false);
  });

  it("should return false when the node env is undefined, and it's not validating for a production env", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({
            overrides: {
              shouldValidate: true,
              validateForNodeEnv: new Set(["a-fake-env"]),
            },
          }),
          nodeEnv: undefined,
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(false);
  });

  it("should return true when the node env is undefined, and it's IS validating for a production env", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({
            overrides: {
              shouldValidate: true,
              validateForNodeEnv: new Set(["production"]),
            },
          }),
          nodeEnv: undefined,
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(true);
  });

  it("should return true when the node env matches", () => {
    const { forTesting } = _getFixture({
      overrides: {
        forTesting: {
          fakeConfig: getNewFakeConfig({
            overrides: {
              shouldValidate: true,
              validateForNodeEnv: new Set(["fake-matching-env"]),
            },
          }),
          nodeEnv: "fake-matching-env",
        },
      },
    });
    expect(shouldValidate(forTesting)).toBe(true);
  });

  it("should match against any value in the set", () => {
    const nodeEnvs = ["a", "b", "c"];

    for (let nodeEnv of nodeEnvs) {
      const { forTesting } = _getFixture({
        overrides: {
          forTesting: {
            fakeConfig: getNewFakeConfig({
              overrides: {
                shouldValidate: true,
                validateForNodeEnv: new Set(nodeEnvs),
              },
            }),
            nodeEnv, // it's set here
          },
        },
      });
      expect(shouldValidate(forTesting)).toBe(true);
    }
  });
});
