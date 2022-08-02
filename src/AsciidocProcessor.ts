/* eslint-disable no-unused-vars */
// LICENSE : MIT
"use strict";
import { parse } from "./asciidoc-to-ast";
import type { TextlintPluginOptions } from "@textlint/types";

export class AsciidocProcessor {
  config: TextlintPluginOptions;
  extensions: Array<string>;

  constructor(config = {}) {
      this.config = config;
      this.extensions = this.config.extensions ? this.config.extensions : [];
  }

  availableExtensions() {
    return [".adoc", ".asciidoc", ".asc"].concat(this.extensions);
  }

  processor(_ext: string) {
    return {
      preProcess(text: string, _filePath?: string) {
        return parse(text);
      },
      postProcess(messages: any[], filePath?: string) {
        return {
          messages,
          filePath: filePath ? filePath : "<asciidoc>"
        };
      }
    };
  }
}
