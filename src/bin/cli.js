#!/usr/bin/env node

/* eslint-disable no-console, import/no-commonjs, security/detect-non-literal-fs-filename */
const fs = require("fs");
const path = require("path");

const VALID_LOGGERS = new Set(["pino", "stub"]);
const CONFIG_FILE_NAME = "lumberjack.config.js";

const _isValidLogger = (logger) => {
  const valid = VALID_LOGGERS.has(logger);
  if (valid) {
    return true;
  }
  console.error(`ERROR: Invalid logger target: ${logger}`);
  process.exit(1);
  throw new Error("The process didn't exit after an invalid logger error"); // keeps eslint quiet
};

const help = `
lumberjack init logger-name dir

Options:
  --init, -init, init, -i       Create a config file
  --help, -help, help, -h       Show this help menu

Supported loggers:
  pino
  stub                          Console loggers. Generally a good option for customising your own
                                config
`;

const _printHelp = () => {
  console.log(help);
};

const _should = (target) => {
  switch (target) {
    case "init":
      return process.argv.some((arg) => /^(--init|-init|init|-i)$/.test(arg));
    case "help":
      return process.argv.some((arg) => /^(--help|-help|help|-h)$/.test(arg));
    default:
      throw new Error(`Invalid _should target: ${target}`);
  }
};

const _isDirectory = (target) => {
  if (fs.existsSync(target)) {
    return fs.statSync(target).isDirectory();
  }
  return false;
};

const _getOutDir = () => {
  const outDir = [...process.argv].pop();
  if (!_isDirectory(outDir)) {
    console.error(`ERROR: The target directory doesn't exist: ${outDir}`);
    process.exit(1);
  }
  return outDir;
};
const _getLogger = () => {
  const index = process.argv.length - 2;
  const logger = process.argv[index]; // eslint-disable-line security/detect-object-injection
  if (_isValidLogger(logger)) {
    return logger;
  }
  throw new Error("Validation for logger failed to throw when it is invalid");
};

const _getInFile = (loggerType) => path.resolve(__dirname, "configs", `${loggerType}.js`);

const _getOutFile = (outDir) => {
  const dst = path.resolve(outDir, CONFIG_FILE_NAME);
  if (fs.existsSync(dst)) {
    console.error(`ERROR: A file already exists at: ${dst}`);
    process.exit(1);
  }
  return dst;
};

const _cloneConfig = (src, dst, loggerType) => {
  const writeStream = fs.createWriteStream(dst, { autoClose: true });
  writeStream.on("error", () => {
    console.error(`ERROR: Unable to create a config file at: ${dst}`);
    process.exit(1);
  });
  writeStream.on("close", () => {
    console.log(`Created a ${loggerType} config at: ${dst}`);
    process.exit(1);
  });

  const readStream = fs.createReadStream(src, { autoClose: true }).pipe(writeStream);
  readStream.on("error", () => {
    console.error(`ERROR: Unable to open the template config at: ${src}`);
    process.exit(1);
  });
};

const _validateArgs = () => {
  const args = process.argv;
  if (args.length !== 5) {
    console.error("ERROR: Invalid number of args");
    _printHelp();
  }
};

const _init = () => {
  _validateArgs();
  const outDir = _getOutDir();
  const loggerType = _getLogger();
  const inFile = _getInFile(loggerType);
  const outFile = _getOutFile(outDir);
  _cloneConfig(inFile, outFile, loggerType);
};

if (_should("init")) {
  _init();
} else if (_should("help")) {
  _printHelp();
} else {
  console.error("ERROR: You provided an invalid directive, must be init or help");
  _printHelp();
}
