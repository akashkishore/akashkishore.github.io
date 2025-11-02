interface WebpackModule<T> {
  default?: T;
  [exportName: string]: unknown;
}

interface WebpackRequire {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T = unknown>(id: string): WebpackModule<T>;
  };
}

declare const require: WebpackRequire;
