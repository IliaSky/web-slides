# web-slides
Web based presentations for a WWW Technologies course in Sofia Univerisity. [iliasky.com/www/presentations/](https://iliasky.com/www/presentations/)

Presentation contents are in Bulgarian. 

Project also features an installable PWA and pdf generation for each presentation in both light/dark mode.

## Requirements

- node 6+ (preferred 8+)
- [optional] [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html)

## Usage

1. Create or update a `lectures/MY_FILE.slim`
2. Run `node presentations MY_FILE` and you will get `html/MY_FILE.html`
3. Run
- `node pdf MY_FILE` to generate a pdf from the live version (`iliasky.com/www/presentations/MY_FILE.html`)
- `node pdf --local MY_FILE` to generate a pdf from the local html file

Note - both the presentations/pdf files can be used as standalone executables without the rest of the project.

## Wkhtmltopdf

The pdf command supports 2 types of printing - wkhtmltopdf and chrome.

Printing with wkhtmltopdf has some extra features like the resulting pdf getting a "navigation" with the titles and pages as bookmarks. There could also be some other minor differences between the two.

That's why it's recommended to download wkhtmltopdf from [here](https://wkhtmltopdf.org/downloads.html).

You should either
- install it as a global executable (add it to path after installation)
- install it in this project's `wkhtmltopdf` or `wkhtmltox` (executable should be in `wkhtmlto(x|pdf)/bin`)

## Slim syntax + extras

Basic slim syntax can be observed [here](http://slim-lang.com). Slim is a templating engine for ruby with very similar syntax to node's [Jade](http://jade-lang.com)/[Pug.js](https://pugjs.org)

### Extras

```
list:                      |      | ul
  one                      |  =>  |   li.action one
  two [name](url)          |      |   li.action two <a href="url">name</a>
  three [github:user/repo] |      |   li.action three <a href="https://github.com/user/repo">user/repo</a>
```

```
example:          |      | pre.highlight.php
  [lang:php]      |  =>  |   | highlighted code
  <?php //... ?>  |      |     (with pygments.css)
```

## Ruby implementation

Historically these presentations have been generated using Ruby (`1.9.3-p448`) - initially coming from a [Ruby course](http://fmi.ruby.bg). 

However since 
- that version is outdated
- we don't teach Ruby
- Node.js is often used for FE web development

the logic has been rewritten in JS. The ruby logic still remains in a folder in this repo, but is not really supported and used. Usage instructions for that implementation can be found in the `ruby` folder's README.md.

## Archive

Past slides contents can be found in `lectures/1[3-8]` folders. Generation for those would simply be `node presentations 13/01-introduction` etc. Note however that there's no guarantee that those would still work correctly (as images/styles/js have changed over the years).