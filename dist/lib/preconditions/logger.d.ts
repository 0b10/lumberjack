export declare const validateLoggerShape: (logger: object) => void;
export declare const validateLoggerHasFunctions: (logger: object) => void;
export declare const validateLoggerInterface: (logger: unknown) => logger is import("../../types").LogLevels<import("../../types").LoggerFunc>;
