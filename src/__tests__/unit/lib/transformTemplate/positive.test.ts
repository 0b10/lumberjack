import path from "path";

import { ROOT_PATH_SUBSTITUTE } from "../../../../lib/transformModulePath";
import { validTemplateValues } from "../../../helpers";
import { transformTemplate } from "../../../../lib/transformTemplate";

describe("transformTemplate()", () => {
  it("should exist", () => {
    expect(transformTemplate).toBeDefined();
  });

  it("should not mutate the passed in arg", () => {
    const template = validTemplateValues({ modulePath: __filename });
    expect(transformTemplate(template)).not.toBe(template);
  });

  it("should transform modulePath", () => {
    const substitution = ROOT_PATH_SUBSTITUTE;
    const filename = path.basename(__filename);
    const transformedModulePath = `${substitution}${path.sep}${filename}`;
    const template = validTemplateValues({ modulePath: __filename });

    expect(transformTemplate(template)).toMatchObject({ modulePath: transformedModulePath });
  });
});
