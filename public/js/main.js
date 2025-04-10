const loadIcon = (container, icon) => {
	fetch(`https://agusmade.github.io/animbase/public/images/icons/${icon}.svg`)
		.then(response => response.text())
		.then(svgData => {
			container.innerHTML = svgData;
		});
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

const sty = `.container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: absolute;
}
@media (max-width: 480px) {
.container {overflow:hidden;}
}
.place {
	cursor: pointer;
	position:relative;
	width:100%;
	height:100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.place,
.place * {
	perspective: 1200px;
	transform-style: preserve-3d;
}
.box {
	width: 80%;
	min-width:300px;
	max-width:800px;
	height: 80%;
	position: relative;
	border-radius: 8px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
	transform: rotateX(45deg) rotateY(-20deg) translateZ(-300px) translateY(-300px) translateX(-100px);
	display: flex;
	justify-content: center;
	align-items: center;
}
.cover {
	width: 50%;
	height: 100%;
	top: 0;
	transform-origin: left center;
}
.paper,
.tape {
	background: #d6ae82;
	position: absolute;
	box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.2);
	overflow: hidden;
	border: 1.1px solid #0002;
}
.cover-l {
	left: 0;
}
.cover-r {
	right: 0;
	transform-origin: right center;
}
.paper-s,
.paper-n {
	left: 0;
	width: 100%;
	height: 40px;
}
.paper-s {
	bottom: 0;
	transform-origin: bottom center;
	transform: rotateX(90deg);
}
.paper-n {
	top: 0;
	transform-origin: top center;
	transform: rotateX(-90deg);
}
.paper-w,
.paper-e {
	top: 0;
	width: 40px;
	height: 100%;
	box-shadow: inset 0 0 75px rgba(0, 0, 0, 0.23);
}
.paper-e {
	right: 0;
	transform-origin: center right;
	transform: rotateY(-90deg);
}
.paper-w {
	left: 0;
	transform-origin: center left;
	transform: rotateY(90deg);
}
.paper-bg {
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	transform: translateZ(-40px);
	box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
}
.card {
	background-color: white;
	padding: 2px 10px;
	transform: translateZ(-40px);
	color: #111;
}
.tape {
	top: 0;
	width: 40px;
	background-color: #fff6;
	height: 100%;
}
h3{font-family: "Winky Sans", system-ui, sans-serif;}`;

const createBox = (section, els, wrapper) => {
	const container = D.ce('div', {class: 'container'});
	const box = D.ce('div', {class: 'box'});
	const place = D.ce('div', {class: 'place'});
	D.ac(container, D.ac(place, box));
	['bg', 's', 'n', 'e', 'w'].forEach(k => D.ac(box, D.ce('div', {class: `paper paper-${k}`})));
	const cardShadow = D.ce('div', {
		style: 'background-color:#000d; position:absolute;transform:translateZ(-40px);filter:blur(5px);',
	});
	D.ac(box, cardShadow);
	['paper card', 'cover paper cover-l', 'cover paper cover-r', 'tape'].forEach(k => D.ac(box, D.ce('div', {class: k})));
	const card = container.querySelector('.card');
	els.forEach(el => {
		D.ac(card, el);
	});
	// D.ac(section, container);

	const style = D.ce('style', {}, sty);
	const content = D.ce('div', {
		class: 'content',
		style: 'position:absolute; width:100%; height:100%;left:0;top:0;',
	});
	if (wrapper) D.ac(document.querySelector(wrapper), content);
	else D.ac(document.body, content);
	const shadowRoot = content.attachShadow({mode: 'open'}); // Membuat shadow root
	D.ac(shadowRoot, container, style);

	let state = 'close';

	const animator = AnimBase.createTimedAnimator('box', {
		speed: 250,
		autostart: false,
		once: true,
		max: 500,
	});
	animator.addElement(box, {
		init: {
			transform: 'rotateX(45deg) rotateY(-20deg) translateZ(-300px) translateY(-300px) translateX(-100px)',
		},
		config: {
			300: {},
			500: {
				transform:
					'rotateX(0deg.inOutSine) rotateY(0deg.inOutSine) translateZ(0px.inOutSine) translateY(0px.inOutSine) translateX(0px.inOutSine)',
			},
		},
	});
	animator.addElement(card, {
		init: {transform: 'translateZ(-40px)'},
		config: {200: {}, 400: {transform: 'translateZ(-10px.inOut)'}},
	});
	animator.addElement(cardShadow, {
		init: {filter: 'blur(5px)'},
		config: {200: {}, 400: {filter: 'blur(30px.inOut)'}},
	});
	animator.addElement(container.querySelector('.cover-l'), {
		init: {transform: 'rotateY(0deg)'},
		config: {100: {}, 300: {transform: 'rotateY(-180deg.inExpo)'}},
	});
	animator.addElement(container.querySelector('.cover-r'), {
		init: {transform: 'rotateY(0deg)'},
		config: {100: {}, 300: {transform: 'rotateY(180deg.inExpo)'}},
	});
	animator.addElement(container.querySelector('.tape'), {
		init: {height: '100%'},
		config: {100: {height: '0%.inQuad'}},
	});
	function boxOpen() {
		if (['open', 'opening'].includes(state)) return;
		let from = 0;
		if (state === 'closing') {
			from = AnimBase.getAnimator('box').getTimelineValue();
			AnimBase.pause('box');
		}
		state = 'opening';
		AnimBase.play('box', {
			from,
			to: 500,
			onFinish: () => (state = 'open'),
		});
	}
	function boxClose() {
		if (['close', 'closing'].includes(state)) return;
		let from = 500;
		if (state === 'opening') {
			from = AnimBase.getAnimator('box').getTimelineValue();
			AnimBase.pause('box');
		}
		state = 'closing';
		AnimBase.play('box', {
			from,
			to: 0,
			onFinish: () => (state = 'close'),
		});
	}
	container.querySelector('.place').addEventListener('click', () => {
		console.log('onClick');
		if (isOpen) boxClose();
		else boxOpen();
	});
	cardShadow.style.width = `${card.offsetWidth}px`;
	cardShadow.style.height = `${card.offsetHeight}px`;

	window.addEventListener('scroll', () => {
		if (window.scrollY > section.offsetTop + section.offsetHeight * 0.5 - window.innerHeight * 0.5) boxOpen();
		else if (window.scrollY < section.offsetTop + section.offsetHeight * 1 - window.innerHeight * 0.8) boxClose();
	});
	onResize = () => {
		content.style.top = `${section.offsetTop}px`;
		content.style.height = `${section.offsetHeight}px`;
		cardShadow.style.width = `${card.offsetWidth}px`;
		cardShadow.style.height = `${card.offsetHeight}px`;
	};
	onResize();
	window.addEventListener('resize', onResize);
	place.addEventListener('click', () => {
		if (state === 'close') boxOpen();
		else if (state === 'open') boxClose();
	});
};
function opemMenu() {
	if (!document.body.classList.contains('menu-visible')) document.body.classList.add('menu-visible');
}
function closeMenu() {
	if (document.body.classList.contains('menu-visible')) document.body.classList.remove('menu-visible');
}

window.addEventListener('load', () => {
	document.querySelectorAll('[data-icon]').forEach(el => {
		loadIcon(el, el.dataset.icon);
	});
	const menuButton = document.querySelector('.menu-button');
	document.addEventListener('click', function (event) {
		if (menuButton.contains(event.target)) opemMenu();
		else closeMenu();
	});

	createBox(
		document.querySelector('section.features'),
		document.querySelectorAll('section.features>*:not(a[name])'),
		'.wrapper'
	);
	AnimBase.setHooks('intro', {
		onFinish: () => {
			const main = document.querySelector('main');
			const footer = document.querySelector('footer');
			main.style.display = 'block';
			footer.style.display = 'block';
		},
	});
	hljs.highlightAll();
});
