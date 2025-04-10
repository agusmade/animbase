const loadIcon = (container, icon) => {
	fetch(`https://agusmade.github.io/animbase/public/images/icons/${icon}.svg`)
		.then(response => response.text())
		.then(svgData => {
			container.innerHTML = svgData;
		})
		.catch(e => console.error(e));
};

const D = {
	ce: (t, o = {}, s = '') => {
		const e = document.createElement(t);
		for (let [k, v] of Object.entries(o)) e.setAttribute(k, v);
		!!s && (e.innerHTML = s);
		return e;
	},
	ac: (p, ...e) => {
		for (let el of e) p.appendChild(el);
		return p;
	},
};

function opemMenu() {
	if (!document.body.classList.contains('menu-visible')) document.body.classList.add('menu-visible');
}
function closeMenu() {
	if (document.body.classList.contains('menu-visible')) document.body.classList.remove('menu-visible');
}

window.addEventListener('load', () => {
	const menuButton = document.querySelector('.menu-button');
	document.addEventListener('click', function (event) {
		if (menuButton.contains(event.target)) opemMenu();
		else closeMenu();
	});
	document.querySelectorAll('[data-icon]').forEach(el => {
		loadIcon(el, el.dataset.icon);
	});
});
