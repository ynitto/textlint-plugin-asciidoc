/* eslint-disable no-unused-vars */
// LICENSE : MIT
"use strict";
import { parse, Converter } from "../src/asciidoc-to-ast";
import { test as testAST } from "@textlint/ast-tester";
import asciidoctor, { Asciidoctor } from "@asciidoctor/core";

const oc = expect.objectContaining;

test("single word", () => {
  const node = parse("text");
  const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } };
  const range = [0, 4];
  const raw = "text";
  const expected = {
    type: "Document",
    children: [
      {
        type: "Paragraph",
        children: [{ type: "Str", value: "text", loc, range, raw }],
        loc,
        range,
        raw
      }
    ],
    loc,
    range,
    raw
  };
  testAST(node);
  expect(node).toEqual(expected);
});

test("multiline", () => {
  const node = parse("text\ntext\n");
  const expected = {
    type: "Str",
    value: "text text",
    loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 4 } },
    range: [0, 9],
    raw: "text\ntext"
  };
  testAST(node);
  expect(node.children[0].children[0]).toEqual(expected);
});


test("empty", () => {
  const node = parse("");

  testAST(node);
  expect(node).toEqual({
    type: "Document",
    children: [],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 }},
    range: [0, 0],
    raw: ""
  });
});

test("admonition", () => {
  const node = parse(`\
// basic
NOTE: This is a note.

// with title
.title
TIP: This is a tip.

// block
[WARNING]
====
This is a warning.

* list
====
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a note." })
    ] }),
    oc({ type: "Paragraph", title: "title", children: [
      oc({ type: "Str", value: "This is a tip." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "This is a warning." })
      ] }),
      oc({ type: "List", children: [
        oc({ type: "ListItem", children: [
          oc({ type: "Paragraph", children: [
            oc({ type: "Str", value: "list" })
          ] })
        ] })
      ] })
    ] })
  ]);
});

test("callout list", () => {
  const node = parse(`\
[source,ruby]
----
require 'sinatra' <1>

get '/hi' do <2> <3>
  "Hello World!"
end
----
<1> Library import
<2> URL mapping
<3> Response block
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "CodeBlock", value: `require 'sinatra' (1)

get '/hi' do (2) (3)
  "Hello World!"
end` }),
    oc({ type: "List", children: [
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "Library import" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "URL mapping" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "Response block" })
        ] })
      ] })
    ] })
  ]);
});

test("check list", () => {
  const node = parse("* [*] checked\n* [ ] not checked");
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "List", children: [
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "checked" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "not checked" })
        ] })
      ] })
    ] })
  ]);
});

test("description list", () => {
  const node = parse(`\
A:: B
C:: D

<<<

First term::
  first description

Second term::
  second description
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "List", children: [
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "A" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "B" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "C" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "D" })
        ] })
      ] })
    ] }),
    oc({ type: "List", children: [
      oc({ type: "ListItem",  children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "First term" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "first description", loc: oc({
            start: oc({ line: 7 })
          }) })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "Second term" })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
            oc({ type: "Str", value: "second description", loc: oc({
              start: oc({ line: 10 })
            }) })
        ] })
      ] })
    ] })
  ]);
});

test("example", () => {
  const node = parse(`\
// basic
====
text
====

// with title
.title
====
text with title
====
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "text" })
      ] })
    ] }),
    oc({ type: "Paragraph", title: "title", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "text with title" })
      ] })
    ] })
  ]);
});

