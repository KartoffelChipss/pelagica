import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';

interface MoviePageProps {
    item: BaseItemDto;
}

const MoviePage = ({ item }: MoviePageProps) => {
    return (
        <div>
            <h2>{item.Name}</h2>
            <p>{item.Overview}</p>
            {/* Add more movie-specific details here */}
        </div>
    );
};

export default MoviePage;
