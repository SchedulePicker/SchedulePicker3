export const isButtonElement = (target: Element | null): target is HTMLButtonElement => target?.tagName === 'BUTTON';

export const isInputElement = (target: Element | null): target is HTMLInputElement => target?.tagName === 'INPUT';

export const isSelectElement = (target: Element | null): target is HTMLSelectElement => target?.tagName === 'SELECT';

export const isTextareaElement = (target: Element | null): target is HTMLTextAreaElement =>
    target?.tagName === 'TEXTAREA';

export const isIframeElement = (target: Element | null): target is HTMLIFrameElement => target?.tagName === 'IFRAME';

export const isDivElement = (target: Element | null): target is HTMLDivElement => target?.tagName === 'DIV';

export const isString = (value: unknown): value is string => typeof value === 'string';
