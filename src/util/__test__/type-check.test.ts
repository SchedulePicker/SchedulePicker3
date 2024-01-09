import {
    isButtonElement,
    isInputElement,
    isString,
    isTextareaElement,
    isIframeElement,
    isSelectElement,
    isDivElement,
} from '../type-check';

const buttonEl = document.createElement('button');
const textareaEl = document.createElement('textarea');
const inputEl = document.createElement('input');
const selectEl = document.createElement('select');
const iframeEl = document.createElement('iframe');
const divEl = document.createElement('div');

describe('isButtonElement', () => {
    test('Button element', () => {
        expect(isButtonElement(buttonEl)).toBe(true);
    });

    test('Not Button element', () => {
        expect(isButtonElement(inputEl)).toBe(false);
        expect(isButtonElement(null)).toBe(false);
    });
});

describe('isInputElement', () => {
    test('Input element', () => {
        expect(isInputElement(inputEl)).toBe(true);
    });

    test('Not Input element', () => {
        expect(isInputElement(buttonEl)).toBe(false);
        expect(isInputElement(null)).toBe(false);
    });
});

describe('isSelectElement', () => {
    test('Select element', () => {
        expect(isSelectElement(selectEl)).toBe(true);
    });

    test('Not Select element', () => {
        expect(isSelectElement(inputEl)).toBe(false);
        expect(isSelectElement(null)).toBe(false);
    });
});

describe('isTextareaElement', () => {
    test('Textarea element', () => {
        expect(isTextareaElement(textareaEl)).toBe(true);
    });

    test('Not Textarea element', () => {
        expect(isTextareaElement(inputEl)).toBe(false);
        expect(isTextareaElement(null)).toBe(false);
    });
});

describe('isIframeElement', () => {
    test('Iframe element', () => {
        expect(isIframeElement(iframeEl)).toBe(true);
    });

    test('Not Iframe element', () => {
        expect(isIframeElement(inputEl)).toBe(false);
        expect(isIframeElement(null)).toBe(false);
    });
});

describe('isDivElement', () => {
    test('Div element', () => {
        expect(isDivElement(divEl)).toBe(true);
    });

    test('Not Div element', () => {
        expect(isDivElement(buttonEl)).toBe(false);
        expect(isDivElement(null)).toBe(false);
    });
});

describe('isString', () => {
    test.each([
        [undefined, false],
        [null, false],
        [1, false],
        [NaN, false], // eslint-disable-line unicorn/prefer-number-properties
        ['', true],
        ['a', true],
        [true, false],
        [Symbol('a'), false],
        [() => {}, false], // eslint-disable-line @typescript-eslint/no-empty-function
        [{ key: 'value' }, false],
        [['1'], false],
        [new Date(), false],
    ])('isString', (value, expected) => {
        expect(isString(value)).toBe(expected);
    });
});
