import { EXTENDED_LOG_LEVELS } from "./constants";
import assert from "assert";

import { FactoryArgs, LogLevelsMap } from "./types";

const logLevelMapPrecondition = (map: LogLevelsMap) => {
  // This is necessary because the mapping will depend on object[key] syntax, potentially opening a vuln
  Object.values(map).forEach((customLevel) =>
    assert(
      EXTENDED_LOG_LEVELS.includes(customLevel),
      `Unknown log level mapping target passed to lumberjackFactory: "${customLevel}"`
    )
  );
};

export const lumberjackFactory = (args: FactoryArgs) => {
  if (args.logLevelMap) {
    logLevelMapPrecondition(args.logLevelMap);
  }
};

export * from "./types";
