import {
  getFakeConfig,
  makeLoggerWithMocks,
  minimalMessages,
  minimalTemplate,
  stringify,
} from "../../helpers";
import { lumberjackTemplate } from "../../../index";

describe("id", () => {
  it(`should be the same value for all logs (within a single logger call)`, () => {
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = minimalTemplate({ overrides: { modulePath: __filename } });
    const messages = minimalMessages({
      overrides: { error: new Error("arbitrary error message"), args: { foo: "foo" } },
    });
    const log = lumberjackTemplate(template, { logger: mockLogger, fakeConfig });

    log(messages);
    const retrievedId = mockLogger.info.mock.calls[0][0].id;
    const failureMessage = stringify({
      id: retrievedId,
      mockLogger,
      fakeConfig,
      template,
      messages,
    });

    // be defensive
    expect(typeof retrievedId, failureMessage).toBe("string");
    expect(retrievedId, failureMessage).toMatch(/^\d+$/);
    // test the loggers - exluding info, because it's the source
    for (let targetFunc of ["trace", "error"]) {
      expect(mockLogger[targetFunc].mock.calls[0], failureMessage).toHaveLength(1); // defensive
      expect(mockLogger[targetFunc].mock.calls[0][0].id, failureMessage).toBe(retrievedId);
    }
  });
});
