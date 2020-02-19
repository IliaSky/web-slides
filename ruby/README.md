## Генериране на уеб презентации с Руби

Този подпроект трансформира презентации от [slim](http://slim-lang.com/) към html. Файлова структура:
- ruby - кода извършващ трансформацията
- lectures
  - my-lecture.slim - текст на лекция
  - index.yml - кратко описание на презентациите
- html - папка с финалните презентации

## Инсталация

- [Инсталирайте Ruby 1.9.3-p448](https://www.ruby-lang.org/en/downloads/)
- `gem install bundler`
- `bundle install`

Забележка: всички команди се изпълняват от ruby папката, а не горната директория.

## Генериране на лекции

- `bundle exec thor rebuild` - генерира всички

- `bundle exec thor lecture 3` - генерира само номер 3 от `index.yml`

## Слушане за промени и autorefresh

- `bundle exec thor watch`
- Слуша за промени на файловете в папката `lectures/`. При промяна на `.slim` лекция автоматично прегенерира html версията и я отваря наново в браузъра.

## Допълнения към slim

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

## Оригинална идея от курс по руби

Оригиналната идея и руби код идват от [курса "Програмиране с Ruby"](http://fmi.ruby.bg) във ФМИ, СУ.

Оригиналното repo използваше python и pygments за syntax highlight, но цялостната инсталация на всичко беше излишно сложна - затова вече всичко се прави на руби.

Алтернативно има и упростен javascript вариант за още по-лесно използване.