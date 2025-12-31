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
            bgItem={
                <div
                    className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 -z-10 blur-lg"
                    style={{
                        backgroundImage:
                            'url(https://jellyfin.jan.run/Items/d209bd1d97e0caec59ec50fa1a9de910/Images/Backdrop/0?tag=v1&quality=90&token=7429c2ff85c64d5f8698df883847baab)',
                    }}
                />
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
