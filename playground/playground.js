let userConfig = {
	title: 'My AnimBase Animation Demo',
	description: '',
	scripts: [],
	styles: [],
};

const defaultHtml = `<div
    data-anim-trigger-group="demo"
	data-anim-init='{"opacity":"0","transform":"translateX(-50%) translateY(calc(-50% - 200px))"}'
	data-anim-config='{
		"100":{"opacity":"1.out","transform":"translateX(-150%.inSine) translateY(calc(-50% - 0px.outBounce))"},
		"200":{"opacity":"0.in","transform":"translateX(-50%.out) translateY(calc(-50% - 200px.spring))"}
	}'
	class="text"
>
	Hello AnimBase!
</div>
<div data-anim-trigger-group="demo" data-anim-trigger-config='{"autostart":true, "speed":60, "max": 200}'></div>`;

const defaultCss = `.text{
  position:absolute;
  left:50%;
  top:50%;
  transform:translateX(-50%) translateY(calc(-50% - 200px));
  opacity:1;
}`;

const loadIcon = (container, icon) => {
	fetch(`https://agusmade.github.io/animbase/public/images/icons/${icon}.svg`)
		.then(async response => {
			if (response.status === 200) return response.text();
		})
		.then(svgData => {
			svgData && (container.innerHTML = svgData || '');
		})
		.catch(e => {
			console.error(e);
		});
};

const htmlEditorEl = document.getElementById('html-editor');
const jsEditorEl = document.getElementById('js-editor');
const cssEditorEl = document.getElementById('css-editor');

const cfg = {
	lineNumbers: true,
	tabSize: 4,
	theme: 'darcula',
};

const beautifyOption = {
	indent_size: '4',
	indent_char: '\t',
	max_preserve_newlines: '5',
	preserve_newlines: true,
	keep_array_indentation: false,
	break_chained_methods: false,
	indent_scripts: 'normal',
	brace_style: 'collapse',
	space_before_conditional: true,
	unescape_strings: false,
	jslint_happy: true,
	end_with_newline: false,
	wrap_line_length: '0',
	indent_inner_html: false,
	comma_first: false,
	e4x: false,
	indent_empty_lines: false,
};

const htmlEditor = CodeMirror(htmlEditorEl, {...cfg, value: defaultHtml, mode: 'htmlmixed'});
htmlEditor.addKeyMap({
	'Ctrl-B': function (cm) {
		if (html_beautify) cm.setValue(html_beautify(cm.getValue(), beautifyOption));
	},
});
const jsEditor = CodeMirror(jsEditorEl, {...cfg, value: '', mode: 'javascript'});
jsEditor.addKeyMap({
	'Ctrl-B': function (cm) {
		if (js_beautify) cm.setValue(js_beautify(cm.getValue(), beautifyOption));
	},
});

const cssEditor = CodeMirror(cssEditorEl, {...cfg, value: defaultCss, mode: 'css'});
cssEditor.addKeyMap({
	'Ctrl-B': function (cm) {
		if (css_beautify) cm.setValue(css_beautify(cm.getValue(), beautifyOption));
	},
});

const iframe = document.getElementById('preview');
const scripts = ['https://cdn.jsdelivr.net/npm/animbase@1.1.2/dist/animbase.iife.min.js'];

const errorHandler = [
	`window.onerror=function(message,source,lineno,colno, error) {`,
	`parent.postMessage({type: 'error', message, source, lineno, colno, stack: error?.stack}, '*');`,
	`};`,
	`console.error = (function(orig) {`,
	`return function(...args) {`,
	`parent.postMessage({type: 'error', message: args.join(' ')}, '*');`,
	`return orig.apply(console, args);`,
	`};`,
	`})(console.error);`,
].join('');

