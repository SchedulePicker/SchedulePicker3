import { getMyGroupEvents, getEvents } from '../../api/schedule';
import { getAllDayEventsIncluded, getHideEventSettings, getSyntax } from '../../storage';
import { SyntaxGeneratorFactory } from '../../syntax/syntax-generator-factory';
import { convertToEndOfDay, convertToStartOfDay, dateTime } from '../../util/date-time';
import { AbstractInsertEventsCommand } from './abstract-insert-events-command';

export class YesterdayCommand extends AbstractInsertEventsCommand {
    protected async getEvents(domain: string, groupId: string | null): Promise<string | null> {
        const yesterdayDateTime = dateTime().subtract(1, 'day');
        const startTime = convertToStartOfDay(yesterdayDateTime);
        const endTime = convertToEndOfDay(yesterdayDateTime);
        const alldayEventsIncluded = await getAllDayEventsIncluded();
        const hideEventSettings = await getHideEventSettings();
        const events =
            groupId === null
                ? await getEvents(domain, {
                      startTime,
                      endTime,
                      alldayEventsIncluded,
                      hideEventSettings,
                  })
                : await getMyGroupEvents(domain, {
                      groupId,
                      startTime,
                      endTime,
                      alldayEventsIncluded,
                      hideEventSettings,
                  });
        const syntax = await getSyntax();
        const generator = new SyntaxGeneratorFactory().create(syntax);
        return (
            generator.createTitle(yesterdayDateTime) + generator.getNewLine() + generator.createEvents(domain, events)
        );
    }
}
