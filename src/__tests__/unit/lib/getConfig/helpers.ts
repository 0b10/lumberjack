import path from "path";

export const getFakeConfigPath = (name: string) => path.resolve(__dirname, "fixtures", name);
