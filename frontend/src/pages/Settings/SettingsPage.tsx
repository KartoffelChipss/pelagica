/* eslint-disable react-hooks/set-state-in-effect */
import { useTranslation } from 'react-i18next';
import Page from '../Page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DETAIL_BADGES,
    EPISODE_DISPLAYS,
    useConfig,
    useUpdateConfig,
    type DetailBadge,
} from '@/hooks/api/useConfig';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';

const StringInput = ({
    label,
    value,
    onChange,
    placeholder,
    description,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
}) => (
    <div className="mt-4">
        <Label htmlFor={label} className="mb-2">
            {label}
        </Label>
        {description && <p className="mb-2 text-sm text-muted-foreground">{description}</p>}
        <Input
            id={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

const BooleanInput = ({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <div className="mt-4 flex items-center gap-3">
        <Switch id={label} checked={checked} onCheckedChange={onChange} />
        <Label htmlFor={label}>{label}</Label>
    </div>
);

const SelectInput = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    description,
}: {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
}) => (
    <div className="mt-4">
        <Label htmlFor={label} className="mb-2">
            {label}
        </Label>
        {description && <p className="mb-2 text-sm text-muted-foreground">{description}</p>}
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => onChange(option.value)}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

const MultiSelectInput = ({
    label,
    options,
    selected,
    onChange,
    description,
}: {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    description?: string;
}) => (
    <div className="mt-4">
        <Label className="mb-2">{label}</Label>
        {description && <p className="mb-2 text-sm text-muted-foreground">{description}</p>}
        <MultiSelect options={options} selected={selected} onChange={onChange} />
    </div>
);

const SettingsPage = () => {
    const { t } = useTranslation('settings');
    const { config, loading, error } = useConfig();
    const { updateConfig, loading: updating } = useUpdateConfig();
    const [serverAddress, setServerAddress] = useState('');
    const [streamystatsUrl, setStreamystatsUrl] = useState('');
    const [showStreamystatsButton, setShowStreamystatsButton] = useState(false);
    const [episodeDisplay, setEpisodeDisplay] = useState<'grid' | 'row'>('row');
    const [showWatchlistButton, setShowWatchlistButton] = useState(false);
    const [favoriteButton, setFavoriteButton] = useState<string[]>([]);
    const [detailBadges, setDetailBadges] = useState<string[]>([]);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setServerAddress(config?.serverAddress || '');
        setStreamystatsUrl(config?.streamystatsUrl || '');
        setShowStreamystatsButton(config?.showStreamystatsButton || false);
        setEpisodeDisplay(config?.itemPage?.episodeDisplay || 'row');
        setShowWatchlistButton(config?.itemPage?.showWatchlistButton || false);
        setFavoriteButton(config?.itemPage?.favoriteButton || []);
        setDetailBadges(config?.itemPage?.detailBadges || []);
    }, [
        config?.serverAddress,
        config?.streamystatsUrl,
        config?.showStreamystatsButton,
        config?.itemPage?.episodeDisplay,
        config?.itemPage?.showWatchlistButton,
        config?.itemPage?.favoriteButton,
        config?.itemPage?.detailBadges,
    ]);

    const handleUpdateConfig = async () => {
        // update config takes in the whole config object, so we need to merge the existing config with the updated values
        if (config) {
            try {
                await updateConfig({
                    ...config,
                    serverAddress,
                    streamystatsUrl,
                    showStreamystatsButton,
                    itemPage: {
                        ...config.itemPage,
                        episodeDisplay,
                        showWatchlistButton,
                        favoriteButton:
                            favoriteButton.length > 0
                                ? (favoriteButton as BaseItemKind[])
                                : undefined,
                        detailBadges:
                            detailBadges.length > 0 ? (detailBadges as DetailBadge[]) : undefined,
                    },
                });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            } catch (e) {
                console.error('Error updating config:', e);
            }
        }
    };

    if (loading) {
        return (
            <Page title={t('title')} requiresAuth>
                Loading...
            </Page>
        );
    }

    if (error || !config) {
        return (
            <Page title={t('title')} requiresAuth>
                Error loading settings.
            </Page>
        );
    }

    return (
        <Page title={t('title')} requireAdmin requiresAuth>
            <Tabs defaultValue={'general'}>
                <TabsList>
                    <TabsTrigger value="general">{t('category_general')}</TabsTrigger>
                    <TabsTrigger value="homesections">{t('category_homesections')}</TabsTrigger>
                    <TabsTrigger value="itempage">{t('category_itempage')}</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="max-w-200">
                    <h1 className="mb-2 mt-2 text-2xl font-bold leading-none tracking-tight">
                        {t('category_general')}
                    </h1>
                    <StringInput
                        label={t('server_address_label')}
                        value={serverAddress}
                        onChange={setServerAddress}
                        placeholder={t('server_address_placeholder')}
                        description={t('server_address_description')}
                    />
                    <h2 className="mt-6 mb-2 text-xl font-semibold leading-none tracking-tight">
                        Streamystats
                    </h2>
                    <p className="mb-2 text-sm text-muted-foreground">
                        {t('streamystats_description')}
                    </p>
                    <StringInput
                        label={t('streamystats_url_label')}
                        value={streamystatsUrl}
                        onChange={setStreamystatsUrl}
                        placeholder={t('streamystats_url_placeholder')}
                    />
                    <BooleanInput
                        label={t('show_streamystats_button_label')}
                        checked={showStreamystatsButton}
                        onChange={setShowStreamystatsButton}
                    />
                </TabsContent>
                <TabsContent value="homesections">Home Sections Settings here</TabsContent>
                <TabsContent value="itempage" className="max-w-200">
                    <h1 className="mb-2 mt-2 text-2xl font-bold leading-none tracking-tight">
                        {t('category_itempage')}
                    </h1>
                    <SelectInput
                        label={t('episode_display_label')}
                        options={EPISODE_DISPLAYS.map((display) => ({
                            value: display,
                            label: t(`episode_display_${display}`),
                        }))}
                        value={episodeDisplay}
                        onChange={(value) => setEpisodeDisplay(value as 'grid' | 'row')}
                        description={t('episode_display_description')}
                    />
                    <BooleanInput
                        label={t('show_watchlist_button_label')}
                        checked={showWatchlistButton}
                        onChange={setShowWatchlistButton}
                    />
                    <MultiSelectInput
                        label={t('favorite_button_types_label')}
                        options={[
                            { value: 'Movie', label: t('movie') },
                            { value: 'Series', label: t('series') },
                            { value: 'Episode', label: t('episode') },
                            { value: 'BoxSet', label: t('box_set') },
                            { value: 'MusicAlbum', label: t('music_album') },
                            { value: 'Playlist', label: t('playlist') },
                        ]}
                        selected={favoriteButton}
                        onChange={setFavoriteButton}
                        description={t('favorite_button_types_description')}
                    />
                    <MultiSelectInput
                        label={t('detail_badges_label')}
                        options={DETAIL_BADGES.map((badge) => ({
                            value: badge,
                            label: t(`detail_badges_${badge}`),
                        }))}
                        selected={detailBadges}
                        onChange={setDetailBadges}
                        description={t('detail_badges_description')}
                    />
                </TabsContent>
            </Tabs>
            <Button className="mt-6" onClick={handleUpdateConfig} disabled={updating}>
                {updating ? (
                    t('saving')
                ) : saveSuccess ? (
                    <>
                        <Check /> {t('save_success')}
                    </>
                ) : (
                    t('save_settings')
                )}
            </Button>
        </Page>
    );
};

export default SettingsPage;
