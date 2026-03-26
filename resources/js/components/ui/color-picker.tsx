import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

function ColorPicker({ color, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full h-10 p-1 flex items-center gap-3"
                >
                    <div
                        className="h-full w-16 rounded-md border"
                        style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-sm">{color}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-3">
                <HexColorPicker color={color} onChange={onChange} />
                <div className="flex gap-2 mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setOpen(false)}
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default ColorPicker;
