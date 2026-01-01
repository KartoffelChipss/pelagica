import SectionScroller from '@/components/SectionScroller';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContinueWatchingDetailLine, ContinueWatchingTitleLine } from '@/hooks/api/useConfig';
import { useContinueWatchingAndNextUp } from '@/hooks/api/useContinueWatchingAndNextUp';
import { getThumbUrl, getPrimaryImageUrl } from '@/utils/images';
import { ticksToReadableTime } from '@/utils/timeConversion';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Dot } from 'lucide-react';
import { Link } from 'react-router';

interface ContinueWatchingRowProps {
    title: string;
    titleLine?: ContinueWatchingTitleLine;
    detailLine?: ContinueWatchingDetailLine[];
}

function getTitleLineText(
    item: BaseItemDto,
    titleLine: ContinueWatchingTitleLine | undefined
): string {
    const itemNameWithFallback = item.Name || item.SeriesName || 'No Title';

    switch (titleLine) {
        case 'ItemTitle':
            return item.Name || 'No Title';
        case 'ParentTitle':
            return item.SeriesName || item.Name || 'No Title';
        default: // 'ItemTitleWithEpisodeInfo'
            if (item.SeriesId && item.ParentIndexNumber && item.IndexNumber) {
                return `S${item.ParentIndexNumber}:E${item.IndexNumber} - ${itemNameWithFallback}`;
            } else {
                return itemNameWithFallback;
            }
    }
}

function getDetailLineText(
    item: BaseItemDto,
    detailLine: ContinueWatchingDetailLine | undefined
): string | null {
    const watched = item.UserData?.PlaybackPositionTicks ?? 0;
    const runtime = item.RunTimeTicks ?? 0;

    switch (detailLine) {
        case 'ProgressPercentage':
            if (runtime > 0) {
                const progress = (watched / runtime) * 100;
                return `${progress.toFixed(1)}% watched`;
            }
            return 'Progress unknown';
        case 'TimeRemaining':
            if (runtime > 0) {
                const remainingTicks = Math.max(runtime - watched, 0);
                return `${ticksToReadableTime(remainingTicks)} left`;
            }
            return 'Time remaining unknown';
        case 'EndsAt':
            if (runtime > 0) {
                const remainingTicks = Math.max(runtime - watched, 0);
                const endsAt = new Date(Date.now() + remainingTicks / 10000); // ticks to ms
                return `Ends at ${endsAt.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                })}`;
            }
            return 'End time unknown';
        case 'EpisodeInfo':
            if (item.SeriesId && item.ParentIndexNumber && item.IndexNumber) {
                return `S${item.ParentIndexNumber}:E${item.IndexNumber}`;
            }
            return null;
        case 'ParentTitle':
            return item.SeriesName || null;
        case 'None':
            return null;
        default:
            return '';
    }
}

const ContinueWatchingRow = ({ title, titleLine, detailLine }: ContinueWatchingRowProps) => {
    const {
        data: continueWatchingData,
        isLoading,
        error,
    } = useContinueWatchingAndNextUp(localStorage.getItem('jf_user'));

    return (
        <>
            {error && <p>Error loading continue watching items: {String(error)}</p>}
            {((continueWatchingData && continueWatchingData.items.length > 0) || isLoading) && (
                <SectionScroller
                    title={title || 'Continue Watching'}
                    items={
                        isLoading || !continueWatchingData
                            ? Array.from({ length: 5 }).map((_, index) => (
                                  <div
                                      key={index}
                                      className="group min-w-48 lg:min-w-64 2xl:min-w-80"
                                  >
                                      <Skeleton className="w-full aspect-video rounded-md mb-2" />
                                      <Skeleton className="w-32 lg:w-40 2xl:w-48 h-4 mb-2" />
                                      <Skeleton className="w-40 lg:w-52 2xl:w-64 h-3" />
                                  </div>
                              ))
                            : continueWatchingData.items.map((item) => {
                                  const watched = item.UserData?.PlaybackPositionTicks ?? 0;
                                  const runtime = item.RunTimeTicks ?? 0;
                                  const progress = runtime > 0 ? (watched / runtime) * 100 : 0;

                                  return (
                                      <Link
                                          to={`/item/${item.Id}`}
                                          key={item.Id}
                                          className="group min-w-48 lg:min-w-64 2xl:min-w-80"
                                      >
                                          <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                              <img
                                                  src={
                                                      item.SeriesId
                                                          ? getPrimaryImageUrl(item.Id!)
                                                          : getThumbUrl(item.Id!)
                                                  }
                                                  alt={item.Name || 'No Title'}
                                                  className="w-full h-full object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105"
                                              />
                                              {progress > 0 && (
                                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                                      <div
                                                          style={{ width: `${progress}%` }}
                                                          className="h-full bg-blue-500 transition-all"
                                                      />
                                                  </div>
                                              )}
                                          </div>
                                          <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all">
                                              {getTitleLineText(item, titleLine)}
                                          </p>
                                          <div className="flex items-center space-x-0 text-xs text-muted-foreground overflow-hidden">
                                              {detailLine && detailLine.length > 0
                                                  ? detailLine.map((line, idx) => {
                                                        const detailText = getDetailLineText(
                                                            item,
                                                            line
                                                        );
                                                        if (!detailText) return null;

                                                        const isLast =
                                                            idx === detailLine.length - 1;

                                                        return (
                                                            <span
                                                                key={`${item.Id}-${line}`}
                                                                className={`flex items-center ${
                                                                    isLast
                                                                        ? 'min-w-0 flex-1'
                                                                        : 'whitespace-nowrap'
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`${
                                                                        isLast
                                                                            ? 'truncate'
                                                                            : 'whitespace-nowrap'
                                                                    }`}
                                                                >
                                                                    {detailText}
                                                                </span>
                                                                {!isLast && (
                                                                    <Dot className="w-5 text-muted-foreground shrink-0" />
                                                                )}
                                                            </span>
                                                        );
                                                    })
                                                  : null}
                                          </div>
                                      </Link>
                                  );
                              })
                    }
                />
            )}
        </>
    );
};

export default ContinueWatchingRow;
