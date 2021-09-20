import browser from 'webextension-polyfill';

type Syntax = 'html' | 'markdown';

type ContextMenuDisplayed = {
    today: boolean;
    tomorrow: boolean;
    yesterday: boolean;
    nextBusinessDay: boolean;
    previousBusinessDay: boolean;
    specifiedDay: boolean;
    template: boolean;
    syntax: boolean;
};

type StorageInitValue = {
    SYNTAX: Syntax;
    CONTEXT_MENU_DISPLAYED: ContextMenuDisplayed;
    TEMPLATE_TEXT: string;
};

const STORAGE_KEY = {
    SYNTAX: 'syntax',
    CONTEXT_MENU_DISPLAYED: 'contextMenuDisplayed',
    TEMPLATE_TEXT: 'templateText',
} as const;

const STORAGE_INIT_VALUE: StorageInitValue = {
    SYNTAX: 'html',
    CONTEXT_MENU_DISPLAYED: {
        today: true,
        tomorrow: false,
        yesterday: false,
        nextBusinessDay: false,
        previousBusinessDay: false,
        specifiedDay: false,
        template: false,
        syntax: true,
    },
    TEMPLATE_TEXT: '', // TODO: 利用者が理解しやすい初期値を考える
};

export const setSyntax = async (syntax: Syntax) => {
    await browser.storage.sync.set({ [STORAGE_KEY.SYNTAX]: syntax });
};

export const getSyntax = async (): Promise<Syntax> => {
    const item = await browser.storage.sync.get(STORAGE_KEY.SYNTAX);

    if (Object.keys(item).length === 0) {
        return STORAGE_INIT_VALUE.SYNTAX;
    }

    return item[STORAGE_KEY.SYNTAX] as Syntax;
};

export const setContextMenuDisplayed = async (displayed: ContextMenuDisplayed) => {
    await browser.storage.sync.set({ [STORAGE_KEY.CONTEXT_MENU_DISPLAYED]: displayed });
};

export const getContextMenuDisplayed = async (): Promise<ContextMenuDisplayed> => {
    const item = await browser.storage.sync.get(STORAGE_KEY.CONTEXT_MENU_DISPLAYED);

    if (Object.keys(item).length === 0) {
        return STORAGE_INIT_VALUE.CONTEXT_MENU_DISPLAYED;
    }

    return item[STORAGE_KEY.CONTEXT_MENU_DISPLAYED] as ContextMenuDisplayed;
};

export const setTemplateText = async (text: string) => {
    await browser.storage.sync.set({ [STORAGE_KEY.TEMPLATE_TEXT]: text });
};

export const getTemplateText = async (): Promise<string> => {
    const item = await browser.storage.sync.get(STORAGE_KEY.TEMPLATE_TEXT);

    if (Object.keys(item).length === 0) {
        return STORAGE_INIT_VALUE.TEMPLATE_TEXT;
    }

    return item[STORAGE_KEY.TEMPLATE_TEXT] as string;
};
