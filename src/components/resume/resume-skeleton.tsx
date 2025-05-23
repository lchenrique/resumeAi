import { Skeleton } from "../ui/skeleton"

export const ResumeSkeleton = () => {
    return (
        <div className='w-full h-full flex flex-col gap-10 items-center p-6'>
            <Skeleton className="w-full h-[40px] rounded-lg" />
            <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
            </div>

            <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[40%]" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[40%]" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full"> 
                <div className="flex flex-col gap-2">   
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[40%]" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[40%]" />
                </div>
            </div>
            <div className="flex flex-col w-full gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    )
}

