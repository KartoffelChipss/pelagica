import Page from '../Page';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import { useConfig } from '@/hooks/api/useConfig';
import MediaBar from './MediaBar';
import ItemsRow from './ItemsRow';
import ContinueWatchingRow from './ContinueWatchingRow';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation('home');
    const { data: userViews } = useUserViews();
    const { config } = useConfig();

    return (
        <Page title={'Pelagica'} requiresAuth={true}>
            <div className="flex flex-col gap-4">
                {config.homeScreenSections?.map((section, index) => {
                    if (!section.enabled) return null;

                    switch (section.type) {
                        case 'continueWatching':
                            return (
                                <ContinueWatchingRow
                                    key={index}
                                    title={section.title || t('continue_watching')}
                                    titleLine={section.titleLine}
                                    detailLine={section.detailLine}
                                />
                            );

                        case 'mediaBar':
                            return (
                                <MediaBar
                                    key={index}
                                    size={section.size}
                                    itemsConfig={section.items}
                                    title={section.title}
                                />
                            );

                        case 'recentlyAdded':
                            return (
                                <div key={index} className="flex flex-col gap-4">
                                    {userViews && userViews.Items ? (
                                        <>
                                            {userViews.Items.map((view) => (
                                                <div key={view.Id} data-library-id={view.Id}>
                                                    {view.Id && view.Name && (
                                                        <ItemsRow
                                                            title={t('recently_added', {
                                                                category: view.Name,
                                                            })}
                                                            items={{
                                                                libraryId: view.Id,
                                                                sortBy: ['DateCreated'],
                                                                sortOrder: 'Descending',
                                                                limit: section.limit || 10,
                                                            }}
                                                            detailFields={['ReleaseYear']}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p>Loading user views...</p>
                                    )}
                                </div>
                            );

                        case 'items':
                            return (
                                <ItemsRow
                                    key={index}
                                    title={section.title}
                                    allLink={section.allLink}
                                    items={section.items}
                                    detailFields={
                                        section.detailFields && section.detailFields.length > 0
                                            ? section.detailFields
                                            : ['ReleaseYear']
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
