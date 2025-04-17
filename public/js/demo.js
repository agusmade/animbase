function toShareableURL({html = '', css = '', js = ''} = {}) {
	const data = {html, css, js};
	const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
	return `https://agusmade.github.io/animbase/playground/#code=${compressed}`;
}

window.addEventListener('load', () => {
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('mode') === 'og') return;
	const beautify = (fn, code) => (typeof fn === 'function' ? fn(code) : code);
	const css = beautify(window.css_beautify, document.head.querySelector('style')?.innerText || '');
	const bodyElements = Array.from(document.body.childNodes);
	const jsE = bodyElements.find(e => e.tagName === 'SCRIPT');
	const js = jsE ? beautify(window.js_beautify, jsE.innerText) : '';
	const html = beautify(
		window.html_beautify,
		bodyElements
			.filter(e => e.tagName !== 'SCRIPT')
			.map(e => e.outerHTML || e.contentText || '')
			.join('')
	);
	const button = document.createElement('a');
	button.setAttribute('href', toShareableURL({html, css, js}));
	button.setAttribute(
		'style',
		'display:block;position:fixed;right:20px;top:20px;padding:5px 10px;text-decoration:none;color:#fff;background:#0005;border-radius:4px;z-index:1000;'
	);
	button.innerHTML = '✏️ Edit in Playground';
	document.body.appendChild(button);
});
