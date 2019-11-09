import _ from "lodash";

import { transformModulePath } from "./transformModulePath";

export const transformObjectModulePath = <T extends { modulePath: string }>(obj: T): T => {
  const clone = _.cloneDeep(obj);
  clone.modulePath = transformModulePath(clone.modulePath);
  return clone;
};
