'use client';

import { Rnd } from "react-rnd";

export const Editor = () => {
    return (
        <div className="relative m-8">
            <div className='relative 
                w-[300px]
                xl:w-[400px]
                2xl:w-[600px]
                aspect-[8/10]  
                pointer-events-none 
                bg-zinc-50
                shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)]
                '>
            </div>
            <Rnd
                default={{
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 250,
                }}
                className='bg-black opacity-50'
            >
            </Rnd>
        </div>
    );
};