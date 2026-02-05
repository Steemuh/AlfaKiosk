interface UseAuthChangeProps {
    saleorApiUrl: string;
    onSignedIn?: () => void;
    onSignedOut?: () => void;
}
declare const useAuthChange: ({ saleorApiUrl, onSignedOut, onSignedIn }: UseAuthChangeProps) => void;

export { useAuthChange };
