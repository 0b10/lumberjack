import _ from "lodash";

import { logger } from "../../../index";

import { LOG_LEVELS as LOGGER_KEYS } from "./../../../constants";

describe("logger", () => {
  it("should exist", () => {
    expect(logger).toBeDefined();
  });

  it("should be initialised with the default config file", () => {
    const theLogger = logger;
    expect(_.isPlainObject(theLogger)).toBe(true);
    expect(Object.keys(theLogger)).toMatchObject(LOGGER_KEYS);
  });
});