test("inline quoted", () => {
  const node = parse(`\
// emphasis
This is an _emphasis_ example.

// partial emphasis
This is a __part__ial emphasis example.

// strong
This is a *strong* example.

// partial strong
This is a **part**ial strong example.

// monospace
This is a \`monospace\` example.

// partial monospace
This is a \`\`part\`\`ial monospace example.

// mark
This is a #mark# example.

// mark with role
This is a [.small]#small mark# example.

// .superscript
This is a ^super^script example.

// .subscript
This is a ~sub~script example.

// double quote
This is a "\`double quotes\`" example.

// single quote
This is a '\`single quotes\`' example.

// apostrophe
This is an apostrophe\`'s example.

// mixed monospace bold italic
\`*_monospace bold italic phrase_*\` and le\`\`**__tt__**\`\`ers
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is an emphasis example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a partial emphasis example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a strong example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a partial strong example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a monospace example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a partial monospace example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a mark example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a small mark example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a superscript example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a subscript example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a “double quotes” example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a ‘single quotes’ example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is an apostrophe’s example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "monospace bold italic phrase and letters" })
    ] })
  ]);
});

test("literal", () => {
  const node = parse(`\
// basic
....
This is an example.
....

// with title
.title
....
This is an example with title.
....

// style syntax
[literal]
error: 1954 Forbidden search
absolutely fatal: operation lost in the dodecahedron of doom
Would you like to try again? y/n
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is an example."})
    ] }),
    oc({ type: "Paragraph", title: "title", children: [
      oc({ type: "Str", value:  "This is an example with title."})
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: `error: 1954 Forbidden search
absolutely fatal: operation lost in the dodecahedron of doom
Would you like to try again? y/n`})
    ] })
  ]);
});


test("listing", () => {
  const node = parse(`\
// basic
----
echo "This is an example."
----

// with title
.title
----
echo "This is an example with title."
----

// source
[source,ruby]
----
puts 'Hello world!'
----

// source with comment
[source,js]
----
// comment
console.log("Hello world!")
----
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "CodeBlock", value: "echo \"This is an example.\"" }),
    oc({ type: "CodeBlock", title: "title", value: "echo \"This is an example with title.\"" }),
    oc({ type: "CodeBlock", lang: "ruby", value: "puts 'Hello world!'" }),
    oc({ type: "CodeBlock", lang: "js", value: "// comment\nconsole.log(\"Hello world!\")" })
  ]);
});

test("open", () => {
  const node = parse(`\
// basic
--
This is an example.
--

// with title
.title
--
This is an example with title.
--

// abstract
[abstract]
--
This is an abstract quote block example.
--

// source
[source]
--
printf("Hello world!");
--

`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "This is an example." })
      ] })
    ] }),
    oc({ type: "Paragraph", title: "title", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "This is an example with title." })
      ] })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "This is an abstract quote block example." })
      ] })
    ] }),
    oc({ type: "CodeBlock", value: "printf(\"Hello world!\");" }),
  ]);
});

test("ordered list", () => {
  const node = parse(". text");

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "List", children: [
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "text", loc: oc({
            start: { line: 1, column: 2 }, end: { line: 1, column: 6 }
          }), range: [2, 6], raw: "text" })
        ], loc: oc({
          start: { line: 1, column: 2 }, end: { line: 1, column: 6 }
        }), range: [2, 6], raw: "text" })
      ], loc: oc({
        start: { line: 1, column: 2 }, end: { line: 1, column: 6 }
      }), range: [2, 6], raw: "" })
    ] })
  ]);
});

test("outline", () => {
  const node = parse(`\
= Document Title
:toc:

== Section 1

== Section 2

=== Section 2.1

==== Section 2.1.1

== Section 3
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Header", depth: 1, children: [
      oc({ type: "Str", value: "Document Title" })
    ] }),
    oc({ type: "Header", depth: 2, children: [
      oc({ type: "Str", value: "Section 1" })
    ] }),
    oc({ type: "Header", depth: 2, children: [
      oc({ type: "Str", value: "Section 2" })
    ] }),
    oc({ type: "Header", depth: 3, children: [
      oc({ type: "Str", value: "Section 2.1" })
    ] }),
    oc({ type: "Header", depth: 4, children: [
      oc({ type: "Str", value: "Section 2.1.1" })
    ] }),
    oc({ type: "Header", depth: 2, children: [
      oc({ type: "Str", value: "Section 3" })
    ] })
  ]);
});

