import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";
import { apiService } from "@/services/apiService";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { type Settings, type Theme } from "@/types/api";
import { toast } from "sonner";

type SettingsProps = { settings: Settings; setSetting: Dispatch<SetStateAction<Settings>> };


export default function UserMenu() {
    const [settings, setSetting] = useState<Settings>(() => apiService.getSettings() as Settings);
    const { setPollingInterval, startPolling, stopPolling } = useSymbolPollingContext();

    useEffect(() => {
        setPollingInterval(settings.pollingInterval);
        if (settings.autoStartPolling) {
            startPolling();
        } else {
            stopPolling();
        }
    }, []);

    const onSave = () => {
        setSetting({
            theme: settings.theme,
            pollingInterval: settings.pollingInterval,
            autoStartPolling: settings.autoStartPolling,
        })
        apiService.setSettings(settings as Settings);
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="flex justify-center">
                <CardTitle className="font-bold">Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Label>Theme</Label>
                    <ThemeSelector settings={settings} setSetting={setSetting} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Polling Interval</Label>
                    <PollingInterval settings={settings} setSetting={setSetting} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Auto-start Polling</Label>
                    <AutoStartPolling settings={settings} setSetting={setSetting} />
                </div>
            </CardContent>
            <CardAction className="flex justify-center w-full pt-6 gap-2">
                <Button
                    onClick={() => {
                        onSave()
                        toast("Saved Settings", {
                            action: {
                                label: "X",
                                onClick: () => { },
                            },
                        })
                    }}>Remember Changes</Button>
            </CardAction>
        </Card>
    )
}

export function ThemeSelector({ settings, setSetting }: SettingsProps) {
    const { setTheme } = useTheme();

    return (
        <RadioGroup
            value={settings.theme}
            onValueChange={(v) => {
                setSetting((prev: Settings) => ({ ...prev, theme: v as Theme }));
                setTheme(v as Theme)
            }}
            className="w-fit flex flex-row"
        >
            <div className="flex items-center gap-3">
                <RadioGroupItem value="auto" id="theme-auto" />
                <Label htmlFor="theme-auto">Auto</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
            </div>
        </RadioGroup>
    )
}

export function PollingInterval({ settings, setSetting }: SettingsProps) {
    const { setPollingInterval } = useSymbolPollingContext();
    return (
        <RadioGroup
            value={(settings.pollingInterval / 1000).toString()}
            onValueChange={(v) => {
                setSetting((prev: Settings) => ({ ...prev, pollingInterval: Number(v) * 1000 }));
                setPollingInterval(Number(v) * 1000)
            }}
            className="w-fit flex flex-row">
            <div className="flex items-center gap-3">
                <RadioGroupItem value="1" id="r1" />
                <Label htmlFor="r1">1s</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="2" id="r2" />
                <Label htmlFor="r2">2s</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="5" id="r3" />
                <Label htmlFor="r3">5s</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="10" id="r4" />
                <Label htmlFor="r4">10s</Label>
            </div>
        </RadioGroup>
    )
}

export function AutoStartPolling({ settings, setSetting }: SettingsProps) {
    const { startPolling, stopPolling } = useSymbolPollingContext();
    return (
        <RadioGroup
            value={settings.autoStartPolling ? "on" : "off"}
            onValueChange={(v) => {
                if (v === "on") {
                    startPolling();
                } else {
                    stopPolling();
                }
                setSetting((prev: Settings) => ({ ...prev, autoStartPolling: v === "on" }));
            }}
            className="w-fit flex flex-row">
            <div className="flex items-center gap-3">
                <RadioGroupItem value="on" id="r1" />
                <Label htmlFor="r1">On</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="off" id="r2" />
                <Label htmlFor="r2">Off</Label>
            </div>
        </RadioGroup>
    )
}