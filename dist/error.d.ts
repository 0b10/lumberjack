import { ErrorValues } from "sir-helpalot";
export declare class LumberjackError extends Error {
    constructor(message: string, vars?: ErrorValues);
}
export declare class LumberjackMockError extends Error {
    constructor(message: string, vars?: ErrorValues);
}
export declare class LumberjackValidationError extends Error {
    constructor(message: string, vars?: ErrorValues);
}
export declare class LumberjackConfigValidationError extends Error {
    constructor(message: string, vars?: ErrorValues);
}
export declare class LumberjackConfigError extends Error {
    constructor(message: string, vars?: ErrorValues);
}
