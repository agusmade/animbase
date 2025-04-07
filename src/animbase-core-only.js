// animbase-core-only.js

import * as Core from "./animbase-core.js";

if (typeof window !== "undefined") {
	window.AnimBase = window.AnimBase || {};
	Object.assign(window.AnimBase, Core);
}

export * from "./animbase-core.js";
