import { Member, MyGroupEvent, ScheduleEvent } from '../events/schedule';
import { DateTime } from '../util/date-time';
import { AbstractSyntaxGenerator } from './abstract-syntax-generator';
import { getEventMenuColorCode } from './event-menu-color';

export class MarkdownSyntaxGenerator extends AbstractSyntaxGenerator {
    createTitle(dateTime: DateTime) {
        return `[ ${dateTime.format('YYYY-MM-DD')} の予定 ]`;
    }

    createEvent(domain: string, event: ScheduleEvent | MyGroupEvent) {
        const timeRange = event.isAllDay
            ? this.createEventMenu('終日')
            : this.createTimeRange(event.startTime, event.endTime);
        const subject = this.createSubject(domain, event.id, event.subject);
        const eventMenu = event.eventMenu === '' ? null : this.createEventMenu(event.eventMenu);

        if (eventMenu === null) {
            return this.isMyGroupEvent(event)
                ? `${timeRange} ${subject} ${this.createMembers(event.members)}`
                : `${timeRange} ${subject}`;
        }

        return this.isMyGroupEvent(event)
            ? `${timeRange} ${eventMenu} ${subject} ${this.createMembers(event.members)}`
            : `${timeRange} ${eventMenu} ${subject}`;
    }

    createEvents(domain: string, events: ScheduleEvent[]) {
        return events
            .map((event) => `${this.createEvent(domain, event)}${this.getNewLine()}`)
            .join('')
            .replace(new RegExp(`${this.getNewLine()}$`), '');
    }

    getNewLine() {
        return '\n';
    }

    private createTimeRange(startTime: DateTime, endTime: DateTime) {
        const formattedStartTime = startTime.format('HH:mm');
        const formattedEndTime = endTime.format('HH:mm');
        return `${formattedStartTime}-${formattedEndTime}`;
    }

    private createEventMenu(eventMenu: string) {
        return `<span style="color: ${getEventMenuColorCode(eventMenu)};">[${eventMenu}]</span>`;
    }

    private createSubject(domain: string, eventId: string, subject: string) {
        return `[${subject}](https://${domain}/g/schedule/view.csp?event=${eventId})`;
    }

    private createMembers(members: Member[]) {
        return `<span style="color: #b99976;">(${members
            .map((member) => member.name)
            .join(', ')
            .replace(/, $/, '')})</span>`;
    }
}