test("page break", () => {
  const node = parse(`\
This is a first page.

<<<

This is a second page.
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a first page." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a second page." })
    ] }),
  ]);
});

test("paragraph", () => {
  const node = parse(`\
A
// inline comment
B

// paragraph comment
C

// with title
.title
D
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "A B" })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "C" })
    ] }),
    oc({ type: "Paragraph", title: "title", children: [
      oc({ type: "Str", value: "D" })
    ] })
  ]);
});

test("passthrough", () => {
  const node = parse(`\
// basic
++++
<p>This is an example.</p>
++++

// style syntax
[pass]
<p>This is a style syntax example.</p>

// inline
pass:[<p>This is an inline example.</p>]
`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is an example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is a style syntax example." })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is an inline example." })
    ]})
  ]);
});

test("quote", () => {
  const node = parse(`\
// basic
[quote, Monty Python and the Holy Grail]
____
Dennis: Come and see the violence inherent in the system. Help! Help! I'm being repressed!

King Arthur: Bloody peasant!

Dennis: Oh, what a giveaway! Did you hear that? Did you hear that, eh? That's what I'm on about! Did you see him repressing me? You saw him, Didn't you?
____

// paragraph
"I hold it that a little rebellion now and then is a good thing,
and as necessary in the political world as storms in the physical."
-- Thomas Jefferson, Papers of Thomas Jefferson: Volume 11

`);
  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "BlockQuote", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "Dennis: Come and see the violence inherent in the system. Help! Help! I’m being repressed!" })
      ] }),
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "King Arthur: Bloody peasant!" })
      ] }),
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "Dennis: Oh, what a giveaway! Did you hear that? Did you hear that, eh? That’s what I’m on about! Did you see him repressing me? You saw him, Didn’t you?" })
      ] })
    ] }),
    oc({ type: "BlockQuote", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "I hold it that a little rebellion now and then is a good thing, and as necessary in the political world as storms in the physical." })
      ] })
    ] })
  ]);
});

test("section", () => {
  const node = parse(`\
// basic
= Title

== Level 1 Section

Hello, world!

=== Level 2 Section's title

// floating title
[discrete]
== Discrete Heading
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Header", depth: 1, children: [
      oc({ type: "Str", value: "Title" })
    ] }),
    oc({ type: "Header", depth: 2, children: [
      oc({ type: "Str", value: "Level 1 Section" })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "Hello, world!" })
    ] }),
    oc({ type: "Header", depth: 3, children: [
      oc({ type: "Str", value: "Level 2 Section’s title" })
    ] }),
    oc({ type: "Header", depth: 2, children: [
      oc({ type: "Str", value: "Discrete Heading" })
    ] })
  ]);
});

test("sidebar", () => {
  const node = parse(`\
// basic
.title
****
Sidebars are used to visually separate auxiliary bits of content
that supplement the main text.

TIP: They can contain any type of content.

.Source code block in a sidebar
[source,js]
----
const { expect, expectCalledWith, heredoc } = require('../test/test-utils')
----
****

// style syntax
[sidebar]
Sidebars are used to visually separate auxiliary bits of content
that supplement the main text.
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "Sidebars are used to visually separate auxiliary bits of content that supplement the main text." })
      ]}),
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "They can contain any type of content." })
      ]}),
      oc({ type: "CodeBlock", lang: "js", value: "const { expect, expectCalledWith, heredoc } = require('../test/test-utils')" })
    ] }),
    oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: "Sidebars are used to visually separate auxiliary bits of content that supplement the main text." })
    ] })
  ]);
});

