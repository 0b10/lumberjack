"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const transformModulePath_1 = require("./transformModulePath");
exports.transformObjectModulePath = (obj) => {
    const clone = lodash_1.default.cloneDeep(obj);
    clone.modulePath = transformModulePath_1.transformModulePath(clone.modulePath);
    return clone;
};
