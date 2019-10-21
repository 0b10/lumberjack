/* eslint-disable import/no-default-export */
import { PathLike } from "fs";
import path from "path";

import { CONFIG_FILE_NAME } from "../constants";
import { LumberjackMockError } from "../error";

export class MockFs {
  pathExistsPredicate: PathExistsPredicate | Throws;
  isDirectoryPredicate: PathExistsPredicate | Throws;

  constructor() {
    this.existsSync = this.existsSync.bind(this);
    this.__setMock_existsSync = this.__setMock_existsSync.bind(this);

    this.lstatSync = this.lstatSync.bind(this);
    this.__setMock_lstatSync = this.__setMock_lstatSync.bind(this);

    this.__setMock_findConfigAt = this.__setMock_findConfigAt.bind(this);
    this.__setMock_reset = this.__setMock_reset.bind(this);

    this.pathExistsPredicate = this.__pathExistsPredicateThrows;
    this.isDirectoryPredicate = this.__isDirectoryPredicateThrows;
  }

  __pathExistsPredicateThrows(): never {
    throw new LumberjackMockError("You need to initialise the pathExistsPredicate before using it");
  }

  __isDirectoryPredicateThrows(): never {
    throw new LumberjackMockError(
      "You need to initialise the isDirectoryPredicate before using it"
    );
  }

  __setMock_reset(): void {
    this.pathExistsPredicate = this.__pathExistsPredicateThrows;
    this.isDirectoryPredicate = this.__isDirectoryPredicateThrows;
  }

  __setMock_existsSync(predicate: PathExistsPredicate): void {
    this.pathExistsPredicate = predicate;
  }

  existsSync(path: PathLike): boolean {
    return this.pathExistsPredicate(path);
  }

  __setMock_lstatSync(predicate: PathExistsPredicate): void {
    this.isDirectoryPredicate = predicate;
  }

  lstatSync(path: PathLike): { isDirectory: () => boolean } {
    return { isDirectory: (): boolean => this.isDirectoryPredicate(path) };
  }

  __setMock_findConfigAt(dirPath: PathLike): void {
    const filePath = path.resolve(dirPath as string, CONFIG_FILE_NAME);
    this.__setMock_existsSync((p) => p === filePath);
    this.__setMock_lstatSync((p) => p !== filePath); // only target isn't a dir
  }
}

const fs = new MockFs();

export default fs;

type PathExistsPredicate = (path: PathLike) => boolean;
type Throws = () => never;
