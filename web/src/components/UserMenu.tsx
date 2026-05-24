import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "./ui/button";

export default function UserMenu() {
    return (
        <Card className="w-full">
            <CardHeader className="flex justify-center">
                <CardTitle className="font-bold">Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Label>Theme</Label>
                    <ThemeSelector />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Polling Interval</Label>
                    <PollingInterval />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Auto-start Polling</Label>
                    <AutoStartPolling />
                </div>
            </CardContent>
            <CardAction className="flex justify-center w-full">
                <Button >Save Changes</Button>
                 <Button >Cancel Changes</Button>
            </CardAction>
        </Card>
    )
}

export function ThemeSelector() {
    return (
        <RadioGroup defaultValue="auto" className="w-fit flex flex-row">
            <div className="flex items-center gap-3">
                <RadioGroupItem value="auto" id="r1" />
                <Label htmlFor="r1">Auto</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="light" id="r2" />
                <Label htmlFor="r2">Light</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="dark" id="r3" />
                <Label htmlFor="r3">Dark</Label>
            </div>
        </RadioGroup>
    )
}

export function PollingInterval() {
    return (
        <RadioGroup defaultValue="5" className="w-fit flex flex-row">
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

export function AutoStartPolling() {
    return (
        <RadioGroup defaultValue="off" className="w-fit flex flex-row">
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

// Theme selector: Auto / Light / Dark
// Polling interval: 1s / 2s / 5s / 10s
// Auto-start polling: On / Off