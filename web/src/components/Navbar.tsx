// import {
//     Tooltip,
//     TooltipContent,
//     TooltipTrigger,
// } from "@/components/ui/tooltip"
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Settings } from "lucide-react";
// import UserMenu from "./UserMenu";

export default function Navbar() {
    return (
        <nav className="w-full h-16 flex items-center justify-center sticky top-0 z-50 border-b backdrop-blur p-8">
            {/* <div className="flex items-center gap-2"> */}
            <p>Industrial Data Monitor </p>
            {/* </div> */}
            {/* <div className="flex items-center gap-4">
                <Dialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Settings className="h-5 w-5 cursor-pointer transition" />
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
                    <DialogContent className="w-full max-w-sm">
                        <UserMenu />
                    </DialogContent>
                </Dialog>
            </div> */}
        </nav>
    )
}
