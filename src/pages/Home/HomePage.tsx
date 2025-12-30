import Page from '../Page';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import LibraryItems from './LibraryItems';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const HomePage = () => {
    const { data: userViews } = useUserViews();

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
                {userViews && userViews.Items ? (
                    <>
                        {userViews.Items.map((view) => (
                            <>
                                {view.Id && view.Name && (
                                    <LibraryItems
                                        key={view.Id}
                                        libraryId={view.Id}
                                        libraryName={view.Name}
                                    />
                                )}
                            </>
                        ))}
                    </>
                ) : (
                    <p>Loading user views...</p>
                )}
            </div>
        </Page>
    );
};

export default HomePage;
