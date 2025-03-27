import * as AnimBaseCore from "./animbase-core.js";
import "./autoinit.js"; // tetap bekerja saat pakai <script> biasa

// Untuk IIFE dan global
if (typeof window !== "undefined") {
	window.AnimBase = window.AnimBase || {};
	Object.assign(window.AnimBase, AnimBaseCore);
}

// Untuk ESM/CommonJS
export * from "./animbase-core.js";
