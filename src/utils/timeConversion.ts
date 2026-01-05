export function ticksToReadableTime(ticks: number): string {
    const totalSeconds = Math.floor(ticks / 10000000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        if (minutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

export function ticksToSeconds(ticks: number): number {
    return ticks / 10000000;
}

export function getEndsAt(durationTicks: number): Date {
    const durationMs = durationTicks / 10000;
    return new Date(new Date().getTime() + durationMs);
}
