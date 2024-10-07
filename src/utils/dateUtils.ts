export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const parseDate = (dateString: string): Date => {
    const date = new Date(dateString);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const getTodayUTC = (): Date => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};