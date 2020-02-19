var fs = require('fs');
var { execSync } = require('child_process');
var ensure = moduleName => {
	var folders = ['.', '..'].map(e => `${e}/node_modules/${moduleName}`);
	if (!folders.some(fs.existsSync)) {
		console.log(`Module ${moduleName} not installed. Installing...`);
		try {
			execSync(`npm install ${moduleName}`);
		} catch (e) {
			console.log(`Failed. Run 'npm install ${moduleName}' and try again`);
			process.exit(1);
		}
	}
	return require(moduleName);
};
var util = require('util');
var slm = ensure('slm');

var escape = html => html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

var lineReplace = line =>
	line.replace(/`(.*?)`/g, '<code>$1</code>')
		// [github:user/repo]
		.replace(/\[github:([^\]]*?)\]/g, '[$1](https://github.com/$1)')
		// [text](url)
		.replace(/\[([^\]]+)\]\((\S+?)\)/g, '<a href="$2">$1</a>')


var features = {
	list: ({ indent, lines }) => indent + 'ul\n' + lines.filter(e => e.trim()).map(
		line => indent + '  li.action ' + lineReplace(line).trimLeft()
	).join('\n'),

	example: ({ indent, lines }) => {
		var lang = (lines[0].match(/^\s*\[lang:(\w+)\]\s*$/) || [])[1];
		if (lang) {
			lines = lines.slice(1);
		}
		var firstLine = indent + 'pre.highlight' + (lang ? '.' + lang : '') + '\n';
		return firstLine + indent + '  |\n' + lines.map(
			line => '  ' + escape(line)
		).join('\n');
	}
};
var featureKeys = Object.keys(features).map(e => e + ':');

var render = lecture => {
	var slidesMeta = [];
	var start = 0;
	var slides = lecture.split('\n= slide ').filter(e => e).map((e, i) => {
		var lines = e.trimRight().split('\n');
		var titles = (lines.shift().replace(/do\w*$/, '').match(/'(?:\\.|[^\\'])*'/g) || []).map(e => e.slice(1, -1));

		slidesMeta.push({
			id: i + 2,
			titles,
			start,
			end: (start += lines.length + 1)
		});

		var text = '';

		var feature;
		lines.forEach((line, i) => {
			var indent = line.match(/^\s*/g)[0];
			if (feature) {
				if (line.trim() && indent.length <= feature.indent.length) {
					text += features[feature.name](feature);
					feature = null;
				} else {
					feature.lines.push(line);
				}
			} else {
				if (featureKeys.includes(line.trim())) {
					feature = {
						name: line.trim().slice(0, -1),
						lines: [],
						indent
					};
				} else {
					text += line + '\n';
				}
			}
		});
		if (feature) {
			text += features[feature.name](feature);
		}
		return `section\n` + titles.map(e => `  h1 ${escape(e)}\n`).join('') + text; //lines.join('\n');
	});
	return slides.map((slide, i) => {
		try {
			return slm.render(slide);
		} catch (e) {
			onError(e, slidesMeta[i]);
		}
	}).join('\n');
};

var error;
function onError(e, meta) {
	console.log(`\nError on slide ${meta.id} (#${meta.start} - #${meta.end}) - ${meta.titles[0] || ''}`);
	var message;
	if (e.message == 'Invalid left-hand side in assignment') {
		message = 'ParseError: Unescaped = or ==';
	} else {
		message = e.stack.replace(/evalmachine.*\n/, '').replace(/\s*at createScript.*/s, '');
		message = message.split('\n').map(e => '    ' + e).join('\n');
	}
	console.error(message);
	error = e;
};

function modernMain(filename, title) {
	var promisedRead = util.promisify(fs.readFile);
	var read = filename => promisedRead(`./lectures/${filename}`, { encoding: 'utf8' });
	var write = util.promisify(fs.writeFile);

	Promise.all([read('layout.slim'), read(`${filename}.slim`)]).then(([layout, lecture]) => {
		var actualHTML = render(lecture);
		if (error) return Promise.reject();

		var wholeHTML = slm.render(layout, { slides_html: actualHTML, title: title || filename });

		return write(`./html/${filename}.html`, wholeHTML);
	}).then(
		() => console.log(`\n Done: html/${filename}.html`),
		err => err && console.log('\n ' + (err && err.message))
	);
}

function oldMain(filename, title) {
	var layout = fs.readFileSync('./lectures/layout.slim', { encoding: 'utf8' });
	var actual = fs.readFileSync(`./lectures/${filename}.slim`, { encoding: 'utf8' });

	var actualHTML = render(actual);
	if (!error) {
		var wholeHTML = slm.render(layout, { slides_html: actualHTML, title: title || filename });

		fs.writeFileSync(`./html/${filename}.html`, wholeHTML);

		console.log(`\n Done: html/${filename}.html`);
	}
}

if (require.main === module) {
	var [filename, title] = process.argv.slice(2);
	if (!filename) {
		console.log('Example usage: node presentations.js INTRO');
	} else if (util.promisify) {
		modernMain(filename, title);
	} else {
		oldMain(filename, title);
	}
}