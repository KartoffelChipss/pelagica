import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSeasons } from '@/hooks/api/useSeasons';
import { getBackdropUrl, getLogoUrl, getPrimaryImageUrl, getThumbUrl } from '@/utils/images';
import type { BaseItemDto, BaseItemPerson } from '@jellyfin/sdk/lib/generated-client/models';
import { ImageOff, Play, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEpisodes } from '@/hooks/api/useEpisodes';
import SectionScroller from '@/components/SectionScroller';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { ticksToReadableTime } from '@/utils/timeConversion';

const EpisodesRow = ({
    seasonId,
    title,
    seasonsLoading,
}: {
    seasonId: string;
    title?: React.ReactNode;
    seasonsLoading?: boolean;
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation('item');
    const { data: episodes, isLoading, error } = useEpisodes(seasonId);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    console.log('EpisodesRow render', { seasonId, episodes });

    const handleImageError = (itemId: string) => {
        setImageErrors((prev) => ({ ...prev, [itemId]: true }));
    };

    if (isLoading || seasonsLoading) {
        return (
            <SectionScroller
                title={title}
                items={Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="group min-w-48 lg:min-w-64 2xl:min-w-80 animate-pulse">
                        <Skeleton className="w-full aspect-video rounded-md" />
                        <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
                    </div>
                ))}
            />
        );
    }

    if (error) {
        return <p>Error loading episodes: {(error as Error).message}</p>;
    }

    return (
        <SectionScroller
            title={title}
            items={
                episodes?.map((item) => {
                    const watched = item.UserData?.PlaybackPositionTicks ?? 0;
                    const runtime = item.RunTimeTicks ?? 0;
                    const progress =
                        item.UserData?.PlayCount && item.UserData?.PlayCount >= 1 && watched <= 0
                            ? 100
                            : runtime > 0
                              ? (watched / runtime) * 100
                              : 0;

                    return (
                        <Link
                            to={`/item/${item.Id}`}
                            key={item.Id}
                            className="group min-w-48 lg:min-w-64 2xl:min-w-80"
                        >
                            <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                {imageErrors[item.Id!] ? (
                                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                                        <ImageOff className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={
                                                item.SeriesId
                                                    ? getPrimaryImageUrl(item.Id!, {
                                                          width: 416,
                                                      })
                                                    : getThumbUrl(item.Id!, {
                                                          width: 416,
                                                      })
                                            }
                                            alt={item.Name || t('no_title')}
                                            className="w-full h-full object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105"
                                            onError={() => handleImageError(item.Id!)}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div
                                                className="bg-black/60 rounded-full p-4 cursor-pointer hover:bg-black/75"
                                                role="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/play/${item.Id}`);
                                                }}
                                            >
                                                <Play className="w-6 h-6 text-white fill-white" />
                                            </div>
                                        </div>
                                        {item.RunTimeTicks && (
                                            <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                                                {ticksToReadableTime(item.RunTimeTicks)}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                                {progress > 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div
                                            style={{ width: `${progress}%` }}
                                            className="h-full bg-blue-500 transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-md line-clamp-1 text-ellipsis break-all">
                                {item.Name || 'No Title'}
                            </p>
                            <p className="mt-1 text-sm line-clamp-2 text-ellipsis break-all text-muted-foreground">
                                {item.Overview}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {item.IndexNumber !== undefined && (
                                    <Badge variant={'outline'}>
                                        S{item.ParentIndexNumber} E{item.IndexNumber}
                                    </Badge>
                                )}
                                {item.CommunityRating !== undefined && (
                                    <Badge variant={'outline'}>
                                        <Star size={14} />
                                        {item.CommunityRating?.toFixed(1)}
                                    </Badge>
                                )}
                                {item.PremiereDate && (
                                    <Badge variant={'outline'}>
                                        {new Date(item.PremiereDate).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </Badge>
                                )}
                            </div>
                        </Link>
                    );
                }) || []
            }
        />
    );
};

const PeopleRow = ({
    title,
    people,
    loading,
}: {
    title?: React.ReactNode;
    people: BaseItemPerson[] | undefined;
    loading?: boolean;
}) => {
    const [profilePictureErrors, setProfilePictureErrors] = useState<Record<string, boolean>>({});

    const handleProfilePictureError = (itemId: string) => {
        setProfilePictureErrors((prev) => ({ ...prev, [itemId]: true }));
    };

    if (loading) {
        return (
            <SectionScroller
                title={title}
                items={Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="group min-w-30 w-30">
                        <div className="aspect-square w-full rounded-full overflow-hidden">
                            <Skeleton className="h-full w-full" />
                        </div>
                        <Skeleton className="mt-2 h-4 w-3/4 rounded-md mx-auto" />
                        <Skeleton className="mt-1 h-3 w-1/2 rounded-md mx-auto" />
                    </div>
                ))}
            />
        );
    }

    return (
        <SectionScroller
            title={title}
            items={
                people?.map((person) => (
                    <Link to={`/item/${person.Id}`} key={person.Id} className="group min-w-30 w-30">
                        <div className="aspect-square w-full rounded-full overflow-hidden">
                            {profilePictureErrors[person.Id!] ? (
                                <div className="bg-muted w-full h-full flex items-center justify-center rounded-full text-2xl">
                                    {person.Name ? (
                                        person.Name.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                    ) : (
                                        <ImageOff className="w-12 h-12 text-muted-foreground" />
                                    )}
                                </div>
                            ) : (
                                <img
                                    src={getPrimaryImageUrl(person.Id!, {
                                        width: 120,
                                    })}
                                    alt={person.Name || 'No Name'}
                                    className="h-full w-full object-cover group-hover:opacity-75 transition-all group-hover:scale-105"
                                    onError={() => handleProfilePictureError(person.Id!)}
                                />
                            )}
                        </div>
                        <p className="mt-2 text-md line-clamp-1 text-ellipsis break-all text-center">
                            {person.Name || 'No Name'}
                        </p>
                        {person.Role && (
                            <p className="mt-1 text-sm line-clamp-2 text-ellipsis text-muted-foreground text-center">
                                {person.Role}
                            </p>
                        )}
                        {person.Type && (
                            <p className="mt-1 text-sm line-clamp-2 text-ellipsis text-muted-foreground text-center">
                                {person.Type}
                            </p>
                        )}
                    </Link>
                )) || []
            }
        />
    );
};

const DescriptionItem = ({
    label,
    items,
}: {
    label: string;
    items: { link: string | null; name: string }[];
}) => {
    if (items.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-wrap gap-2">
            <p className="text-muted-foreground">{label}:</p>
            <div className="flex flex-wrap gap-2 mt-1">
                {items.map((item) =>
                    item.link ? (
                        <Badge key={item.name} variant="secondary" asChild>
                            <Link to={item.link}>{item.name}</Link>
                        </Badge>
                    ) : (
                        <Badge key={item.name} variant="secondary">
                            {item.name}
                        </Badge>
                    )
                )}
            </div>
        </div>
    );
};

interface SeriesPageProps {
    item: BaseItemDto;
}

const SeriesPage = ({ item }: SeriesPageProps) => {
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
    const { data: seasons, isLoading, error } = useSeasons(item.Id || '');

    const effectiveSelectedSeason =
        selectedSeason ||
        (seasons && seasons.length > 0
            ? seasons.find((s) => s.IndexNumber === 1)?.Id || seasons[0]?.Id || ''
            : '');

    const firstSeasonId =
        seasons && seasons.length > 0
            ? seasons.find((s) => s.IndexNumber === 1)?.Id || seasons[0]?.Id
            : undefined;
    const { data: firstSeasonEpisodes } = useEpisodes(firstSeasonId || '');

    const episodeToContinue =
        firstSeasonEpisodes?.find(
            (ep) => !ep.UserData?.Played || (ep.UserData?.PlaybackPositionTicks ?? 0) > 0
        ) || firstSeasonEpisodes?.[0];

    const writers =
        item.People?.filter((person) => person.Type === 'Writer').filter((person) => person.Name) ||
        [];
    const directors =
        item.People?.filter((person) => person.Type === 'Director').filter(
            (person) => person.Name
        ) || [];
    const studios = item.Studios?.filter((studio) => studio.Name) || [];

    return (
        <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 h-3/4 w-full -z-10">
                <img
                    className="h-full w-full object-cover rounded-md"
                    src={getBackdropUrl(item.Id || '')}
                    alt={item.Name + ' Backdrop'}
                />
                <div className="absolute bottom-0 left-0 h-full w-full bg-linear-to-t from-background to-transparent rounded-md" />
            </div>
            <div className="h-2/5 flex items-center justify-center">
                <img
                    src={getLogoUrl(item.Id || '')}
                    alt={item.Name + ' Logo'}
                    className="relative mx-auto px-4 h-32 object-contain"
                />
            </div>
            <div className="relative z-10 p-2 sm:p-4">
                <div className="bg-background/30 backdrop-blur-md p-4 sm:p-8 rounded-md w-full flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row gap-6 max-w-7xl">
                        <img
                            src={getPrimaryImageUrl(item.Id || '')}
                            alt={item.Name + ' Primary'}
                            className="w-60 sm:w-70 object-cover rounded-md hidden sm:block"
                        />
                        <div className="flex flex-col gap-3">
                            <h2 className="text-4xl sm:text-5xl font-bold mt-2">{item.Name}</h2>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={'outline'}>{item.ProductionYear}</Badge>
                                <Badge variant={'outline'}>
                                    <Star size={14} />
                                    {item.CommunityRating?.toFixed(1)}
                                </Badge>
                                <Badge variant={'outline'}>{item.OfficialRating}</Badge>
                            </div>
                            {episodeToContinue && (
                                <Button className="w-fit mt-1" asChild>
                                    <Link to={`/item/${episodeToContinue.Id}`}>
                                        <Play />
                                        {episodeToContinue.UserData?.PlaybackPositionTicks
                                            ? 'Continue'
                                            : 'Play'}{' '}
                                        S{episodeToContinue.ParentIndexNumber} E
                                        {episodeToContinue.IndexNumber}
                                    </Link>
                                </Button>
                            )}
                            <p>{item.Overview}</p>
                            <DescriptionItem
                                label="Genres"
                                items={
                                    item.Genres?.map((genre) => ({
                                        link: null,
                                        name: genre,
                                    })) || []
                                }
                            />
                            <DescriptionItem
                                label="Writers"
                                items={writers.map((person) => ({
                                    link: `/item/${person.Id}`,
                                    name: person.Name!,
                                }))}
                            />
                            <DescriptionItem
                                label="Directors"
                                items={directors.map((person) => ({
                                    link: `/item/${person.Id}`,
                                    name: person.Name!,
                                }))}
                            />
                            <DescriptionItem
                                label="Studios"
                                items={studios.map((studio) => ({
                                    link: null,
                                    name: studio.Name!,
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <EpisodesRow
                            title={
                                <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-bold">Seasons </h3>
                                    <Select
                                        value={effectiveSelectedSeason || ''}
                                        onValueChange={(value) => setSelectedSeason(value || null)}
                                        disabled={isLoading || !seasons || seasons.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Season" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {seasons?.map((season) => (
                                                <SelectItem
                                                    key={season.Id}
                                                    value={season.Id || ''}
                                                    onSelect={() =>
                                                        setSelectedSeason(season.Id || null)
                                                    }
                                                >
                                                    {season.Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                            seasonsLoading={isLoading}
                            seasonId={effectiveSelectedSeason}
                        />
                        {error && <p>Error loading seasons: {(error as Error).message}</p>}
                    </div>
                    <div>
                        <PeopleRow
                            title={<h3 className="text-3xl font-bold">Cast & Crew</h3>}
                            people={item.People || []}
                            loading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeriesPage;
