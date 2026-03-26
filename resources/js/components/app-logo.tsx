import { useContext } from 'react';
import { SidebarContextProvider } from './ui/sidebar';

export default function AppLogo() {
    const content = useContext(SidebarContextProvider);
    return (
        <>
            <div className="">
                {content?.open == true  ? (
                    <>
                        <img src="/logo.png" alt="" className="h-12" />
                    </>
                ) : (
                    <>
                        <img src="/icon.png" alt="" className=" w-full " />
                    </>
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold"></span>
            </div>
        </>
    );
}
