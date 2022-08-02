/* eslint-disable no-unused-vars */
// LICENSE : MIT
"use strict";

import fs from "fs";
import path from "path";
import { parse } from "../src/asciidoc-to-ast";

const fixturesDir = path.join(__dirname, "snapshot_fixtures");

describe("Snapshot testing", () => {
  fs.readdirSync(fixturesDir).map((caseName: string) => {
    const normalizedTestName = caseName.replace(/-/g, " ");
    test(`Test Snapshot:${normalizedTestName}`, function() {
      const fixtureFileName = path.join(fixturesDir, caseName);
      const actualContent = fs.readFileSync(fixtureFileName, "utf-8");
      const actual = parse(actualContent);
      expect(actual).toMatchSnapshot();
    });
  });
});
