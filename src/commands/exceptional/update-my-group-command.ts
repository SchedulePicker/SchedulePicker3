import { Menus, Tabs } from 'webextension-polyfill';
import { LOADING_STATUS } from '../../utils/loading';
import { Command } from '../base/command';
import { getMyGroups } from '../../garoon/general';
import { setMyGroups } from '../../storage/storage';
import { assertExists } from '../../utils/asserts';
import { sendErrorMessage, sendLoadingStatus } from '../sender';

export class UpdateMyGroupCommand extends Command {
    async execute(_info: Menus.OnClickData, tab: Tabs.Tab) {
        assertExists(tab.id);
        assertExists(tab.url);
        const domain = new URL(tab.url).hostname;
        await sendLoadingStatus(tab.id, LOADING_STATUS.SHOW);

        try {
            const myGroups = await getMyGroups(domain);
            await setMyGroups(myGroups);
        } catch (error: unknown) {
            await sendErrorMessage(tab.id, 'Myグループの更新に失敗しました');
            throw error;
        } finally {
            await sendLoadingStatus(tab.id, LOADING_STATUS.HIDE);
        }
    }
}