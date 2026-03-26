import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRef } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer';
import { Textarea } from '../ui/textarea';
// toast
import { useState } from 'react';
import { toast } from 'sonner';

function StarRating({ rating, setRating }) {
    return (
        <>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-white cursor-pointer transition-colors ${rating >= star ? 'fill-white text-white' : 'fill-muted stroke-muted-foreground'} `}
                    >
                        <StarIcon className="h-6 w-6 fill-[inherit]" />
                    </button>
                ))}
            </div>
            <div className="text-primary font-medium">{rating > 0 ? `You rated this ${rating} out of 5 stars` : 'Select a rating'}</div>
        </>
    );
}

function StarIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
function MainForm({changeState}) {
    let textAreaRef = useRef(null);
    const [rating, setRating] = useState(0);
    const [processing, setProcessing] = useState(false);
    return (
        <>
            <form
                action=""
                onSubmit={async (e) => {
                    e.preventDefault();
                    setProcessing(true);
                    const formdata = new FormData();
                    formdata.append('feedback', textAreaRef.current?.value);
                    formdata.append('rating', rating);
                    try {
                        const res = await fetch('/a/feedback/sms', {
                            method: 'POST',
                            body: formdata,
                        });
                        const responsJson = await res.json();
                        if (responsJson.status == true) {
                            toast.success(responsJson?.message);
                            changeState(false);
                        } else {
                            toast.error(responsJson?.message);
                        }
                    } catch (error) {
                        console.log(error);
                        toast.error('an error occured , please try again later!');
                    } finally {
                        setProcessing(false);
                    }
                }}
            >
                <Textarea ref={textAreaRef} className="border-primary focus:ring-primary" placeholder="Type your feedback here..." />
                <div className="rating-section p-3">
                    {/* rating */}
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                <Button variant={'default'} disabled={processing} className="my-2">
                    {processing ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                                <radialGradient id="a11" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
                                    <stop offset="0" stop-color="#FFFFFF"></stop>
                                    <stop offset=".3" stop-color="#FFFFFF" stop-opacity=".9"></stop>
                                    <stop offset=".6" stop-color="#FFFFFF" stop-opacity=".6"></stop>
                                    <stop offset=".8" stop-color="#FFFFFF" stop-opacity=".3"></stop>
                                    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop>
                                </radialGradient>
                                <circle
                                    transform-origin="center"
                                    fill="none"
                                    stroke="url(#a11)"
                                    stroke-width="19"
                                    stroke-linecap="round"
                                    stroke-dasharray="200 1000"
                                    stroke-dashoffset="0"
                                    cx="100"
                                    cy="100"
                                    r="70"
                                >
                                    <animateTransform
                                        type="rotate"
                                        attributeName="transform"
                                        calcMode="spline"
                                        dur="2"
                                        values="360;0"
                                        keyTimes="0;1"
                                        keySplines="0 0 1 1"
                                        repeatCount="indefinite"
                                    ></animateTransform>
                                </circle>
                                <circle
                                    transform-origin="center"
                                    fill="none"
                                    opacity=".2"
                                    stroke="#FFFFFF"
                                    stroke-width="19"
                                    stroke-linecap="round"
                                    cx="100"
                                    cy="100"
                                    r="70"
                                ></circle>
                            </svg>
                        </>
                    ) : (
                        ' Send Feedback'
                    )}
                </Button>
            </form>
        </>
    );
}
function FeedBackForm({ state = true, changeState }) {
    const isDesktop = useIsMobile();

    const Layout = ({ children }) => {
        return !isDesktop ? (
            <>
                <Dialog open={state} onOpenChange={changeState}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="hidden">
                            Feedback
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Send Feedback</DialogTitle>
                            <DialogDescription>We appreciate your feedback!</DialogDescription>
                        </DialogHeader>
                        {children}
                    </DialogContent>
                </Dialog>
            </>
        ) : (
            <>
                <Drawer open={state} onOpenChange={changeState}>
                    <DrawerTrigger asChild>
                        <Button variant="outline" className="hidden">
                            Feedback
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className="text-left">
                            <DrawerTitle>Send Feedback</DrawerTitle>
                            <DrawerDescription>We appreciate your feedback!</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-5">{children}</div>
                        <DrawerFooter className="pt-2">
                            <DrawerClose asChild>
                                <Button variant="outline" className="max-w-min">
                                    Cancel
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </>
        );
    };
    return (
        <>
            <Layout>
                <MainForm changeState={changeState} />
            </Layout>
        </>
    );
}

export default FeedBackForm;
