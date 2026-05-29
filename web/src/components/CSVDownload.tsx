// https://dev.to/graciesharma/implementing-csv-data-export-in-react-without-external-libraries-3030


import { Button } from './ui/button';
import type { SymbolValue } from '@/types/api';
import ConfirmDialog from './ConfirmDialog';
import { useState } from 'react';

const ExportCSV = ({ data, fileName }: { data: Partial<SymbolValue> & { status: string }[]; fileName: string }) => {
    const message = "Do you want to export this data to CSV?";
    const [displayConfirmation, setDisplayConfirmation] = useState(false);

    const downloadCSV = () => {
        const csvString = [
            ["Symbol Name", "Value", "Timestamp", "Last Updated", "Status"],
            ...data.map((item: Partial<SymbolValue> & { status?: string }) => [item.symbolName, item.stVal, item.t, item.lastUpdated, item.status])
        ]
            .map(row => row.join(","))
            .join("\n");

        const blob = new Blob([csvString], { type: 'text/csv' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download.csv';
        document.body.appendChild(link); 
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDisplayConfirmation(false);
    };

    return (
        <>
            <Button onClick={() => {
                setDisplayConfirmation((prev) => !prev);
            }}>Export CSV</Button>
            {
                displayConfirmation && <ConfirmDialog message={message} onConfirm={downloadCSV} onCancel={() => setDisplayConfirmation(false)} />
            }
        </>)
};

export default ExportCSV;