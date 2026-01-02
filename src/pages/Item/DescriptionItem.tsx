import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router';

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

export default DescriptionItem;
