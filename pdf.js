var fs = require('fs');
var { exec, execSync, execFile } = require('child_process');
var isWindows = process.platform == 'win32';
var commandExists = !isWindows ? require('command-exists').sync : name => {
	name = !/[^A-Za-z0-9_\/:=-]/.test(name) ? name : `'${name.replace(/'/g, "'\\''")}'`.replace(/^(?:'')+/g, '').replace(/\\'''/g, "\\'");
	try {
		var stdout = execSync('where ' + name, { stdio: [] });
		return !!stdout;
	} catch (error) {
		return false;
	}
};
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
var webkitGlobal = commandExists('wkhtmltopdf');
var webkitLocal = ['wkhtmltopdf/bin', 'wkhtmltox/bin'].find(fs.existsSync);

var chromePath;

var print = {
	webkit: (input, output, cb) => {
		var wkhtmltopdf = ensure('wkhtmltopdf');
		wkhtmltopdf.command = (webkitLocal ? `${__dirname}/${webkitLocal}/` : '') + 'wkhtmltopdf';
		wkhtmltopdf(input, {
			output: output,
			printMediaType: true,
			disableSmartShrinking: true,
			orientation: 'landscape',
			marginTop: 0,
			marginRight: 0,
			marginBottom: 0,
			marginLeft: 0
		}, cb);
	},
	chrome: (input, output, cb) => {
		if (!chromePath) {
			chromePath = isWindows ? findChromeWindows() : ensure('chrome-finder')();
		}
		execFile(chromePath, ['--headless', '--disable-gpu', '--print-to-pdf=' + output,  input], cb);
	},
	engine: webkitGlobal || webkitLocal ? 'webkit' : 'chrome',
	silent: false,
	default: (input, output, cb) => {
		console.log('Printing - ' + input + ' using ' + print.engine);
		print[print.engine](input, output, (err, stdout, stderr) => {
			console.log(err || ('Printed - ' + output));
			if (stderr && !print.silent) {
				console.log(stderr);
			}
			cb && cb(err);
		});
	}
};

function findChromeWindows() {
	var suffixes = [
		'\\Google\\Chrome SxS\\Application\\chrome.exe',
		'\\Google\\Chrome\\Application\\chrome.exe',
		'\\chrome-win32\\chrome.exe',
		'\\Chromium\\Application\\chrome.exe'
	];
	var prefixes = ['LOCALAPPDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)'].map(e => process.env[e]).filter(Boolean);
	var paths = prefixes.map(p => suffixes.map(s => p + s)).reduce((a, b) => a.concat(b));
	return paths.find(fs.existsSync);
}

if (require.main === module) {
	if (!webkitGlobal && !webkitLocal) {
		console.log('For better pdfs (with page tags) - install wkhtmltopdf in either wkhtmlto(x|pdf) folder - https://wkhtmltopdf.org/downloads.html');
	}

	var local = `file:///${__dirname}/html/`;
	var online = 'https://iliasky.com/www/presentations/';

	var destination = 'html/pdf/';

	if (!fs.existsSync(destination)){
		console.log('Creating destination folder - ' + destination);
		fs.mkdirSync(destination);
		console.log('Destination folder created.');
	}

	var name = process.argv[process.argv[2] == '--local' ? 3 : 2];
	var location = process.argv[2] == '--local' ? local : online;
	var input = location + name + '.html';
	var output = __dirname + '/' + destination + name + '.pdf';
	var cb = function(err, stdout, stderr) {};

	if (name) {
		// print.default(input, output, cb);

		['-light', '-dark'].forEach((mode, i) => {
			var filename = output.replace('.pdf', mode + '.pdf');
			print.default(input + '?dark=' + i, filename, cb);
		});
	} else {
		console.log('Lecture name not specified.');
		console.log('Example usage "node pdf.js CSS-1"');
	}
}