import path from "path";

import { transformModulePath, ROOT_PATH_SUBSTITUTE } from "../../../../lib/transformModulePath";

describe("transformModulePath()", () => {
  it("should exist", () => {
    expect(transformModulePath).toBeDefined();
  });

  it(`should return undefined, when given undefined`, () => {
    const result = transformModulePath();
    expect(result).toBeUndefined();
  });

  it(`should replace the project root path with ${ROOT_PATH_SUBSTITUTE}`, () => {
    // Testing this is a little awkward, it depends on require.main. require.main will provide the
    //  path to the entry script when node is loaded, but when testing, this is the path to the
    //  test file. Instead of testing whether the main script path is replaced, test that the test
    //  file path is replaced: "path/to/test/module.test.ts" becomes "<srcRoot>/module.test.ts"
    const result = transformModulePath(__filename);
    const filename = path.basename(__filename);
    const sep = path.sep;
    const subsitution = ROOT_PATH_SUBSTITUTE;

    expect(result).toBe(`${subsitution}${sep}${filename}`);
  });
});
