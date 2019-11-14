export declare const isValidConfig: (configFile: unknown) => configFile is Partial<{
    logger: unknown;
    consoleMode?: boolean | undefined;
    shouldValidate?: boolean | undefined;
    validateForNodeEnv?: Set<string> | undefined;
}>;
