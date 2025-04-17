let dragOverlay = null;

class Resizer {
	constructor(element, position = 'w', cb) {
		this.position = position;
		this.element = element;
		const parent = element.parentElement;
		this.gap = parseInt(window.getComputedStyle(parent).gap || '0');
		this.cb = cb;
		const spliter = document.createElement('div');
		spliter.classList.add('splitter');
		spliter.classList.add('splitter-' + this.position);
		this.horz = ['w', 'e'].includes(this.position);
		parent.appendChild(spliter);
		this.spliter = spliter;
		this.update();
		let to;
		this.prevSize = this.horz ? element.offsetWidth / parent.offsetWidth : element.offsetHeight / parent.offsetHeight;
		window.addEventListener('resize', () => {
			clearTimeout(to);
			to = setTimeout(() => this.resize(), 200);
		});
		let startDrag = null;
		document.addEventListener('mousedown', e => {
			if (!spliter.contains(e.target)) return;
			dragOverlay.classList.add('active');
			dragOverlay.style.cursor = this.horz ? 'col-resize' : 'row-resize';
			startDrag = {
				x: e.clientX + window.scrollX,
				y: e.clientY + window.scrollY,
				size: this.horz ? element.offsetWidth : element.offsetHeight,
			};
		});
		document.addEventListener('mouseup', e => {
			if (!!startDrag) {
				startDrag = null;
				dragOverlay.classList.remove('active');
				cb && cb();
			}
		});
		document.addEventListener('mousemove', e => {
			if (!startDrag) return;
			const dx = e.clientX + window.scrollX - startDrag.x;
			const dy = e.clientY + window.scrollY - startDrag.y;
			if (position === 'w') element.style.width = `${startDrag.size - dx}px`;
			else if (position === 'e') element.style.width = `${startDrag.size + dx}px`;
			else if (position === 'n') element.style.height = `${startDrag.size - dy}px`;
			else if (position === 's') element.style.height = `${startDrag.size + dy}px`;
			this.prevSize = this.horz
				? element.offsetWidth / parent.offsetWidth
				: element.offsetHeight / parent.offsetHeight;
			this.update();
		});
		this.toPx();
	}

	toPx() {
		const e = this.element;
		const w = e.offsetWidth;
		const h = e.offsetHeight;
		if (this.horz) e.style.width = `${w}px`;
		else e.style.height = `${h}px`;
	}
	resize() {
		if (this.prevSize) {
			if (this.horz) this.element.style.width = `${this.element.parentElement.offsetWidth * this.prevSize}px`;
			else if (!this.horz) this.element.style.height = `${this.element.parentElement.offsetHeight * this.prevSize}px`;
		}
		this.update();
		this.cb();
	}
	update() {
		const e = this.element;
		if (this.position === 'w') this.spliter.style.left = `${e.offsetLeft - this.gap}px`;
		else if (this.position === 'e') this.spliter.style.left = `${e.offsetLeft + e.offsetWidth}px`;
		else if (this.position === 'n') this.spliter.style.top = `${e.offsetTop - this.gap}px`;
		else if (this.position === 's') this.spliter.style.top = `${e.offsetTop + e.offsetHeight}px`;
	}
}

window.addEventListener('load', () => {
	dragOverlay = document.createElement('div');
	dragOverlay.classList.add('drag-overlay');
	document.body.appendChild(dragOverlay);
	const sty = document.createElement('style');
	document.body.appendChild(sty);
	sty.innerText = `.drag-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index: 9999;pointer-events: none;}.drag-overlay.active {pointer-events: all;}`;
});
