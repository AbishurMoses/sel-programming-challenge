import { Badge } from "@/components/ui/badge";

export function getRangeBadge(range: string) {
    switch (range) {
        case "normal":
            return (
                <Badge className="bg-green-500 text-white">
                    Normal Range
                </Badge>
            );
        case "high":
            return (
                <Badge className="bg-yellow-500 text-white">
                    High Range
                </Badge>
            );
        case "low":
            return (
                <Badge className="bg-amber-500 text-white">
                    Low Range
                </Badge>
            );
        case "high-high":
            return (
                <Badge className="bg-red-500 text-white">
                    Very High Range
                </Badge>
            );
        case "low-low":
            return (
                <Badge className="bg-red-500 text-white">
                    Very Low Range
                </Badge>
            );
        default:
            return <Badge>{range}</Badge>;
    }
}

export function getQualityBadge(quality: string) {
    switch (quality) {
        case "good":
            return (
                <Badge className="bg-green-500 text-white">
                    Good
                </Badge>
            );
        case "invalid":
            return (
                <Badge className="bg-red-500 text-white">
                    Invalid
                </Badge>
            );
        case "questionable":
            return (
                <Badge className="bg-yellow-500 text-white">
                    Questionable
                </Badge>
            );
        default:
            return <Badge>{quality}</Badge>;
    }
}