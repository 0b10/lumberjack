import path from "path";

import { ROOT_PATH_SUBSTITUTE } from "../../../../lib/transformModulePath";
import { validTemplateValues, validMergedMessageValues } from "../../../helpers";
import { transformObjectModulePath } from "../../../../lib/transformObjectModulePath";

describe("transformObjectModulePath()", () => {
  it("should exist", () => {
    expect(transformObjectModulePath).toBeDefined();
  });

  it("should not mutate the passed in arg", () => {
    const template = validTemplateValues({ modulePath: __filename });
    expect(transformObjectModulePath(template)).not.toBe(template);
  });

  it("should transform modulePath given a template object", () => {
    const substitution = ROOT_PATH_SUBSTITUTE;
    const filename = path.basename(__filename);
    const transformedModulePath = `${substitution}${path.sep}${filename}`;
    const template = validTemplateValues({ modulePath: __filename });

    expect(transformObjectModulePath(template)).toMatchObject({
      modulePath: transformedModulePath,
    });
  });

  it("should transform modulePath given a messages object", () => {
    const substitution = ROOT_PATH_SUBSTITUTE;
    const filename = path.basename(__filename);
    const transformedModulePath = `${substitution}${path.sep}${filename}`;
    // modulePath needs to be defined, this is only true after merging, and validation
    const messages = validMergedMessageValues({ modulePath: __filename });

    expect(transformObjectModulePath(messages)).toMatchObject({
      modulePath: transformedModulePath,
    });
  });
});
