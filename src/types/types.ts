export type TField = {
    id: string;
    ip: string;
    country?: string;
    countryCode?: string;
    timezone?: string;
    error?: string;
    isLoading?: boolean;
};

export type TIpRowProps = {
    id: string;
    index: number;
    data: {
        ip: string;
        country?: string;
        countryCode?: string;
        timezone?: string;
        isLoading?: boolean;
        error?: string;
    };
    handleUpdate: (id: string, ip: string, country: string, countryCode: string, timezone: string) => void;
    handleRemove: (id: string) => void;
};

export type TFormValues = {
    ip: string;
};

export type TTimeControlContext = {
    startInterval: () => void;
    stopInterval: () => void;
}; 