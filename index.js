import React, { useEffect, useRef, forwardRef } from 'react'
import VirtualScroll from './VirtualScroll'

const SmoothScrolling = forwardRef((props, ref) => {
    const parent = useRef(null);
    const scrollWrap = useRef(null);
    const scrollBarWrap = useRef(null);
    const scrollBarThumb = useRef(null);
    const vs = useRef(null);

    useEffect(()=>{
        vs.current = new VirtualScroll(parent.current, scrollWrap.current, scrollBarWrap.current, scrollBarThumb.current);
        vs.current.on();
        if(ref) ref.current = vs.current;
        
        return () => {
            if(vs.current) vs.current.destroy();
        }
    },[])

    return (
        <div ref={parent} className="scrollOuterWrap" style={{position:'relative'}}>
            <div ref={scrollWrap} className="scrollWrap">
                {props.children}
            </div>
            <div ref={scrollBarWrap} className="scrollBarWrap">
                <div ref={scrollBarThumb} className="scrollBarThumb"></div>
            </div>
        </div>
    )
})

export default SmoothScrolling