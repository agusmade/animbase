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
		.then(response => response.text())
		.then(svgData => {
			container.innerHTML = svgData;
		})
		.catch(e => console.error(e));
};

const htmlEditorEl = document.getElementById('html-editor');
const jsEditorEl = document.getElementById('js-editor');
const cssEditorEl = document.getElementById('css-editor');

const cfg = {
	lineNumbers: true,
	tabSize: 4,
	theme: 'darcula',
};

const htmlEditor = CodeMirror(htmlEditorEl, {...cfg, value: defaultHtml, mode: 'htmlmixed'});

const jsEditor = CodeMirror(jsEditorEl, {...cfg, value: '', mode: 'javascript'});

const cssEditor = CodeMirror(cssEditorEl, {...cfg, value: defaultCss, mode: 'css'});

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

const toInline = js => (js ? '<' + 'script' + '>' + js + '</' + 'script' + '>' : '');

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
	window.localStorage.setItem('playground-storage', JSON.stringify({js, css, html}));
}

function loadLocalstorage() {
	const ls = window.localStorage.getItem('playground-storage');
	if (!ls) return;
	const {js, css, html} = JSON.parse(ls);
	jsEditor.setValue(js);
	cssEditor.setValue(css);
	htmlEditor.setValue(html);
}

// share
function toShareableURL({html = '', css = '', js = ''} = {}) {
	const data = {html, css, js};
	const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
	return `https://agusmade.github.io/animbase/playground/#code=${compressed}`;
}

function getShareableUrl() {
	return toShareableURL({html: htmlEditor.getValue(), css: cssEditor.getValue(), js: jsEditor.getValue()});
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
		htmlEditor.setValue(data.html || '');
		cssEditor.setValue(data.css || '');
		jsEditor.setValue(data.js || '');
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

function updatePreview(toDownload) {
	const js = jsEditor.getValue();
	const jsPart = toDownload ? toInline(js) : toInline(errorHandler) + toInline(js);
	const css = cssEditor.getValue();
	const cssPart = css ? '<' + 'style' + '>' + css + '</' + 'style' + '>' : '';
	const head = `<head>${cssPart}\n${scripts.map(s => '<script src="' + s + '"><' + '/script' + '>').join('')}</head>`;
	const content = `<html lang="en">${head}<body>${htmlEditor.getValue()}${jsPart}</body></html>`;
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