// log
const logPanel = document.getElementById('log-panel');
window.addEventListener('message', e => {
	if (e.data?.type === 'error') {
		const {message, lineno, colno, source, stack} = e.data;
		const line = document.createElement('div');
		line.textContent = `[Error] ${message} ${lineno ? `at ${source}:${lineno}:${colno}` : ''}`;
		if (stack) {
			const pre = document.createElement('pre');
			pre.textContent = stack;
			line.appendChild(pre);
		}
		logPanel.appendChild(line);
	}
});

// local storage
function saveLocalstorage() {
	const js = jsEditor.getValue();
	const css = cssEditor.getValue();
	const html = htmlEditor.getValue();
	window.localStorage.setItem('playground-storage', JSON.stringify({js, css, html, ...userConfig}));
}

function loadLocalstorage() {
	const ls = window.localStorage.getItem('playground-storage');
	if (!ls) return;
	const {js, css, html, title, description, scripts, styles} = JSON.parse(ls);
	jsEditor.setValue(js);
	cssEditor.setValue(css);
	htmlEditor.setValue(html);
	userConfig.title = title || '';
	userConfig.description = description || '';
	userConfig.scripts = scripts || [];
	userConfig.styles = styles || [];
}

// share
function toShareableURL({html = '', css = '', js = '', title = '', description = '', scripts = [], styles = []} = {}) {
	const data = {html, css, js, title, description, scripts, styles};
	const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
	return `https://agusmade.github.io/animbase/playground/#code=${compressed}`;
}

function getShareableUrl() {
	return toShareableURL({html: htmlEditor.getValue(), css: cssEditor.getValue(), js: jsEditor.getValue(), ...userConfig});
}

function codeInUrl() {
	const hash = location.hash.slice(1);
	if (!hash.startsWith('code=')) return false;
	return true;
}

function loadFromURL() {
	const hash = location.hash.slice(1);
	if (!hash.startsWith('code=')) return;
	try {
		const compressed = hash.slice(5);
		const json = LZString.decompressFromEncodedURIComponent(compressed);
		const data = JSON.parse(json);
		const {html, css, js, title = '', description = '', scripts = [], styles = []} = data || {};
		htmlEditor.setValue(html_beautify(html || '', beautifyOption));
		cssEditor.setValue(css_beautify(css || '', beautifyOption));
		jsEditor.setValue(js_beautify(js || '', beautifyOption));
		userConfig = {...userConfig, title, description, scripts, styles};
		updatePreview();
	} catch (e) {
		console.error('Failed to load from URL:', e);
	}
}

function showMessage(text) {
	const msg = document.getElementById('share-message');
	msg.textContent = text;
	msg.classList.add('show');
	setTimeout(() => {
		msg.classList.remove('show');
	}, 1000);
}

function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		showMessage('🔗 URL copied to clipboard!');
	});
}

function share() {
	const url = getShareableUrl();
	copyToClipboard(url);
}

