import { Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";

interface SymbolWatchProps {
    watchedSymbols: string[]
    removeFromWatch: (name: string) => void
}
export default function SymbolWatch({ watchedSymbols, removeFromWatch }: SymbolWatchProps) {
    const {
        symbolValues
    } = useSymbolPollingContext()

    const getSymbolQuality = (name: string) => {
        const detailQual = (
            symbolValues.get(name)?.rawData?.q as { detailQual?: Record<string, boolean> }
        )?.detailQual
        if (!detailQual) return true          
        return Object.values(detailQual).every(active => active) 
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Symbol Watch</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    {watchedSymbols.map((symbol) => {
                        return (
                            <div key={symbol} className="flex flex-row w-full justify-between">
                                <div className="flex flex-row gap-2">
                                    <p className={!getSymbolQuality(symbol) ? "text-destructive" : "text-muted-foreground"}>{symbol}</p>
                                </div>
                                <Button className="h-5 w-5" onClick={() => removeFromWatch(symbol)}><Minus /></Button>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}