test("stem", () => {
  const node = parse(`\
// asciimath
:stem: asciimath
[stem]
++++
sqrt(4) = 2
++++

// latexmath
:stem: latexmath
[stem]
++++
C = \\alpha + \\beta Y^{\\gamma} + \\epsilon
++++

// with title
:stem:
[stem]
.title
++++
sqrt(4) = 2
++++

// inline
This is inline stem:[sqrt(4) = 2] example.

// inline asciimath
This is inline asciimath asciimath:[sqrt(4) = 2] example.

// inline latexmath
This is inline latexmath latexmath:[C = \\alpha + \\beta Y^{\\gamma} + \\epsilon] example.
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "CodeBlock", value: "sqrt(4) = 2" }),
    oc({ type: "CodeBlock", value: "C = \\alpha + \\beta Y^{\\gamma} + \\epsilon" }),
    oc({ type: "CodeBlock", value: "sqrt(4) = 2" }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is inline \\$sqrt(4) = 2\\$ example." })
    ]}),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is inline asciimath \\$sqrt(4) = 2\\$ example." })
    ]}),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "This is inline latexmath \\(C = \\alpha + \\beta Y^{\\gamma} + \\epsilon\\) example." })
    ]})
  ]);
});

test("table", () => {
  const node = parse(`\
// basic
.title
|===
|A|B
|C|D
|===

// with identical cell text
|===

|Haystack with needles. |needle

|Chocolate in someone's peanut butter.
|peanut
|===

// complex table
|===
a|* text
|===

// empty
|===
|===

// with header and footer
[%header%footer]
|===
|HeaderA|HeaderB

|A1
|B1

|A2
|B2
||

|FooterA|FooterB
|===
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Table", children: [
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "A" })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "B" })
        ] })
      ] }),
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "C" })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "D" })
        ] })
      ] })
    ] }),
    oc({ type: "Table", children: [
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "Haystack with needles.", loc: oc({
            start: oc({ line: 11, column: 1 }),
            end: oc({ line: 11, column: 23 })
          }) })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "needle", loc: oc({
            start: oc({ line: 11, column: 15 }),
            end: oc({ line: 11, column: 21 })
          }) })
        ] })
      ] }),
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "Chocolate in someone’s peanut butter.", loc: oc({
            start: oc({ line: 13, column: 1 }),
            end: oc({ line: 13, column: 38 })
          }) })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "peanut", loc: oc({
            start: oc({ line: 14, column: 1 }),
            end: oc({ line: 14, column: 7 })
          }) })
        ] })
      ] })
    ] }),
    oc({ type: "Table", children: [
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "List", children: [
            oc({ type: "ListItem", children: [
              oc({ type: "Paragraph", children: [
                oc({ type: "Str", value: "text" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    oc({ type: "Table", children: [
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "HeaderA" })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "HeaderB" })
        ] })
      ] }),
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "A1" })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "B1" })
        ] })
      ] }),
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "A2" })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "B2" })
        ] })
      ] }),
      oc({ type: "TableRow", children: [
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "FooterA" })
        ] }),
        oc({ type: "TableCell", children: [
          oc({ type: "Str", value: "FooterB" })
        ] })
      ] })
    ] })
  ]);
});

test("thematic break", () => {
  const node = parse(`\
A

'''

B
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "A" })
    ] }),
    oc({ type: "Paragraph", children: [
      oc({ type: "Str", value: "B" })
    ] })
  ]);
});

test("verse", () => {
  const node = parse(`\
// basic
[verse, Carl Sandburg, Fog]
____
The fog comes
on little cat feet.

It sits looking
over harbor and city
on silent haunches
and then moves on.
____

// style syntax
[verse, Carl Sandburg, two lines from the poem Fog]
The fog comes
on little cat feet.
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "BlockQuote", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: `The fog comes
on little cat feet.

It sits looking
over harbor and city
on silent haunches
and then moves on.` })
      ] })
    ] }),
    oc({ type: "BlockQuote", children: [
      oc({ type: "Paragraph", children: [
        oc({ type: "Str", value: `The fog comes
on little cat feet.` })
      ] })
    ] })
  ]);
});