// download
function downloadHTML() {
	const blob = new Blob([updatePreview(true)], {type: 'text/html'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'animbase-playground.html';
	a.click();
	URL.revokeObjectURL(url);
}

function save() {
	const js = jsEditor.getValue();
	const css = cssEditor.getValue();
	const html = htmlEditor.getValue();
	const blob = new Blob(
		[JSON5.stringify({title: userConfig.title, description: userConfig.description, html, css, js}, null, '\t')],
		{type: 'application/json5'}
	);
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'animbase-playground.json5';
	a.click();
	URL.revokeObjectURL(url);
}

function openFile() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json5,application/json5,application/json';

	input.addEventListener('change', async () => {
		const file = input.files?.[0];
		if (!file) return;

		const text = await file.text();
		let data;
		try {
			data = JSON5.parse(text);
		} catch (err) {
			alert('❌ Failed to parse file: ' + err.message);
			return;
		}
		userConfig.title = data.title || '';
		userConfig.description = data.description || '';
		htmlEditor.setValue(data.html || '');
		cssEditor.setValue(data.css || '');
		jsEditor.setValue(data.js || '');
		updatePreview();
	});

	input.click();
}

// codepen
function exportToCodepen() {
	const data = {
		title: 'AnimBase Demo',
		html: htmlEditor.getValue(),
		css: cssEditor.getValue(),
		js: jsEditor.getValue(),
		js_external: 'https://cdn.jsdelivr.net/npm/animbase@1.1.2/dist/animbase.iife.min.js',
	};

	const form = document.createElement('form');
	form.action = 'https://codepen.io/pen/define';
	form.method = 'POST';
	form.target = '_blank';

	const input = document.createElement('input');
	input.type = 'hidden';
	input.name = 'data';
	input.value = JSON.stringify(data);

	form.appendChild(input);
	document.body.appendChild(form);
	form.submit();
	form.remove();
}

// config
function openConfig() {
	document.getElementById('page-title').value = userConfig.title || '';
	document.getElementById('page-description').value = userConfig.description || '';
	document.getElementById('external-scripts').value = (userConfig.scripts || []).join(', ');
	document.getElementById('external-css').value = (userConfig.styles || []).join(', ');
	document.getElementById('config-dialog').showModal();
}

function applyConfig() {
	const title = document.getElementById('page-title').value.trim();
	const description = document.getElementById('page-description').value.trim();
	const scripts = document
		.getElementById('external-scripts')
		.value.split(',')
		.map(s => s.trim())
		.filter(Boolean);
	const styles = document
		.getElementById('external-css')
		.value.split(',')
		.map(s => s.trim())
		.filter(Boolean);

	userConfig = {title, description, scripts, styles};
	document.getElementById('config-dialog').close();
	updatePreview();
}

const toInline = js => (js ? '<' + 'script' + '>' + js + '</' + 'script' + '>' : '');

function updatePreview(toDownload) {
	const js = jsEditor.getValue();
	const css = cssEditor.getValue();
	const html = htmlEditor.getValue();

	if (!toDownload) logPanel.innerHTML = '';
	const title = userConfig.title ? `<title>${userConfig.title}</title>` : '';
	const meta = userConfig.description ? `<meta name="description" content="${userConfig.description}">` : '';

	const externalScripts = (userConfig.scripts || []).map(url => `<script src="${url}"></script>`).join('\n');
	const externalStyles = (userConfig.styles || []).map(url => `<link rel="stylesheet" href="${url}">`).join('\n');

	const jsPart = js
		? toDownload
			? `<script>${js}</script>`
			: `<script>${errorHandler}\n${js}</script>`
		: !toDownload
			? `<script>${errorHandler}</script>`
			: '';
	const cssPart = css ? `<style>${css}</style>` : '';

	const head = `<head>${title}\n${meta}\n${cssPart}\n${externalStyles}\n${scripts
		.map(s => `<script src="${s}"></script>`)
		.join('\n')}\n${externalScripts}</head>`;

	const content = `<!doctype html><html lang="en">${head}<body>${html}\n${jsPart}</body></html>`;
	if (toDownload) return content;
	iframe.srcdoc = content;
}

function onResize() {
	htmlEditor.refresh();
	cssEditor.refresh();
	jsEditor.refresh();
}

let _to;
function onChange() {
	clearTimeout(_to);
	_to = setTimeout(() => {
		saveLocalstorage();
		updatePreview();
	}, 200);
}

htmlEditor.on('change', onChange);
cssEditor.on('change', onChange);
jsEditor.on('change', onChange);

updatePreview();

if (codeInUrl()) loadFromURL();
else loadLocalstorage();

new Resizer(document.querySelector('.editor-place'), 'e', onResize);
new Resizer(cssEditorEl.parentElement, 's', onResize);
new Resizer(jsEditorEl.parentElement, 'n', onResize);

window.addEventListener('load', () => {
	document.querySelectorAll('[data-icon]').forEach(el => {
		loadIcon(el, el.dataset.icon);
	});
});
