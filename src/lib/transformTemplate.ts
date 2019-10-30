import _ from "lodash";

import { Template } from "../types";

import { transformModulePath } from "./transformModulePath";

export const transformTemplate = (template: Pick<Template, "modulePath">): Template => {
  const clonedTemplate = _.cloneDeep(template);
  clonedTemplate.modulePath = transformModulePath(clonedTemplate.modulePath);
  return clonedTemplate;
};
