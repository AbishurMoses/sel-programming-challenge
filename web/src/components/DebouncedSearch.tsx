import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

const FRUITS = [
    "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry",
    "Cherry", "Coconut", "Cranberry", "Date", "Fig", "Grape",
    "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime", "Mango",
    "Nectarine", "Orange", "Papaya", "Peach", "Pear", "Pineapple",
    "Plum", "Pomegranate", "Raspberry", "Strawberry", "Watermelon",
]

export default function DebouncedSearch() {
    // User searches for a fruit (case-insensitive)
    // We must wait for 400ms before filterings (wait being once the user has paused typing)
    // Show searching while debounce is running
    // Once debounce is down show the matches
    // if no fruit matches then show no matches
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [input, setInput] = useState('')

    // Might actually be setTimeout not interval since we are filtering
    // after the 400ms is passed
    const interval = useRef<number | null>(null)

    useEffect(() => {
        interval.current = setTimeout(() => setDebouncedQuery(input), 400)

        return () => {
            if (interval.current) { clearTimeout(interval.current) }
        }

    }, [input])

    const isSearching = input !== debouncedQuery
    const results = FRUITS.filter(f =>
        f.toLowerCase().includes(debouncedQuery.toLowerCase())
    )

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Debounced Search</CardTitle>
            </CardHeader>
            <CardContent>
                <Input onChange={(e) => {
                    setInput(e.target.value)
                }} placeholder="Enter the fruit" />
                <div>
                    {isSearching && (
                        <p>Searching...</p>
                    )}
                    {input.length > 0 && results.length > 0 && !isSearching && (
                        results.map((fruit, index) => {
                            return <p key={index}>
                                {fruit}
                            </p>
                        }))
                    }
                    {input.length > 0 && results.length === 0 && !isSearching && (
                        <p>No matches</p>
                    )}
                    {input.length === 0 && (
                        <p></p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}