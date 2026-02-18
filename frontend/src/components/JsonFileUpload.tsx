import FileDropInput from './FileDropInput';

interface JsonFileUploadProps {
    onChange: (json: string | null) => void;
    disabled?: boolean;
}

const JsonFileUpload = ({ onChange, disabled = false }: JsonFileUploadProps) => {
    const onFileChange = (file: File | null) => {
        if (!file) {
            onChange(null);
            return;
        }

        if (file.type !== 'application/json') return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            onChange(result);
        };
        reader.readAsText(file);
    };

    return <FileDropInput onChange={onFileChange} accept="application/json" disabled={disabled} />;
};

export default JsonFileUpload;