test("unordered list", () => {
  const node = parse(`\
- text

<<<

* value 1
** value 2
* value 3
`);

  testAST(node);
  expect(node.children).toEqual([
    oc({ type: "List", children: [
      oc({ type: "ListItem", children: [
        oc({
          type: "Paragraph",
          children: [oc({
            type: "Str",
            value: "text",
            loc: oc({ start: { line: 1, column: 2 }, end: { line: 1, column: 6 } }),
            range: [2, 6],
            raw: "text"
          })],
          loc: oc({ start: { line: 1, column: 2 }, end: { line: 1, column: 6 } }),
          range: [2, 6],
          raw: "text"
        })
      ], loc: oc({ start: { line: 1, column: 2 }, end: { line: 1, column: 6 } }), range: [2, 6], raw: "" })
    ] }),
    oc({ type: "List", children: [
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "value 1", range: [15, 22] })
        ] }),
        oc({ type: "List", children: [
          oc({ type: "ListItem", children: [
            oc({ type: "Paragraph", children: [
              oc({ type: "Str", value: "value 2", range: [26, 33] })
            ] })
          ] })
        ] })
      ] }),
      oc({ type: "ListItem", children: [
        oc({ type: "Paragraph", children: [
          oc({ type: "Str", value: "value 3", range: [36, 43] })
        ] })
      ] })
    ] })
  ]);
});

test("invalid admonition", () => {
  const doc = asciidoctor().load("[WARNING]\n====\nThis is a warning.\n====");
  const paragraph = doc.getBlocks()[0] as Asciidoctor.Block;

  const converter = new Converter("");
  let node = converter.convertParagraph(paragraph, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid description list", () => {
  const doc = asciidoctor().load("A:: B");
  const list = doc.getBlocks()[0] as Asciidoctor.AbstractBlock;

  const converter = new Converter("");
  let node = converter.convertDescriptionList(list, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid header", () => {
  const doc = asciidoctor().load("= Title");
  const header = doc.getHeader() as any as Asciidoctor.Section;

  const converter = new Converter("");
  let node = converter.convertHeader(header, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid list", () => {
  const doc = asciidoctor().load(". list1");
  const list = doc.getBlocks()[0] as Asciidoctor.List;

  const converter = new Converter("");
  let node = converter.convertList(list, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid listing", () => {
  const doc = asciidoctor().load("----\necho \"This is an example.\"\n----");
  const listing = doc.getBlocks()[0] as Asciidoctor.Block;

  const converter = new Converter("");
  let node = converter.convertListing(listing, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid quote", () => {
  const doc = asciidoctor().load("[quote]\n____\ntest\n____\n\"test\"\n-- test");
  const block = doc.getBlocks()[0] as Asciidoctor.Block;
  const paragraph = doc.getBlocks()[1] as Asciidoctor.Block;

  const converter = new Converter("");
  let node = converter.convertQuote(block, { min: 0, max: 0 });
  expect(node).toEqual([]);

  node = converter.convertQuote(paragraph, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid section", () => {
  const doc = asciidoctor().load("= Title\n\n== Level 1 Section");
  const section = doc.getBlocks()[0] as Asciidoctor.Section;

  const converter = new Converter("");
  let node = converter.convertSection(section, { min: 0, max: 0 });
  expect(node).toEqual([]);
});

test("invalid table", () => {
  const doc = asciidoctor().load("|===\n|A|B\n|===");
  const table = doc.getBlocks()[0] as Asciidoctor.Table;
  const row = table.getBodyRows()[0];
  const cell = row[0];

  const converter = new Converter("");
  let node = converter.convertTable(table, { min: 0, max: 0 });
  expect(node).toEqual([]);

  node = converter.convertTableRow(row, { min: 0, max: 0 });
  expect(node).toEqual([]);

  node = converter.convertTableCell(cell, { min: 0, max: 0 });
  expect(node).toEqual([]);
});