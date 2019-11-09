import path from "path";

import _ from "lodash";

import { LumberjackError } from "../error";

if (!require.main) {
  throw new LumberjackError(
    "`require.main` is not defined, but it's needed to determine the <srcRoot>"
  );
}

export const RE_ROOT_PATH = RegExp(`^${path.dirname(require.main.filename)}`);
export const ROOT_PATH_SUBSTITUTE = "<srcRoot>";
export const RE_ROOT_PATH_SUBSTITUTE = RegExp(`^${ROOT_PATH_SUBSTITUTE}`);

const _isTransformedPath = (path: string): boolean => RE_ROOT_PATH_SUBSTITUTE.test(path);
const getRelativePath = (path: string): string => path.replace(RE_ROOT_PATH, ROOT_PATH_SUBSTITUTE);

export function transformModulePath(path?: undefined): undefined;
export function transformModulePath(path: string): string;

/**
 * Transform a path by removing the portion that lives outside of the src root, and replacing it with
 *  <srcRoot>.
 *
 * require.main is used to determine the source root, and when running the application via node, the
 *  src root will be the entry script. Sometimes, like when testing, require.main is a path to the
 *  module that's being tested, and you will need to accomodate for that.
 *
 * This function just assumes the path is valid, and does absolutely no validation. Failure to provide
 *  a valid path will return the same path passed in, so do your own validation.
 *
 * @param {string | undefined} path - A path any project module.
 * @returns {string | undefined} If path is undefined, undefined is returned, otherwise a transformed
 *  path
 * @example
 * transformModulePath(undefined); // => undefined
 * transformModulePath("/foo/bar/baz/src/lib"); // => "<srcRoot>/lib"
 */
export function transformModulePath(path?: string): string | undefined {
  if (!_.isUndefined(path)) {
    // TODO: does this need to check undefined? now that merging takes place, shouldn't there always be a value?
    if (_isTransformedPath(path)) {
      // The template transforms the path on creation, if messages don't contain a path, a transformed
      //  path will be passed here
      return path;
    }
    return getRelativePath(path);
  }
  return undefined;
}
