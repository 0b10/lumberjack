"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const error_1 = require("../error");
if (!require.main) {
    throw new error_1.LumberjackError("`require.main` is not defined, but it's needed to determine the <srcRoot>");
}
exports.RE_ROOT_PATH = RegExp(`^${path_1.default.dirname(require.main.filename)}`);
exports.ROOT_PATH_SUBSTITUTE = "<srcRoot>";
exports.RE_ROOT_PATH_SUBSTITUTE = RegExp(`^${exports.ROOT_PATH_SUBSTITUTE}`);
const _isTransformedPath = (path) => exports.RE_ROOT_PATH_SUBSTITUTE.test(path);
const getRelativePath = (path) => path.replace(exports.RE_ROOT_PATH, exports.ROOT_PATH_SUBSTITUTE);
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
function transformModulePath(path) {
    if (!lodash_1.default.isUndefined(path)) {
        // TODO: does this need to check undefined? now that merging takes place, shouldn't there always be a value?
        if (_isTransformedPath(path)) {
            // The template transforms the path on creation, if messages don't contain a path, a transformed
            //  path will be passed here
            return path;
        }
        // when validation id disabled, path might be any value, an tranforming a non-string is a bad idea
        return lodash_1.default.isString(path) ? getRelativePath(path) : undefined;
    }
    return undefined;
}
exports.transformModulePath = transformModulePath;
