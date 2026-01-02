import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import BaseMediaPage from './BaseMediaPage';
import DescriptionItem from './DescriptionItem';
import { Badge } from '@/components/ui/badge';
import { getPrimaryImageUrl } from '@/utils/images';
import { Star } from 'lucide-react';

interface MoviePageProps {
    item: BaseItemDto;
}

const MoviePage = ({ item }: MoviePageProps) => {
    const writers =
        item.People?.filter((person) => person.Type === 'Writer').filter((person) => person.Name) ||
        [];
    const directors =
        item.People?.filter((person) => person.Type === 'Director').filter(
            (person) => person.Name
        ) || [];
    const studios = item.Studios?.filter((studio) => studio.Name) || [];

    return (
        <BaseMediaPage item={item}>
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl">
                <img
                    src={getPrimaryImageUrl(item.Id || '')}
                    alt={item.Name + ' Primary'}
                    className="w-60 sm:w-70 object-cover rounded-md hidden sm:block"
                />
                <div className="flex flex-col gap-3">
                    <h2 className="text-4xl sm:text-5xl font-bold mt-2">{item.Name}</h2>
                    <div className="flex flex-wrap gap-2">
                        {item.ProductionYear && (
                            <Badge variant={'outline'}>{item.ProductionYear}</Badge>
                        )}
                        {item.CommunityRating && (
                            <Badge variant={'outline'}>
                                <Star size={14} />
                                {item.CommunityRating?.toFixed(1)}
                            </Badge>
                        )}
                        {item.OfficialRating && (
                            <Badge variant={'outline'}>{item.OfficialRating}</Badge>
                        )}
                    </div>
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
        </BaseMediaPage>
    );
};

export default MoviePage;
