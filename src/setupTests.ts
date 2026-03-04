// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Node environment polyfills for tests
// `undici` and some firebase node shims expect TextEncoder/TextDecoder to exist
// provide them from the Node `util` module when running Jest.
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { TextEncoder, TextDecoder } = require('util')
	// @ts-ignore - add globals for tests
	if (typeof (global as any).TextEncoder === 'undefined') (global as any).TextEncoder = TextEncoder
	if (typeof (global as any).TextDecoder === 'undefined') (global as any).TextDecoder = TextDecoder
} catch (e) {
	// ignore if not available
}

// Basic ReadableStream stub for test environment (some node-fetch/undici code expects it).
if (typeof (global as any).ReadableStream === 'undefined') {
	// minimal stub to avoid runtime ReferenceError in tests; not a full polyfill
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(global as any).ReadableStream = class {
		constructor() {}
	}
}

	// Some third-party packages ship ESM code that Jest (CRA default) doesn't transform in node_modules.
	// For our test environment we can mock the problematic @dnd-kit modules used by the UI so the
	// App-level tests don't attempt to parse ESM from node_modules.
	try {
		// jest is available in the test environment
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/dom', () => ({}))
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/react', () => ({}))
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/core', () => ({}))
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/helpers', () => ({}))
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/geometry', () => ({}))
		// also mock subpath modules that ship ESM files
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/react/sortable', () => ({}))
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/abstract', () => ({}))
		// eslint-disable-next-line no-undef
		jest.mock('@dnd-kit/dom/utilities', () => ({}))
	} catch (e) {
		// no-op in non-test runtime
	}
	try {
		// mock jspdf/html2canvas which rely on canvas in jsdom
		// eslint-disable-next-line no-undef
		jest.mock('jspdf', () => ({ jsPDF: function() { return { save: () => {} } } }))
		// eslint-disable-next-line no-undef
		jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({ toDataURL: () => '' })))
	} catch (e) {
		// ignore
	}
