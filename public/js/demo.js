(function () {
	function toShareableURL(data) {
		const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
		return `https://agusmade.github.io/animbase/playground/#code=${compressed}`;
	}

	function ambilHTMLNodeTanpaEscape(node) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			let tagPembuka = `<${node.tagName.toLowerCase()}`;
			let atributString = '';
			for (let i = 0; i < node.attributes.length; i++) {
				const atribut = node.attributes[i];
				atributString += ` ${atribut.name}='${atribut.value}'`;
			}
			tagPembuka += atributString + '>';
			let innerHTMLContent = '';
			for (let i = 0; i < node.childNodes.length; i++) {
				innerHTMLContent += ambilHTMLNodeTanpaEscape(node.childNodes[i]);
			}
			const tagPenutup = `</${node.tagName.toLowerCase()}>`;
			return tagPembuka + innerHTMLContent + tagPenutup;
		} else if (node.nodeType === Node.TEXT_NODE) {
			return node.nodeValue;
		} else if (node.nodeType === Node.COMMENT_NODE) {
			return ``;
		}
		return '';
	}

	let button;
	function onClick() {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('mode') === 'og') return;
		const css = document.head.querySelector('style')?.innerText || '';
		const bodyElements = Array.from(document.body.childNodes);
		const jsE = bodyElements.find(e => e.tagName === 'SCRIPT');
		const js = jsE ? jsE.innerText : '';
		const html = bodyElements
			.filter(e => e.tagName !== 'SCRIPT' && e !== button)
			.map(e => ambilHTMLNodeTanpaEscape(e))
			.join('');
		const title = document.title;
		const desc = document.head.querySelector('[name=description]');
		const description = desc ? desc.getAttribute('content') : undefined;
		window.open(toShareableURL({html, css, js, title, description}), '_top');
	}

	function showButton() {
		button = document.createElement('a');
		// button.setAttribute('href', toShareableURL({html, css, js, title, description}));
		button.setAttribute(
			'style',
			'display:block;position:fixed;right:20px;top:20px;padding:5px 10px;text-decoration:none;color:#fff;background:#0005;border-radius:4px;z-index:1000;cursor:pointer;'
		);
		button.innerHTML = '✏️ Edit in Playground';
		document.body.appendChild(button);
		button.onclick = onClick;
	}
	window.addEventListener('load', () => {
		showButton();
	});
})();
