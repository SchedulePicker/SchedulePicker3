import { ContextMenuId, CONTEXT_MENU_ID, ItemType, VisibleForTesting } from '../context-menu-builder';

const createItem = (
    id: string,
    title: string,
    type: ItemType,
    options: { checked?: boolean; parentId?: ContextMenuId },
) => {
    const { checked, parentId } = options;
    return {
        id,
        title,
        type,
        checked,
        parentId: parentId ? parentId : CONTEXT_MENU_ID.ROOT,
        contexts: ['editable'],
    };
};

describe('ContextMenuBuilder', () => {
    const { ContextMenuBuilder } = VisibleForTesting;
    test('build()', () => {
        const expectItems = [
            {
                id: CONTEXT_MENU_ID.ROOT,
                title: 'SchedulePicker',
                type: 'normal',
                contexts: ['editable'],
            },
            createItem(CONTEXT_MENU_ID.TODAY, '今日の予定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.TOMORROW, '明日の予定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.YESTERDAY, '昨日の予定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.NEXT_BUSINESS_DAY, '翌営業日の予定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.PREVIOUS_BUSINESS_DAY, '前営業日の予定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.SPECIFIED_DAY, '指定日の予定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.TEMPLATE, 'テンプレート', 'normal', {}),
            createItem(CONTEXT_MENU_ID.SETTINGS, '設定', 'normal', {}),
            createItem(CONTEXT_MENU_ID.MYSELF, '自分の予定', 'normal', { parentId: CONTEXT_MENU_ID.TODAY }),
            createItem(CONTEXT_MENU_ID.HTML, 'HTML', 'radio', { checked: true }),
            createItem(CONTEXT_MENU_ID.MARKDOWN, 'Markdown', 'radio', { checked: false }),
        ];
        const items = new ContextMenuBuilder()
            .addToday()
            .addTomorrow()
            .addYesterDay()
            .addNextBusinessDay()
            .addPreviousBusinessDay()
            .addSpecifiedDay()
            .addTemplate()
            .addSettings()
            .addMenuItem(CONTEXT_MENU_ID.MYSELF, '自分の予定', 'normal', { parentId: CONTEXT_MENU_ID.TODAY })
            .addHtml(true)
            .addMarkdown(false)
            .build();
        expect(items).toEqual(expectItems);
    });
});
