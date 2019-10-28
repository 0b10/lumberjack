import path from "path";

import { Config } from "../../../../types";

export const getFakeConfigPath = (name: string): string => {
  return path.resolve(__dirname, "fixtures", name);
};
