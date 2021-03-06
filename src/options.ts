import DOMPurify from 'dompurify';
import { i18n } from 'webextension-polyfill';
import { buildContextMenu } from './context-menu/operation';
import {
    getAllDayEventsIncluded,
    getContextMenuDisplayed,
    getSyntax,
    getTemplateText,
    getToUseMyGroup,
    setAllDayEventsIncluded,
    setContextMenuDisplayed,
    setSyntax,
    setTemplateText,
    setToUseMyGroup,
} from './storage';
import { assert } from './util/assert';
import { isButtonElement, isInputElement, isTextareaElement } from './util/type-check';

const setup = async () => {
    const saveButton = document.querySelector('.save-button');
    const todayInput = document.querySelector('#today');
    const tomorrowInput = document.querySelector('#tomorrow');
    const yesterdayInput = document.querySelector('#yesterday');
    const nextBusinessDayInput = document.querySelector('#next-business-day');
    const previousBusinessDayInput = document.querySelector('#previous-business-day');
    const specifiedDayInput = document.querySelector('#specified-day');
    const templateInput = document.querySelector('#template');
    const syntaxInput = document.querySelector('#syntax');
    const htmlInput = document.querySelector('#html');
    const markdownInput = document.querySelector('#markdown');
    const planeTextInput = document.querySelector('#plane-text');
    const alldayEventsShownInput = document.querySelector('#allday-events-shown');
    const useMyGroupInput = document.querySelector('#use-my-group');
    const templateTextarea = document.querySelector('.template-setting__textarea');
    assert(isButtonElement(saveButton));
    assert(isInputElement(todayInput));
    assert(isInputElement(tomorrowInput));
    assert(isInputElement(yesterdayInput));
    assert(isInputElement(nextBusinessDayInput));
    assert(isInputElement(previousBusinessDayInput));
    assert(isInputElement(specifiedDayInput));
    assert(isInputElement(templateInput));
    assert(isInputElement(syntaxInput));
    assert(isInputElement(htmlInput));
    assert(isInputElement(markdownInput));
    assert(isInputElement(planeTextInput));
    assert(isInputElement(alldayEventsShownInput));
    assert(isInputElement(useMyGroupInput));
    assert(isTextareaElement(templateTextarea));

    const syncContextMenuDisplayed = async () => {
        const display = await getContextMenuDisplayed();
        todayInput.checked = display.today;
        tomorrowInput.checked = display.tomorrow;
        yesterdayInput.checked = display.yesterday;
        nextBusinessDayInput.checked = display.nextBusinessDay;
        previousBusinessDayInput.checked = display.previousBusinessDay;
        specifiedDayInput.checked = display.specifiedDay;
        templateInput.checked = display.template;
        syntaxInput.checked = display.syntax;
    };

    const syncSyntax = async () => {
        const syntax = await getSyntax();
        htmlInput.checked = syntax === 'html';
        markdownInput.checked = syntax === 'markdown';
        planeTextInput.checked = syntax === 'planeText';
    };

    const saveContextMenuDisplayed = async () => {
        await setContextMenuDisplayed({
            today: todayInput.checked,
            tomorrow: tomorrowInput.checked,
            yesterday: yesterdayInput.checked,
            nextBusinessDay: nextBusinessDayInput.checked,
            previousBusinessDay: previousBusinessDayInput.checked,
            specifiedDay: specifiedDayInput.checked,
            template: templateInput.checked,
            syntax: syntaxInput.checked,
        });
    };

    const handleSaveButtonClick = async () => {
        saveButton.disabled = true;
        saveButton.classList.add('saving');
        await saveContextMenuDisplayed();

        if (htmlInput.checked) {
            await setSyntax('html');
        } else if (markdownInput.checked) {
            await setSyntax('markdown');
        } else if (planeTextInput.checked) {
            await setSyntax('planeText');
        }

        await setAllDayEventsIncluded(alldayEventsShownInput.checked);
        await setToUseMyGroup(useMyGroupInput.checked);
        await setTemplateText(templateTextarea.value);
        await buildContextMenu();

        setTimeout(() => {
            saveButton.classList.remove('saving');
            saveButton.disabled = false;
        }, 1800);
    };

    await syncContextMenuDisplayed();
    await syncSyntax();
    alldayEventsShownInput.checked = await getAllDayEventsIncluded();
    useMyGroupInput.checked = await getToUseMyGroup();
    templateTextarea.value = await getTemplateText();
    saveButton.addEventListener('click', handleSaveButtonClick);
};

const localize = () => {
    const replacedBody = document.body.innerHTML
        .toString()
        .replace(/__MSG_(\w+)__/g, (_, p1) => (p1 ? i18n.getMessage(p1) : ''));
    document.body.innerHTML = DOMPurify.sanitize(replacedBody, { ADD_ATTR: ['target'] });
};

window.addEventListener('DOMContentLoaded', async () => {
    localize();
    await setup();
});
