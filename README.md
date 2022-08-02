# textlint-plugin-asciidoc

[Asciidoc](https://asciidoc.org/ "Asciidoc") support for [textlint](https://github.com/textlint/textlint "textlint")
using [asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js).

This is inspired by [textlint-plugin-asciidoctor](https://github.com/seikichi/textlint-plugin-asciidoctor, "textlint-plugin-asciidoctor") and appended some features;

- Typescript
- asciidoctor.js >= 2.1.0 support
- Some syntax support
  - If you find unsupported syntax, please create an issue.

## Installation

```sh
> npm install textlint-plugin-asciidoc
```

## Usage

```
{
  "plugins": [
    "asciidoc"
  ]
}
```

## File Extension

This plugin recognize these file extension as asciidoc file.

- ".adoc"
- ".asciidoc"
- ".asc"

## Tests

```sh
> npm test
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Alternatives

- [azu/textlint-plugin-asciidoc-loose](https://github.com/azu/textlint-plugin-asciidoc-loose)
- [textlint-plugin-asciidoctor](https://github.com/seikichi/textlint-plugin-asciidoctor)

## License

MIT
