interface Vars {
    [key: string]: unknown;
}
export declare class LumberjackError extends Error {
    constructor(message: string, vars?: Vars);
}
export declare class LumberjackMockError extends Error {
    constructor(message: string);
}
export {};
