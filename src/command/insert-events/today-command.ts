import { SyntaxGeneratorFactory } from '../../syntax/syntax-generator-factory';
import { convertToEndOfDay, convertToStartOfDay, dateTime } from '../../util/date-time';
import { getMyGroupEvents, getEvents } from '../../api/schedule';
import { getAllDayEventsIncluded, getSyntax } from '../../storage';
import { AbstractInsertEventsCommand } from './abstract-insert-events-command';

export class TodayCommand extends AbstractInsertEventsCommand {
    protected async getEvents(domain: string, groupId: string | null): Promise<string | null> {
        const now = dateTime();
        const startTime = convertToStartOfDay(now);
        const endTime = convertToEndOfDay(now);
        const alldayEventsIncluded = await getAllDayEventsIncluded();
        const events =
            groupId === null
                ? await getEvents(domain, {
                      startTime,
                      endTime,
                      alldayEventsIncluded,
                  })
                : await getMyGroupEvents(domain, {
                      groupId,
                      startTime,
                      endTime,
                      alldayEventsIncluded,
                  });
        const syntax = await getSyntax();
        const generator = new SyntaxGeneratorFactory().create(syntax);
        return generator.createTitle(now) + generator.getNewLine() + generator.createEvents(domain, events);
    }
}
