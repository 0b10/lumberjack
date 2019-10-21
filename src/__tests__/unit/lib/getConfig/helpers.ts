import path from "path";

export const getFakeConfigPath = (name: string): string => {
  return path.resolve(__dirname, "fixtures", name);
};
