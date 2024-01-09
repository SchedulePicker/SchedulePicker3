import { searchPreviousBusinessDateTime } from '../../api/general';
import { getMyGroupEvents, getEvents } from '../../api/schedule';
import { getAllDayEventsIncluded, getHideEventSettings, getSyntax } from '../../storage';
import { SyntaxGeneratorFactory } from '../../syntax/syntax-generator-factory';
import { convertToEndOfDay, convertToStartOfDay } from '../../util/date-time';
import { AbstractInsertEventsCommand } from './abstract-insert-events-command';

export class PreviousBusinessDayCommand extends AbstractInsertEventsCommand {
    protected async getEvents(domain: string, groupId: string | null): Promise<string | null> {
        const previousBusinessDayDateTime = await searchPreviousBusinessDateTime(domain);
        const startTime = convertToStartOfDay(previousBusinessDayDateTime);
        const endTime = convertToEndOfDay(previousBusinessDayDateTime);
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
            generator.createTitle(previousBusinessDayDateTime) +
            generator.getNewLine() +
            generator.createEvents(domain, events)
        );
    }
}
