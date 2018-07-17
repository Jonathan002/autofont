# Autofont

## About / Purpose

It is a cli watcher that will automatically convert all font files of your specified folder to @font-face data which all gets placed in a single `autofont.scss` file. (The `autofont.scss` will also be created inside your specifed folder - there is no output option at the time of writing this).

## Usage

Note: If you have autofont already installed globally, uninstall it first before installing again to make sure the dependencies install correctly.

#### 1. Install via npm:

```
npm install autofont -g
```

#### 2. Run the Autofont Binary and add a input path to the directory containing your fonts. 

Note: 
- The font directory must be flat and can't have font files nested within other directories.
- It will ignore all files that do not have the following in their file name string (e.g `'font_filename.ttf'.match(/(ttf|woff|woff2|eot|otf|svg)$/)`) through a regex match.

```
autofont /path/to/my/font/files
```

#### 3. Expect a `autofont.scss` to be available in the chosen directory.

`/path/to/my/font/files/autofont.scss` <---



### Advance Usage
- You can specify watch mode with `-w`
```
autofont /path/to/my/font/files -w
```

- Font files get placed in 2 categories withing the autofont.scss

**Fixme:** Not all font files have the full @font-face metadata available.
- If a font file does not have the full metadata available, it will appear in a section called `Fixme` in the autofont.scss with default chosen values to accomodate.
- You are however free to edit the values in the `Fixme` section and your edits will be saved if the file parses as valid scss. If not it will be rejected and revert back to the scss file before the manual edits. An extra file called autofont-rejected will still remain with the most recent manual edits if you wish to collect them. (If not on wacher mode after saving, you must run the `autofont` command to make sure save changes persist).

**Autofont** If a font file is successfully Autofonted, it will appear here as it had found sufficient metadata. Although it should be noted that the `@font-face` `font-style` cannot be naturally autofonted and will always default to normal. Just like the **Fixme** category (read above to see saving process), you are free to overwrite the `font-style` property here and save your changes.

- You can view what properties you can edit in the scss file through the `--help` command.

```
autofont --help
```

## Possible Trouble Shooting
If you have some of these dependencies listed below already installed, and don't want to use the needed required version of autofont, you may need to use node 6 or lower. (I can't get to specific on this but this package currently globally installing this works with me now on node v10.6.0, however **as a project you need to be on node v6** before you can clone this repository and do `npm i`)

- fontnik
- node-pre-gyp
- @mapbox/cloudfriend

---

### Support Me

If you appreciate this package and feel like being nice, you can support me on [Patreon](https://www.patreon.com/bePatron?c=1376218&rid=2627828). The support helps me maintain projects like this, as well as improve the my dev-documentation website [Summary Docs](https://www.summarydocs.com).

---


## License

Copyright 2018 Jonathan Woolbright Fernandez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




