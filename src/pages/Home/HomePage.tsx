import Page from '../Page';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import { useConfig } from '@/hooks/api/useConfig';
import MediaBar from './MediaBar';
import ItemsRow from './ItemsRow';
import ContinueWatchingRow from './ContinueWatchingRow';

function sectionTitleToIdWithRandomSuffix(title: string): string {
    const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${sanitizedTitle}-${randomSuffix}`;
}

const HomePage = () => {
    const { data: userViews } = useUserViews();
    const { config } = useConfig();

    return (
        <Page title="Home Page" requiresAuth={true}>
            <div className="flex flex-col gap-4">
                {config.homeScreenSections?.map((section) => {
                    if (!section.enabled) return null;

                    switch (section.type) {
                        case 'continueWatching':
                            return (
                                <ContinueWatchingRow
                                    key={sectionTitleToIdWithRandomSuffix(
                                        section.title || 'continueWatching'
                                    )}
                                    title={section.title || 'Continue Watching'}
                                    titleLine={section.titleLine}
                                    detailLine={section.detailLine}
                                />
                            );

                        case 'mediaBar':
                            return (
                                <MediaBar
                                    key={sectionTitleToIdWithRandomSuffix(
                                        section.title || 'mediaBar'
                                    )}
                                    size={section.size}
                                    itemsConfig={section.items}
                                    title={section.title}
                                />
                            );

                        case 'recentlyAdded':
                            return userViews && userViews.Items ? (
                                <>
                                    {userViews.Items.map((view) => (
                                        <div key={view.Id}>
                                            {view.Id && view.Name && (
                                                <ItemsRow
                                                    title={'Recently Added in ' + view.Name}
                                                    items={{
                                                        libraryId: view.Id,
                                                        sortBy: ['DateCreated'],
                                                        sortOrder: 'Descending',
                                                        limit: section.limit || 10,
                                                    }}
                                                    detailFields={['PublishYear']}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p>Loading user views...</p>
                            );

                        case 'items':
                            return (
                                <ItemsRow
                                    key={sectionTitleToIdWithRandomSuffix(section.title || 'items')}
                                    title={section.title}
                                    allLink={section.allLink}
                                    items={section.items}
                                    detailFields={
                                        section.detailFields && section.detailFields.length > 0
                                            ? section.detailFields
                                            : ['PublishYear']
                                    }
                                />
                            );

                        default:
                            return null;
                    }
                })}
            </div>
        </Page>
    );
};

export default HomePage;
