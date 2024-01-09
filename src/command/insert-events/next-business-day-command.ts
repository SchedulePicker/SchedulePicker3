import { searchNextBusinessDateTime } from '../../api/general';
import { getMyGroupEvents, getEvents } from '../../api/schedule';
import { getAllDayEventsIncluded, getHideEventSettings, getSyntax } from '../../storage';
import { SyntaxGeneratorFactory } from '../../syntax/syntax-generator-factory';
import { convertToEndOfDay, convertToStartOfDay } from '../../util/date-time';
import { AbstractInsertEventsCommand } from './abstract-insert-events-command';

export class NextBusinessDayCommand extends AbstractInsertEventsCommand {
    protected async getEvents(domain: string, groupId: string | null): Promise<string | null> {
        const nextBusinessDayDateTime = await searchNextBusinessDateTime(domain);
        const startTime = convertToStartOfDay(nextBusinessDayDateTime);
        const endTime = convertToEndOfDay(nextBusinessDayDateTime);
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
            generator.createTitle(nextBusinessDayDateTime) +
            generator.getNewLine() +
            generator.createEvents(domain, events)
        );
    }
}
