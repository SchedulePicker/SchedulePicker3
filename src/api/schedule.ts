import { assert, assertExists } from '../util/assert';
import { convertToEndOfDay, convertToStartOfDay, dateTime, DateTime } from '../util/date-time';
import { getScheduleEvents, ScheduleEvent } from './garoon-api';
import { getMyGroups } from './general';

export type HideEventSetting = {
    select: string;
    text: string;
};

export const HideEventConditions = {
    EventMenu: 'eventMenu',
    Subject: 'subject',
    CreatorName: 'creatorName',
    UpdaterName: 'updaterName',
};

type EventsQuery = {
    startTime: DateTime;
    endTime: DateTime;
    alldayEventsIncluded: boolean;
    hideEventSettings: HideEventSetting[];
    target?: {
        id: string;
        type: 'user';
    };
};

export type Event = {
    id: string;
    creator: {
        name: string;
    };
    updater: {
        name: string;
    };
    subject: string;
    startTime: DateTime;
    endTime: DateTime;
    eventType: 'REGULAR' | 'REPEATING';
    eventMenu: string;
    attendees: Array<{
        id: string;
        name: string;
    }>;
    visibilityType?: 'PUBLIC' | 'PRIVATE';
    isStartOnly: boolean;
    isAllDay: boolean;
    isContinuingFromYesterday: boolean;
    isContinuingToTomorrow: boolean;
};

type MyGroupEventsQuery = {
    groupId: string;
    startTime: DateTime;
    endTime: DateTime;
    alldayEventsIncluded: boolean;
    hideEventSettings: HideEventSetting[];
};

export type Member = {
    id: string;
    name: string;
};

export type MyGroupEvent = Event & {
    members: Member[];
};

const isEventTypeRegularOrRepeating = (
    eventType: 'REGULAR' | 'REPEATING' | 'ALL_DAY',
): eventType is 'REGULAR' | 'REPEATING' => eventType === 'REGULAR' || eventType === 'REPEATING';

const isNotHideEvent = (event: ScheduleEvent, hideEventSettings: HideEventSetting[]) => {
    let result: Boolean = true;
    for (const hideEventSetting of hideEventSettings) {
        if (result) {
            switch (hideEventSetting.select) {
                case HideEventConditions.EventMenu:
                    result = !event.eventMenu.includes(hideEventSetting.text);
                    break;
                case HideEventConditions.Subject:
                    result = !event.subject.includes(hideEventSetting.text);
                    break;
                case HideEventConditions.CreatorName:
                    result = !event.creator.name.includes(hideEventSetting.text);
                    break;
                case HideEventConditions.UpdaterName:
                    result = !event.updater.name.includes(hideEventSetting.text);
                    break;
                default:
                    break;
            }
        }
    }
    return result;
};

const convertToEvent = (scheduleEvent: ScheduleEvent, queryStartTime: DateTime, queryEndTime: DateTime): Event => {
    let startTime = dateTime(scheduleEvent.start.dateTime);
    let endTime = scheduleEvent.isStartOnly ? null : dateTime(scheduleEvent.end.dateTime);

    if (endTime === null) {
        endTime = convertToEndOfDay(queryEndTime);
    }

    const isContinuingFromYesterday = startTime.isBefore(queryStartTime, 'day');
    if (isContinuingFromYesterday) {
        startTime = convertToStartOfDay(queryStartTime);
    }

    const isContinuingToTomorrow = endTime.isAfter(queryEndTime, 'day');
    if (isContinuingToTomorrow) {
        endTime = convertToEndOfDay(queryEndTime);
    }

    const isPrivateEvent = scheduleEvent.visibilityType === 'PRIVATE';
    const subject = isPrivateEvent ? '非公開予定' : scheduleEvent.subject;
    const eventMenu = isPrivateEvent ? '' : scheduleEvent.eventMenu;

    assert(
        isEventTypeRegularOrRepeating(scheduleEvent.eventType),
        `Error: ${scheduleEvent.subject} event type is "ALL_DAY"`,
    );

    return {
        id: scheduleEvent.id,
        creator: {
            name: scheduleEvent.creator.name,
        },
        updater: {
            name: scheduleEvent.updater.name,
        },
        subject,
        startTime,
        endTime,
        eventType: scheduleEvent.eventType,
        eventMenu,
        attendees: scheduleEvent.attendees.map((attendance) => ({
            id: attendance.id,
            name: attendance.name,
        })),
        visibilityType: scheduleEvent.visibilityType,
        isAllDay: scheduleEvent.isAllDay,
        isStartOnly: scheduleEvent.isStartOnly,
        isContinuingFromYesterday,
        isContinuingToTomorrow,
    };
};

const sortByTime = (event1: Event, event2: Event) => {
    if (event1.isAllDay) {
        return 1;
    }

    if (event2.isAllDay) {
        return -1;
    }

    if (event1.startTime.isSame(event2.startTime)) {
        if (event1.endTime.isSame(event2.endTime)) {
            return 0;
        }

        return event1.endTime.isAfter(event2.endTime) ? 1 : -1;
    }

    return event1.startTime.isAfter(event2.startTime) ? 1 : -1;
};

export const getEvents = async (domain: string, query: EventsQuery): Promise<Event[]> => {
    const events = await getScheduleEvents(domain, {
        rangeStart: query.startTime.toISOString(),
        rangeEnd: query.endTime.toISOString(),
        targetType: query.target?.type,
        target: query.target?.id,
    });

    return events
        .filter((event) =>
            isEventTypeRegularOrRepeating(event.eventType) && query.alldayEventsIncluded ? true : !event.isAllDay,
        ) // 期間予定を除外する && 終日予定を含まない設定の場合は終日予定を除外する
        .filter((event) => isNotHideEvent(event, query.hideEventSettings)) // 非表示の予定を除外する
        .map((event) => convertToEvent(event, query.startTime, query.endTime))
        .sort(sortByTime);
};

export const getMyGroupEvents = async (domain: string, query: MyGroupEventsQuery): Promise<MyGroupEvent[]> => {
    const { groupId, startTime, endTime, alldayEventsIncluded, hideEventSettings } = query;
    const myGroups = await getMyGroups(domain);
    const myGroupMembers = myGroups.find((group) => group.key === groupId)?.belong_member;
    assertExists(myGroupMembers);

    const eventsList = await Promise.all(
        myGroupMembers.map(async (userId) => {
            const events = await getEvents(domain, {
                startTime,
                endTime,
                alldayEventsIncluded,
                hideEventSettings,
                target: { id: userId, type: 'user' },
            });
            return events;
        }),
    );

    return eventsList
        .reduce((uniqueEvents: Event[], events: Event[]) => {
            const filter = events.filter((event) => !uniqueEvents.some((uniqueEvent) => uniqueEvent.id === event.id));
            return uniqueEvents.concat(filter);
        }, [])
        .sort(sortByTime)
        .map((event) => {
            const members = event.attendees.filter((attendee) => myGroupMembers.includes(attendee.id));
            return {
                ...event,
                members,
            };
        });
};

export const VisibleForTesting = {
    isEventTypeRegularOrRepeating,
    convertToScheduleEvent: convertToEvent,
    sortByTime,
};
