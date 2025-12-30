import { useRecentItems } from '@/hooks/api/useRecentItems';

interface LibraryItemsProps {
    libraryId: string;
    libraryName: string;
}

const LibraryItems = ({ libraryId, libraryName }: LibraryItemsProps) => {
    const { data: recentItems } = useRecentItems(libraryId);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Recent Items in {libraryName}:</h2>
            {recentItems ? (
                <ul className="list-disc list-inside">
                    {recentItems.map((item) => (
                        <li key={item.Id}>{item.Name}</li>
                    ))}
                </ul>
            ) : (
                <p>Loading recent items...</p>
            )}
        </div>
    );
};

export default LibraryItems;
