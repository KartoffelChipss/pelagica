import { useParams } from 'react-router';
import Page from '../Page';
import { useItem } from '@/hooks/api/useItem';
import MoviePage from './MoviePage';
import SeriesPage from './SeriesPage';

const ItemPage = () => {
    const params = useParams<{ itemId: string }>();
    const itemId = params.itemId;

    const { data: item, isLoading, error } = useItem(itemId);

    return (
        <Page
            title={item ? `${item.Name}` : isLoading ? 'Loading...' : 'Item Not Found'}
            className="min-h-full"
        >
            {isLoading && <p>Loading...</p>}
            {error && <p>Error loading item details.</p>}
            {item && item.Type === 'Movie' && <MoviePage item={item} />}
            {item && item.Type === 'Series' && <SeriesPage item={item} />}
        </Page>
    );
};

export default ItemPage;
