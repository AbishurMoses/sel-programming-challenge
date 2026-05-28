// https://dev.to/graciesharma/implementing-csv-data-export-in-react-without-external-libraries-3030
import { Button } from './ui/button';
import type { SymbolValue } from '@/types/api';

const ExportCSV = ({ data, fileName }: { data: Partial<SymbolValue> & { status: string }[]; fileName: string }) => {
    const downloadCSV = () => {
        // Convert the data array into a CSV string
        const csvString = [
            ["Symbol Name", "Value", "Timestamp", "Last Updated", "Status"],
            ...data.map((item: Partial<SymbolValue> & { status?: string }) => [item.symbolName, item.stVal, item.t, item.lastUpdated, item.status])
        ]
            .map(row => row.join(","))
            .join("\n");

        // Create a Blob from the CSV string
        const blob = new Blob([csvString], { type: 'text/csv' });

        // Generate a download link and initiate the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return <Button onClick={downloadCSV}>Export CSV</Button>;
};

export default ExportCSV;