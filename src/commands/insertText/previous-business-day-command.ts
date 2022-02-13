import { searchPreviousBusinessDateTime } from '../../garoon/general';
import { getMyGroupEvents, getScheduleEvents } from '../../garoon/schedule';
import { getAllDayEventsIncluded, getSyntax } from '../../storage/storage';
import { SyntaxGeneratorFactory } from '../../syntax/syntax-generator-factory';
import { createEndOfTime, createStartOfTime } from '../../utils/date-time';
import { InsertTextCommand } from './insert-text-command';

export class PreviousBusinessDayCommand extends InsertTextCommand {
    protected async createSchedule(domain: string, groupId: string | null): Promise<string | null> {
        const dateTime = await searchPreviousBusinessDateTime(domain);
        const startTime = createStartOfTime(dateTime);
        const endTime = createEndOfTime(dateTime);
        const alldayEventsIncluded = await getAllDayEventsIncluded();
        const events =
            groupId === null
                ? await getScheduleEvents(domain, {
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
        return generator.createTitle(dateTime) + generator.getNewLine() + generator.createEvents(domain, events);
    }
}
