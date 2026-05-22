import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "./ui/button"

export default function AuthenticationForm() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="flex justify-center">
                <CardTitle className="font-bold">Industrial Data Monitor</CardTitle>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Server URL</Label>
                            <Input
                                id="text"
                                type="text"
                                placeholder="https://192.168.3.2"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Username</Label>
                            <Input
                                id="text"
                                type="text"
                                placeholder="abishur"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                    </div>
                </form>

            </CardContent>
            <CardAction className="flex justify-center w-full">
                <Button >Connect to Server</Button>
            </CardAction>
        </Card>
    )
}