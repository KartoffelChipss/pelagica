import Page from '../Page';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import { useConfig } from '@/hooks/api/useConfig';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import MediaBar from './MediaBar';
import ItemsRow from './ItemsRow';

const HomePage = () => {
    const { data: userViews } = useUserViews();
    const { config } = useConfig();

    return (
        <Page
            title="Home Page"
            requiresAuth={true}
            breadcrumbs={
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Home</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            }
        >
            <div className="flex flex-col gap-4 mt-4">
                {config.homeScreenSections?.map((section) => {
                    if (!section.enabled) return null;

                    switch (section.type) {
                        case 'mediaBar':
                            return (
                                <MediaBar
                                    key="mediaBar"
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
                                    key={section.title || 'itemsSection'}
                                    title={section.title}
                                    allLink={section.allLink}
                                    items={section.items}
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
